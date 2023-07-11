import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameState } from './types'
import { lobbies } from './lobbies';

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

  sendBallPos(pos: Vector2d) {
    this.server.emit('updateBallPos', pos);
  }

  updateGameState(gameState: GameState) {
    
    this.server.emit('updateGameState', gameState);
  }

  isInLobby(isInLobby: boolean, clientId: string) {
    this.server.emit('isOnLobby', isInLobby, clientId);
  }
}
