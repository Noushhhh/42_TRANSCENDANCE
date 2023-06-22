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


    handleConnection(client: Socket) {
        console.log(" co");
        this.server.emit('connection');
    }

    handleDisconnect(client: Socket) {
        console.log(`"serveur, client disconnected: "`);
        this.server.emit('disconnection');
    }
    //   handleDisconnect(@ConnectedSocket() client: Socket) {
    //     if (client && client.id) {
    //     //   this.server.emit('disconnect');
    //       console.log(`Client déconnecté: ${client.id}`);
    //     }
    //   }

    //   handleConnectionClient(@ConnectedSocket() client: Socket) {
    //     console.log('Client connecté - Partie serveur');
    //     this.server.emit('connection');
    //   }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
        this.server.emit('message', client.id, data);
    }
}
