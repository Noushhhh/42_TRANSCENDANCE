import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameState } from './types';
import { lobbies } from './lobbies';
import { gameSockets } from './gameSockets';

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

  constructor(private readonly socketMap: gameSockets) { }

  updateGameState(gameState: GameState) {
    this.server.emit('updateGameState', gameState);
  }

  emitToRoom(roomName: string, event: string, data: any) {
    this.server.to(roomName).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.socketMap.getSocket(userId)?.emit(event, data);
  }

  updateLobbiesGameState() {
    for (const [key, value] of lobbies) {
      this.emitToRoom(key, 'updateGameState', value.gameState.gameState);
    }
  }

  isInLobby(isInLobby: boolean, player: Socket | undefined) {
    this.server.emit('isOnLobby', isInLobby, player?.id);
  }
}
