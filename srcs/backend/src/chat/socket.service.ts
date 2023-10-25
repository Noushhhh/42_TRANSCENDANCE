import { Socket, Server } from "socket.io";
import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from "@nestjs/common";

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
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
            return undefined;
        }
    }

    readMap = async () => {
        const socks = await this.server.fetchSockets ();
        for (const sock of socks)
        {
            console.log("test", sock.id, sock.data.userId);
        }
        // console.log('readmap:');
        // if (this.listUserConnected) {
        //     for (const [clé, valeur] of this.listUserConnected) {
        //         console.log(`Clé: ${clé}, Valeur: ${valeur}`);
        //     }
        // }
        // else
        //     console.log('0 clients connected');
    }

    alertChannelDeleted(userId: number, channelId: number) {
        console.log('channelDeleted called server-side');
        this.readMap();
        this.server.emit('channelDeleted', channelId);
        // const socketId: string | undefined = this.listUserConnected.get(userId);
        // if (!socketId) {
        //     throw new Error("socketId not found");
        // }
        // this.readMap();
        // console.log(`socketId used for search in actual sockets: ${socketId}`);
        // const socket: Socket | undefined = this.getSocketById(socketId);
        // console.log(`socket = ${socket}`);
        // if (!socket) {
        //     console.log('222222');
        //     throw new Error("socket not found");
        // }
        // console.log("ping server-side channel deleted", channelId);
        // socket.emit('channelDeleted', channelId);
    }
}