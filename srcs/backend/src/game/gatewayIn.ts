import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameLoopService } from './gameLoop.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayIn implements OnModuleInit {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly gameLoop: GameLoopService) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('connected');
    });
  }

  @SubscribeMessage('getP1Pos')
  getP1Pos(@MessageBody() direction: string) {
    this.gameLoop.updateP1Pos(direction);
  }

  @SubscribeMessage('getP2Pos')
  getP2Pos(@MessageBody() direction: string) {
    this.gameLoop.updateP2Pos(direction);
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
