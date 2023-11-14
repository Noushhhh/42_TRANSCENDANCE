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


@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server!: Server;

  constructor(private readonly authService: AuthService) { }

  afterInit() {
    this.server.use(async (socket, next) => {

      // check token validity return the userId if correspond to associated token
      // return null if token is invalid
      const response = await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);

      if (response) {
        next();
      } else {
        next(new WsException('invalid token'));
      }
    })
  }

  handleConnection(socket: Socket) {
    console.log(`userId ${socket.data.userId} is connected from users gateway`);
  }

  handleDisconnect(client: Socket) {
    console.log("client " + client.id + " is disconnected from users gateway")
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

  private async getSocketIdWithId(playerId: number): Promise<string | undefined> {
    const clients = await this.server.fetchSockets();
    for (const client of clients) {
      if (client.data.userId === playerId)
        return client.id;
    }

    return undefined;
  }
}
