import { Injectable } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
  OnGatewayDisconnect,
  OnGatewayConnection,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from "socket.io";
import { AuthService } from "../auth/auth.service";
import { UsersService } from "./users.service";
import { clientStatus } from "./usersStatus";

interface UsersId {
  userId1: number;
  userId2: number;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server!: Server;

  constructor(private readonly authService: AuthService, private readonly userService: UsersService) { }

  afterInit() {
    this.server.use(async (socket, next) => {

      // check token validity return the userId if correspond to associated token
      // return null if token is invalid

      try {
        await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);
        next();
      } catch (error) {
        // console.log('invalid token - id')
        next(new WsException('invalid token'));
      }
    })
  }

  async handleConnection(socket: Socket) {
    console.log(`userId ${socket.data.userId} is connected from users gateway`);
    clientStatus.set(socket.data.userId, "Online");
    await this.sendStatusToFriends(socket.data.userId);
  }

  async handleDisconnect(client: Socket) {
    console.log("client " + client.id + " is disconnected from users gateway")
    clientStatus.set(client.data.userId, "Offline");
    await this.sendStatusToFriends(client.data.userId);
  }

  @SubscribeMessage('updateStatus')
  async updateStatus(@ConnectedSocket() client: Socket, @MessageBody() status: string) {
    clientStatus.set(client.data.userId, status);
    await this.sendStatusToFriends(client.data.userId);
  }

  @SubscribeMessage('printStatusMap')
  printStatusMap() {
    clientStatus.forEach((value, key) => {
      console.log("status [%s  %d]", value, key);
    })
  }

  @SubscribeMessage('pendingRequestSent')
  async pendingRequestSent(@MessageBody() targetId: number) {
    const targetSocketId = await this.getSocketIdWithId(targetId);
    if (!targetSocketId) return;

    this.server.to(targetSocketId).emit("refreshPendingRequests");
  }

  @SubscribeMessage('friendRequestAccepted')
  async friendRequestAccepted(@ConnectedSocket() client: Socket, @MessageBody() targetId: number) {
    const targetSocketId = await this.getSocketIdWithId(targetId);
    if (!targetSocketId) return;

    this.server.to(targetSocketId).emit("refreshFriendList");
    this.server.to(client.id).emit("refreshFriendList");
    this.server.to(client.id).emit("refreshPendingRequests");
    await this.sendStatusToFriends(client.data.userId);
    await this.sendStatusToFriends(targetId);
  }

  @SubscribeMessage('friendRequestRefused')
  async friendRequestRefused(@ConnectedSocket() client: Socket, @MessageBody() targetId: number) {
    const targetSocketId = await this.getSocketIdWithId(targetId);
    if (!targetSocketId) return;

    this.server.to(targetSocketId).emit("refreshPendingRequests");
    this.server.to(client.id).emit("refreshPendingRequests");
  }

  @SubscribeMessage('refreshFriendList')
  async refreshFriendList(@ConnectedSocket() client: Socket, @MessageBody() targetId: number) {
    const targetSocketId = await this.getSocketIdWithId(targetId);
    if (!targetSocketId) return;

    this.server.to(targetSocketId).emit("refreshFriendList");
    this.server.to(client.id).emit("refreshFriendList");
  }

  @SubscribeMessage('sendStatusToFriends')
  async sendStatusToFriends(@MessageBody() myId: number) {
    const myFriendsIDs = await this.userService.getFriendIds(myId);
    const socketMapping = new Map<number, string>();
    const clients = await this.server.fetchSockets();

    for (const client of clients) {
      socketMapping.set(client.data.userId, client.id)
    }

    myFriendsIDs.forEach((userId) => {
      const socketId = socketMapping.get(userId);
      if (socketId) {
        this.server.to(socketId).emit('statusChanged');
      }
    })
  }

  @SubscribeMessage('requestFriendsStatus')
  async requestFriendsStatus(@ConnectedSocket() client: Socket, @MessageBody() myId: number) {
    const myFriendsIDs = await this.userService.getFriendIds(myId);
    const myFriendsStatusMap = new Map<number, string>();

    myFriendsIDs.forEach((userId) => {
      const status = clientStatus.get(userId);
      if (status) {
        myFriendsStatusMap.set(userId, status);
      } else {
        myFriendsStatusMap.set(userId, "Offline");
      }
    })

    this.server.to(client.id).emit("friendStatus", JSON.stringify(Array.from(myFriendsStatusMap)));
  }

  @SubscribeMessage('areUsersFriend')
  async areUsersFriend(@MessageBody() usersId: UsersId) {
    return this.userService.areUsersFriends(usersId.userId1, usersId.userId2);
  }

  private async getSocketIdWithId(playerId: number): Promise<string | undefined> {
    const clients = await this.server.fetchSockets();
    for (const client of clients) {
      if (client.data.userId === playerId)
        return client.id;
    }

    return undefined;
  }
}
