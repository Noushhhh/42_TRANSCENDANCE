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
      try {
        await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);
        next();
      } catch (error) {
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
    if (typeof status !== 'string') {
      this.socketError(client.id, "Error trying to update live status");
      return;
    }
    clientStatus.set(client.data.userId, status);
    await this.sendStatusToFriends(client.data.userId);
  }

  @SubscribeMessage('pendingRequestSent')
  async pendingRequestSent(@ConnectedSocket() client: Socket, @MessageBody() targetId: number) {
    if (typeof targetId !== 'number') {
      this.socketError(client.id, "Error trying to refresh pending request");
      return;
    }

    const targetSocketId = await this.getSocketIdWithId(targetId);
    if (!targetSocketId) {
      this.socketError(client.id, "Error trying to refresh pending request");
      return;
    }

    this.server.to(targetSocketId).emit("refreshPendingRequests");
  }

  @SubscribeMessage('friendRequestAccepted')
  async friendRequestAccepted(@ConnectedSocket() client: Socket, @MessageBody() targetId: number) {
    if (typeof targetId !== 'number') {
      this.socketError(client.id, "Error trying to accept friend request");
      return;
    }

    const targetSocketId = await this.getSocketIdWithId(targetId);
    if (!targetSocketId) {
      this.socketError(client.id, "Error trying to accept friend request");
      return;
    }

    this.server.to(targetSocketId).emit("refreshFriendList");
    this.server.to(client.id).emit("refreshFriendList");
    this.server.to(client.id).emit("refreshPendingRequests");
    if (await this.sendStatusToFriends(client.data.userId) === -1
      || await this.sendStatusToFriends(targetId) === -1) {
      this.socketError(client.id, "Error trying to send status to friends");
      return;
    }
  }

  @SubscribeMessage('friendRequestRefused')
  async friendRequestRefused(@ConnectedSocket() client: Socket, @MessageBody() targetId: number) {
    if (typeof targetId !== 'number') {
      this.socketError(client.id, "Error trying to refuse friend request");
      return;
    }

    const targetSocketId = await this.getSocketIdWithId(targetId);
    if (!targetSocketId) {
      this.socketError(client.id, "Error trying to refuse friend request");
      return;
    };

    this.server.to(targetSocketId).emit("refreshPendingRequests");
    this.server.to(client.id).emit("refreshPendingRequests");
  }

  @SubscribeMessage('refreshFriendList')
  async refreshFriendList(@ConnectedSocket() client: Socket, @MessageBody() targetId: number) {
    if (typeof targetId !== 'number') {
      this.socketError(client.id, "Error trying to refresh friend list");
      return;
    }
    
    const targetSocketId = await this.getSocketIdWithId(targetId);
    if (!targetSocketId) {
      this.socketError(client.id, "Error trying to refresh friend list");
      return;
    };

    this.server.to(targetSocketId).emit("refreshFriendList");
    this.server.to(client.id).emit("refreshFriendList");
  }

  async sendStatusToFriends(@MessageBody() myId: number) {
    try {
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
      return 0;
    } catch (error) {
      return -1;
    }
  }

  @SubscribeMessage('requestFriendsStatus')
  async requestFriendsStatus(@ConnectedSocket() client: Socket, @MessageBody() myId: number) {
    if (typeof myId !== 'number') {
      this.socketError(client.id, "Error trying to request friends status");
      return;
    }

    try {
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
    } catch (error) {
      this.socketError(client.id, "User not found")
    }
  }

  @SubscribeMessage('areUsersFriend')
  async areUsersFriend(@ConnectedSocket() client: Socket, @MessageBody() usersId: UsersId) {
    try {
      const res = this.userService.areUsersFriends(usersId.userId1, usersId.userId2);
      return res;
    } catch (error) {
      this.socketError(client.id, "User not found");
    }
  }

  private async getSocketIdWithId(playerId: number): Promise<string | undefined> {
    const clients = await this.server.fetchSockets();
    for (const client of clients) {
      if (client.data.userId === playerId)
        return client.id;
    }

    return undefined;
  }

  socketError(clientId: string, message: string) {
    this.server.to(clientId).emit('error', message);
  }
}
