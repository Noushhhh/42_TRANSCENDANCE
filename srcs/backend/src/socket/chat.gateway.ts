import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SocketService } from './socket.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server!: Server;

    constructor(private readonly socketService: SocketService,
                private chatService: ChatService
                ) { }

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log('client connected (chat gateway=>)', socket.id);

            
        });

    }

    getSocketById(socketId: string) {
        return this.server.sockets.sockets.get(socketId);
    }

    handleConnection(socket: Socket) {
        console.log("amn i here ???????????");
        const clientId = socket.id;
        this.socketService.setSocket(clientId, socket);
        socket.setMaxListeners(11);
    }

    // map with, key = userId, string = socketId
    listUserConnected = new Map<number, string>();

    readMap(map: Map<number, string>): void {
        console.log('readmap:');
        console.log(Array.from(map.values()));
    }

    @SubscribeMessage('setNewUserConnected')
    handleSetNewUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
        this.listUserConnected.set(userId, client.id);
        this.readMap(this.listUserConnected);
        this.server.emit("changeConnexionState");
    }

    @SubscribeMessage('isUserConnected')
    handleIsUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket): boolean {
        const socketId: string | undefined = this.listUserConnected.get(userId); // get the socketId from userId
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
        console.log(`client disconnected (chat gateway): ${client.id}`);
        this.server.emit("changeConnexionState");
        const clientId = client.id;
        this.socketService.removeSocket(clientId);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {

        // traiter le message: extraire le channelId du message
        // connaitre tous les users qui sont dans le channelId du message
        // renvoyer (socket.emit()) le contenu du message aux users appropries

        this.server.emit('message', client.id, data);

        console.log('handleMessage called server side :');
        console.log(client.id);
    }

    alertChannelDeleted(userId: number, channelId: number) {
        const socketId: string | undefined = this.listUserConnected.get(userId);
        if (!socketId) {
            throw new Error("socketId not found");
        }
        const socket: Socket | undefined = this.getSocketById(socketId);
        if (!socket) {
            throw new Error("socket not found");
        }

        console.log(`alert server-side called and socketId = ${socket.id}`);
        socket.emit('channelDeleted', channelId);
        // Utilisez userId pour trouver la socket de l'utilisateur
    }
}
