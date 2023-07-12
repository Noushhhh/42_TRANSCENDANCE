import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameState } from './types'
import { lobbies } from './lobbies';
import { SocketService } from '../socket/socket.service';

interface Vector2d {
  x: number;
  y: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayOut {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly socketMap: SocketService) {}

  sendBallPos(pos: Vector2d) {
    this.server.emit('updateBallPos', pos);
  }

  updateGameState(gameState: GameState) {
    this.server.emit('updateGameState', gameState);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.socketMap.getSocket(userId)?.emit(event, data);
  }

  updateLobbiesGameState() {
    for (const [key, value] of lobbies) {
      let p1Id: string;
      let p2Id: string;
      if (typeof value.player1 === 'string') {
        p1Id = value.player1;
        this.emitToUser(p1Id, 'updateGameState', value.gameState.gameState);
      }
      if (typeof value.player2 === 'string') {
        p2Id = value.player2;
        this.emitToUser(p2Id, 'updateGameState', value.gameState.gameState);
      }
    }
  }

  isInLobby(isInLobby: boolean, clientId: string) {
    this.server.emit('isOnLobby', isInLobby, clientId);
  }
}
