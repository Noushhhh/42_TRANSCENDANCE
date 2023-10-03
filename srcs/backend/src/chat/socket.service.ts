import { Socket, Server } from "socket.io";
import { WebSocketServer } from '@nestjs/websockets';

export class listUserConnected{

    @WebSocketServer()
    server!: Server;

    // map with, key = userId, string = socketId
    listUserConnected = new Map<number, string>();

    getSocketById(socketId: string) {
        return this.server.sockets.sockets.get(socketId);
    }

    readMap(){
        console.log('readmap:');
        if (this.listUserConnected)
            console.log(this.listUserConnected.values());
        else
            console.log('0 clients connected');
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
        console.log("ping server-side channel deleted", channelId);
        socket.emit('channelDeleted', channelId);
        // Utilisez userId pour trouver la socket de l'utilisateur
    }
}