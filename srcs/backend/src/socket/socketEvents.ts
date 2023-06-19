import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
    cors:{
        origin: '*',
    },
})
export class SocketEvents {

    messages = [{message:"Message ok", name:"name"}];
    
    @WebSocketServer()
    server!: Server;

    handleConnection(client: Socket){
        console.log(`client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket){
        console.log(`client disconnected: ${client.id}`);
    }

    @SubscribeMessage('message')
    handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket){
        this.server.emit('message', client.id, data);
    }
}