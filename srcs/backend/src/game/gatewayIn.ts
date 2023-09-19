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
import { GameDataService } from './data.service';

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
export class GatewayIn implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly gameLoop: GameLoopService,
    private readonly gameLobby: GameLobbyService,
    private readonly gameData: GameDataService,
  ) { }

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

  @SubscribeMessage('setGameData')
  setGameData(@MessageBody() data: GameDataArray) {
    console.log('data: ', data);
    // this.gameData.setKonvaHeight(data[0]);
    // this.gameData.setKonvaWidth(data[1]);
    // this.gameData.setPaddleHeight(data[2]);
    // this.gameData.setPaddleWidth(data[3]);
    // this.gameLoop.printGameData();
    // this.gameData.printData();
  }

  @SubscribeMessage('sendPlayersPos')
  sendPlayersPos(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendPlayersPos(client);
    this.gameLobby.printLobbyPlayerPos();
  }
}
