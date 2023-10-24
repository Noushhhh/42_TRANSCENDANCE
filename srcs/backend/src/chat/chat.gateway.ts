import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayDisconnect, OnGatewayConnection, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { Injectable,  OnModuleInit } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { SocketService } from './socket.service';
import { ChatService } from './chat.service';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnModuleInit {

    @WebSocketServer()
    server!: Server;

    constructor(private socketService: SocketService,
                private authService: AuthService,
                private chatService: ChatService) {};

    onModuleInit() {
        // middleware to check if client-socket can connect to our gateway
        this.server.use( async (socket, next) => {

            // check token validity return the userId if correspond to associated token
            // return null if token is invalid
            const response = await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);

            next();
            if (response){
                socket.data.userId = response;
                // next allow us to accept the incoming socket as the token is valid
                next();
            } else{
                next(new WsException('invalid token'));
            }
        })
        this.server.on('connection', async (socket) => {
            console.log(`userId ${socket.data.userId} is connected`);
            this.socketService.readMap();
            this.joinRoomsForClient(socket.data.userId, socket);

            socket.on('disconnect', async () => {
                console.log(`userId: ${socket.data.userId} is disconnected`);
                this.socketService.readMap();
                this.leaveRoomForClient(socket.data.userId, socket);
            })
        });
    }

    async joinRoomsForClient(userId: number, socket: Socket){
        const channelIds: number[] = await this.chatService.getAllConvFromId(userId);
        for (const channelId of channelIds){
            socket.join(String(channelId));
        }
    }

    async leaveRoomForClient(userId: number, socket: Socket){
        const channelIds: number[] = await this.chatService.getAllConvFromId(userId);
        for (const channelId of channelIds){
            console.log(`userId:${socket.data.userId} is leaving channelId:${channelId}`);
            socket.leave(String(channelId));
        }
    }

    async getSocketByUserId(userId: number){
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets){
            if (socket.data.userId === userId)
                return socket;
        }
        return null;
    }

    @SubscribeMessage("joinChannel")
    handleJoinChannel(@MessageBody() channelId: number, @ConnectedSocket() client: Socket){
        console.log(`userId: ${client.data.userId} is joining channelId: ${channelId}`);
        client.join(String(channelId));
    }

    @SubscribeMessage("leaveChannel")
    handleLeaveChannel(@MessageBody() channelId: number, @ConnectedSocket() client: Socket){
        console.log(`userId: ${client.data.userId} is leaving channelId: ${channelId}`);
        client.leave(String(channelId));
    }

    @SubscribeMessage("notifySomeoneLeaveChannel")
    async handlenotifySomeoneLeaveChannel(@MessageBody() data :{channelId: number, userId: number}){
        const { channelId, userId } = data;
        const socket = await this.getSocketByUserId(userId);
        if (!socket)
            return
        console.log(`userId: ${userId} is leaving of ${channelId}`);
        console.log(socket);
        socket.leave(String(channelId));
    }

    @SubscribeMessage("notifySomeoneJoinChannel")
    async handlenotifySomeoneJoinChannel(@MessageBody() data :{channelId: number, userId: number}){
        const { channelId, userId } = data;
        const socket = await this.getSocketByUserId(userId);
        if (!socket)
            return
        socket.join(String(channelId));
        console.log(`userId: ${userId} is joining of ${channelId}`);
        console.log(socket);
    }

    @SubscribeMessage('setNewUserConnected')
    handleSetNewUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
        this.server.emit("changeConnexionState");
    }

    @SubscribeMessage('isUserConnected')
    async handleIsUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket): Promise <boolean> {
        const socket = await this.getSocketByUserId(userId);
        if (socket)
            return true;
        return false;
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
        client.to(String(data.channelId)).emit("message", data);
    }

    

}
