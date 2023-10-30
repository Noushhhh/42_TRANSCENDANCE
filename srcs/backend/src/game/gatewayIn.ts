import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { gameSockets } from './gameSockets';
import { OnModuleInit } from '@nestjs/common';
import { playerStatistics } from './playerStatistics.service';
import { AuthService } from '../auth/auth.service';

type GameDataArray = [
  konvaHeight: number,
  konvaWidth: number,
  paddleHeight: number,
  paddleWidth: number,
]

interface PlayersId {
  user1: number;
  user2: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayIn implements OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly gameLoop: GameLoopService,
    private readonly gameLobby: GameLobbyService,
    private readonly gameSockets: gameSockets,
    private readonly playerStats: playerStatistics,
    private readonly authService: AuthService,
  ) { }

  onModuleInit() {
    this.server.use(async (socket, next) => {

      // check token validity return the userId if correspond to associated token
      // return null if token is invalid
      const response = await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);

      if (response) {
        socket.data.userId = response;
        this.gameSockets.server = this.server;
        const clientId = socket.id;
        this.gameSockets.setSocket(clientId, socket);
        socket.setMaxListeners(15);
        socket.data.userId = response;
        this.gameSockets.printSocketMap();
        // next allow us to accept the incoming socket as the token is valid
        next();
      } else {
        next(new WsException('invalid token'));
      }
    })
    this.server.on('connection', async (socket) => {
      console.log(`userId ${socket.data.userId} is connected from game gateway`);
    });
  }

  handleDisconnect(client: Socket) {
    console.log("client " + client.id + " is disconnected from game gateway")
    this.gameLobby.removePlayerFromLobby(client);
    this.gameSockets.removeSocket(client.id);
  }

  @SubscribeMessage('getPlayerPos')
  getPlayerPos(@MessageBody() direction: string, @ConnectedSocket() client: Socket) {
    this.gameLoop.updatePlayerPos(direction, client);
  }

  @SubscribeMessage('getIsPaused')
  setPause(@MessageBody() isPaused: boolean, @ConnectedSocket() client: Socket) {
    this.gameLobby.isPaused(client, isPaused);
  }

  @SubscribeMessage('requestLobbies')
  requestLobbie(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendLobbies(client);
  }

  @SubscribeMessage('setIntoLobby')
  setIntoLobby(@MessageBody() lobbyName: string, @ConnectedSocket() client: Socket) {
    this.gameLobby.addSpectatorToLobby(client.id, lobbyName);
  }

  @SubscribeMessage('sendPlayersPos')
  sendPlayersPos(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendPlayersPos(client);
  }

  @SubscribeMessage('requestGameState')
  requestGameState(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendLobbyGameState(client);
  }

  @SubscribeMessage('removeFromLobby')
  removeFromLobby(@ConnectedSocket() client: Socket) {
    this.gameLobby.removePlayerFromLobby(client);
  }

  @SubscribeMessage('resizeEvent')
  resizeEvent() {
    this.gameLoop.resizeEvent();
  }

  @SubscribeMessage('getColor')
  getColor(@ConnectedSocket() client: Socket, @MessageBody() color: string) {
    this.gameLobby.changePlayerColor(client, color);
  }

  @SubscribeMessage("inviteGame")
  inviteGame(@ConnectedSocket() client: Socket, @MessageBody() playersId: PlayersId) {
    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);
    let p1SocketId: string | null = null;
    let p2SocketId: string | null = null;
    console.log("sockets = ", sockets);
    for (const socket of sockets) {
      if (socket[1].data.userId === playersId.user1 || socket[1].data.userId === playersId.user2) {
        socket[1].data.userId === playersId.user1 ? p1SocketId = socket[0] : p2SocketId = socket[0];
      }
    }
    if (p1SocketId === null || p2SocketId === null) {
      //@to-do bien gerer erreur
      console.log(p1SocketId, p2SocketId);
      throw new Error("Error trying to invite friend to game")
    }
    this.gameLobby.launchGameWithFriend(playersId.user1, p1SocketId, playersId.user2, p2SocketId);
  }
}
