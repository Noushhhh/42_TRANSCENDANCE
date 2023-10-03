import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayDisconnect, OnGatewayConnection, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { Injectable, Inject,  OnModuleInit } from '@nestjs/common';
// import { SocketService } from './socket.service';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { listUserConnected } from './socket.service';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnModuleInit {

    @WebSocketServer()
    server!: Server;

    constructor(private listUser: listUserConnected,
                private authService: AuthService) {};

    onModuleInit() {
        // middleware to check if client-socket can connect to our gateway
        this.server.use( async (socket, next) => {

            // check token validity return the userId if correspond to associated token
            // return null if token is invalid
            const response = await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);

            if (response){
                socket.data.userId = response;
                // next allow us to accept the incoming socket as the token is valid
                next();
            } else{
                next(new WsException('invalid token'));
            }
        })
        this.server.on('connection', async (socket) => {
            this.listUser.listUserConnected.set(socket.data.userId, socket.id);
            console.log(`userId ${socket.data.userId} is connected`);
            this.listUser.readMap();

            socket.on('disconnect', async () => {
                console.log(`userId: ${socket.data.userId} is disconnected`);
                this.listUser.listUserConnected.delete(socket.data.userId);
                this.listUser.readMap();
            })
        });
    }

    @SubscribeMessage('setNewUserConnected')
    handleSetNewUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
        this.listUser.listUserConnected.set(userId, client.id);
        this.server.emit("changeConnexionState");
    }

    @SubscribeMessage('isUserConnected')
    handleIsUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket): boolean {
        const socketId: string | undefined = this.listUser.listUserConnected.get(userId); // get the socketId from userId
        if (!socketId)
            return false;
        const connectedSockets = this.server.sockets.sockets; // get a map of connected sockets
        return connectedSockets.has(socketId); // is the socketId of our clients is in this map ?
    }

    // remove this old HandleDisconnect if new logic is working

    // handleDisconnect(@ConnectedSocket() client: Socket) {
    //     for (const [key, value] of this.listUser.listUserConnected.entries()) {
    //         if (client.id === value)
    //             this.listUser.listUserConnected.delete(key);
    //     }
    //     console.log(`client disconnected (chat gateway): ${client.id}`);
    //     this.server.emit("changeConnexionState");
    //     const clientId = client.id;
    //     // this.socketService.removeSocket(clientId);
    // }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {

        this.server.emit('message', client.id, data);
    }

}
