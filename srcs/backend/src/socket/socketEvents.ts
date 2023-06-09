import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { OnModuleInit } from '@nestjs/common';
import { SocketService } from './socket.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketEvents implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server!: Server;

    constructor(private readonly socketService: SocketService) { }

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log('client connected', socket.id);
        });
    }

    handleConnection(socket: Socket) {
        const clientId = socket.id;
        this.socketService.setSocket(clientId, socket);
    }

    listUserConnected = new Map<number, string>();

    readMap(map: Map<number, string>): void {
        console.log('readmap:');
        console.log(Array.from(map.values()));
    }

    @SubscribeMessage('setNewUserConnected')
    handleSetNewUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
        console.log("user conneted");
        console.log(userId);
        this.listUserConnected.set(userId, client.id);
        this.server.emit("changeConnexionState");
        this.readMap(this.listUserConnected);
    }

    @SubscribeMessage('isUserConnected')
    handleIsUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket): boolean {
        const socketId = this.listUserConnected.get(userId); // get the socketId from userId
        if (!socketId)
            return false;
        const connectedSockets = this.server.sockets.sockets; // get a map of connected sockets
        return connectedSockets.has(socketId); // is the socketId of our clients is in this map ?
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        for (const [key, value] of this.listUserConnected.entries()) {
            if (client.id === value)
                this.listUserConnected.delete(key);
        }
        this.server.emit("changeConnexionState");

        const clientId = client.id;
        this.socketService.removeSocket(clientId);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
        this.server.emit('message', client.id, data);
    }
}
