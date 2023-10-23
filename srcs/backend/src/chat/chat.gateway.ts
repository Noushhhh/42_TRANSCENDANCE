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

    async findSocketByUserId(userId: number): Promise<Socket | null>{
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets){
            if (socket.data.userId === userId)
                socket.leave("awd")
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
    async handlenotifySomeoneLeaveChannel(@MessageBody() data :{channelId: number, userId: number}, @ConnectedSocket() client: Socket){
        const { channelId, userId } = data;
        console.log(`someoneLeaveChanneluserId: ${userId} is leaving channelId: ${channelId}`);
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets){
            if (socket.data.userId === userId)
                socket.leave(String(channelId));
        }
    }

    @SubscribeMessage("notifySomeoneJoinChannel")
    async handlenotifySomeoneJoinChannel(@MessageBody() data :{channelId: number, userId: number}, @ConnectedSocket() client: Socket){
        const { channelId, userId } = data;
        console.log(`someoneJoinChanneluserId: ${userId} is joining channelId: ${channelId}`);
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets){
            if (socket.data.userId === userId)
                socket.join(String(channelId));
        }
    }

    @SubscribeMessage('setNewUserConnected')
    handleSetNewUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
        // this.listUser.listUserConnected.set(userId, client.id);
        this.server.emit("changeConnexionState");
    }

    @SubscribeMessage('isUserConnected')
    handleIsUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket): boolean {
        // const socketId: string | undefined = this.listUser.listUserConnected.get(userId); // get the socketId from userId
        //if (!socketId)
        //    return false;
        //const connectedSockets = this.server.sockets.sockets; // get a map of connected sockets
        //return connectedSockets.has(socketId); // is the socketId of our clients is in this map ?
        return true;
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
        client.to(String(data.channelId)).emit("message", data);
    }

    

}
