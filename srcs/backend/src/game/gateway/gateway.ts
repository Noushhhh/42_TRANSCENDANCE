import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

interface Vector2d {
  x: number;
  y: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server!: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('connected');
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }

  @SubscribeMessage('getP1Pos')
  getP1Pos(@MessageBody() pos: Vector2d) {
    this.server.emit('updateP1Pos', pos);
  }

  @SubscribeMessage('getP2Pos')
  getP2Pos(@MessageBody() pos: Vector2d) {
    this.server.emit('updateP2Pos', pos);
  }

  @SubscribeMessage('getBallPos')
  getBallPos(@MessageBody() pos: Vector2d) {
    this.server.emit('updateBallPos', pos);
  }

  @SubscribeMessage('getIsPaused')
  setPause(@MessageBody() isPaused: boolean) {
    console.log(isPaused);
    if (isPaused === true) {
      this.server.emit('play');
    } else if (isPaused === false) {
      this.server.emit('pause');
    }
  }
}
