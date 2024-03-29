import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
  OnGatewayInit
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameState } from './types';
import { lobbies } from './lobbies';
import { gameSockets } from './gameSockets';
import { AuthService } from '../auth/auth.service';

interface Vector2d {
  x: number;
  y: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayOut implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly socketMap: gameSockets, private readonly authService: AuthService) { }

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

  removeSpectate(isInLobby: boolean, playerId: string, room: string) {
    this.server.to(room).emit('isOnLobby', isInLobby, playerId);
  }

  socketError(clientId: string, message: string) {
    this.emitToUser(clientId, 'error', message);
  }
}
