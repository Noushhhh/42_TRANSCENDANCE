import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameState } from './types'
import { lobbies } from './lobbies';
import { SocketService } from '../socket/socket.service';
import { SocketEvents } from '../socket/socketEvents';

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

  constructor(private readonly socketMap: SocketService, private readonly io: SocketEvents) { }

  sendBallPos(pos: Vector2d) {
    this.server.emit('updateBallPos', pos);
  }

  updateGameState(gameState: GameState) {
    this.server.emit('updateGameState', gameState);
  }

  emitToRoom(roomName: string, event: string, data: any) {
    this.io.server.to(roomName).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.socketMap.getSocket(userId)?.emit(event, data);
  }

  updateLobbiesGameState() {
    for (const [key, value] of lobbies) {
      // let p1Id: string;
      // let p2Id: string;
      // if (typeof value.player1 === 'string') {
      //   p1Id = value.player1;
      //   this.emitToUser(p1Id, 'updateGameState', value.gameState.gameState);
      // }
      // if (typeof value.player2 === 'string') {
      //   p2Id = value.player2;
      //   this.emitToUser(p2Id, 'updateGameState', value.gameState.gameState);
      // }
      this.emitToRoom(key, 'updateGameState', value.gameState.gameState);
    }
  }

  isInLobby(isInLobby: boolean, player: Socket | undefined) {
    this.server.emit('isOnLobby', isInLobby, player?.id);
  }
}
