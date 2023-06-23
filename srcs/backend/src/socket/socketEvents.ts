import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';


@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketEvents {
    
    @WebSocketServer()
    server!: Server;
    
    @SubscribeMessage('connection')
    handleConnection(@MessageBody() simulatedUserId: number, client: Socket) {
      console.log('Client connected: ');
      console.log(simulatedUserId);
      // this.server.emit('simulatedUserId', simulatedUserId);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
        this.server.emit('message', client.id, data);
    }
    
}

