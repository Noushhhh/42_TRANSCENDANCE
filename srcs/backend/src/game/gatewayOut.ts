import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameState } from './types'

interface Vector2d {
  x: number;
  y: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayOut implements OnModuleInit {
  @WebSocketServer()
  server!: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('connected');
    });
  }

  sendBallPos(pos: Vector2d) {
    this.server.emit('updateBallPos', pos);
  }

  updateGameState(gameState: GameState) {
    this.server.emit('updateGameState', gameState);
  }
}
