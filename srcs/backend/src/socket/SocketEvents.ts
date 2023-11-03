import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SocketService } from './socket.service';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketEvents {

    @WebSocketServer()
    server!: Server;

    constructor(private readonly socketService: SocketService) { }

    // @SubscribeMessage('message')
    // handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
    //     this.server.emit('message', client.id, data);
    // }


}
