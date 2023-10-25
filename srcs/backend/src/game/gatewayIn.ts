import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { gameSockets } from './gameSockets';
import { OnModuleInit } from '@nestjs/common';
import { playerStatistics } from './playerStatistics.service';

type GameDataArray = [
  konvaHeight: number,
  konvaWidth: number,
  paddleHeight: number,
  paddleWidth: number,
]

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
  ) { }

  onModuleInit() {
    this.gameSockets.server = this.server;
  }

  handleConnection(socket: Socket) {
    const clientId = socket.id;
    this.gameSockets.setSocket(clientId, socket);
    socket.setMaxListeners(15);
  }

  handleDisconnect(client: Socket) {
    console.log('client disconnected', client.id);
    this.gameLobby.removePlayerFromLobby(client);
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
}
