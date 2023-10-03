import { Socket, Server } from "socket.io";
import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';

export class listUserConnected {

    @WebSocketServer()
    server!: Server;

    // map with, key = userId, string = socketId
    listUserConnected = new Map<number, string>();

    getSocketById(socketId: string) {
        try {
            return this.server.sockets.sockets.get(socketId);
        } catch (error) {
            console.log("in error handler");
        }
    }

    readMap() {
        console.log('readmap:');
        if (this.listUserConnected) {
            for (const [clé, valeur] of this.listUserConnected) {
                console.log(`Clé: ${clé}, Valeur: ${valeur}`);
            }
        }
        else
            console.log('0 clients connected');
    }

    alertChannelDeleted(userId: number, channelId: number) {
        console.log('00000000');
        console.log(`userId used to search = ${userId}`);
        this.readMap();
        const socketId: string | undefined = this.listUserConnected.get(userId);
        if (!socketId) {
            console.log('1111111');
            throw new Error("socketId not found");
        }
        const socket: Socket | undefined = this.getSocketById(socketId);
        console.log(`socket = ${socket}`);
        if (!socket) {
            console.log('222222');
            throw new Error("socket not found");
        }
        console.log("ping server-side channel deleted", channelId);
        socket.emit('channelDeleted', channelId);
    }
}