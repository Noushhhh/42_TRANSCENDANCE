// import { Socket, Server } from "socket.io";
// import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
// import { Injectable } from "@nestjs/common";

// @Injectable()
// @WebSocketGateway({
//     cors: {
//         origin: '*',
//     },
// })
// export class SocketService {

//     @WebSocketServer()
//     server!: Server;

//     // map with, key = userId, string = socketId

//     getSocketById(socketId: string) {
//         try {
//             return this.server.sockets.sockets.get(socketId);
//         } catch (error) {
//             console.log("in error handler");
//             return undefined;
//         }
//     }

//     readMap = async () => {
//         const socks = await this.server.fetchSockets();
//         for (const sock of socks)
//         {
//             console.log(`${sock.id}, userId: ${sock.data.userId}`);
//         }
//     }

//     alertChannelDeleted(userId: number, channelId: number) {
//         this.server.emit('channelDeleted', channelId);
//     }
// }