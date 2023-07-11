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
  ) { }

  handleDisconnect(socket: Socket) {
    console.log('client disconnected', socket.id);
    this.gameLobby.removePlayerFromLobby(socket.id);
  }

  @SubscribeMessage('getP1Pos')
  getP1Pos(@MessageBody() direction: string, @ConnectedSocket() socket: Socket) {
    this.gameLoop.updateP1Pos(direction, socket.id);
  }

  @SubscribeMessage('getP2Pos')
  getP2Pos(@MessageBody() direction: string, @ConnectedSocket() socket: Socket) {
    this.gameLoop.updateP2Pos(direction, socket.id);
  }

  @SubscribeMessage('getIsPaused')
  setPause(@MessageBody() isPaused: boolean) {
    if (isPaused === true) {
      this.server.emit('play');
    } else if (isPaused === false) {
      this.server.emit('pause');
    }
  }
}
