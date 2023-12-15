import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
// import { SocketService } from './socket.service';
import { ChatService } from './chat.service';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {

    @WebSocketServer()
    server!: Server;

    constructor(
        private authService: AuthService,
        private chatService: ChatService) { };

    afterInit() {
        // middleware to check if client-socket can connect to our gateway
        this.server.use(async (socket, next) => {

            // check token validity return the userId if correspond to associated token
            // return null if token is invalid
            const response = await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);

            if (response) {
                socket.data.userId = response;
                // next allow us to accept the incoming socket as the token is valid
                next();
            } else {
                next(new WsException('invalid token'));
            }
        })

        /*this.server.on('connection', async (socket) => {
            console.log(`userId ${socket.data.userId} is connected from chat gateway`);
            this.joinRoomsForClient(socket.data.userId, socket);
            this.readMap();

            socket.on('disconnect', async () => {
                console.log(`userId: ${socket.data.userId} is disconnected from chat gateway`);
                this.leaveRoomsForClient(socket.data.userId, socket);
            })
        });*/
    }

    handleConnection(socket: Socket) {
        console.log(`userId ${socket.data.userId} is connected from chat gateway`);
        this.joinRoomsForClient(socket.data.userId, socket);
        this.joinBlockedRooms(socket.data.userId, socket);
    }

    handleDisconnect(socket: Socket) {
        console.log(`userId: ${socket.data.userId} is disconnected from chat gateway`);
        this.leaveRoomsForClient(socket.data.userId, socket);
        this.leaveBlockedRooms(socket.data.userId, socket);
    }

    async readMap() {
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets) {
            console.log(`userId:${socket.data.userId} is ${socket.id}`);
        }
    }

    async joinBlockedRooms(userId: number, socket: Socket) {
        const blockedUsersId: number[] = await this.chatService.getBlockedUsersById(userId);
        for (const id of blockedUsersId) {
            socket.join(String(`whoBlocked${id}`));
        }
    }

    async leaveBlockedRooms(userId: number, socket: Socket) {
        const blockedUsersId: number[] = await this.chatService.getBlockedUsersById(userId);
        for (const id of blockedUsersId) {
            socket.leave(String(`whoBlocked${id}`));
        }
    }

    async joinRoomsForClient(userId: number, socket: Socket) {
        const channelIds: number[] = await this.chatService.getAllConvFromId(userId);
        for (const channelId of channelIds) {
            socket.join(String(channelId));
        }
    }

    async leaveRoomsForClient(userId: number, socket: Socket) {
        const channelIds: number[] = await this.chatService.getAllConvFromId(userId);
        for (const channelId of channelIds) {
            socket.leave(String(channelId));
        }
    }

    async getSocketByUserId(userId: number) {
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets) {
            if (socket.data.userId === userId)
                return socket;
        }
        return null;
    }

    async showClientsOfRoom(channelId: number) {
        const clients = await this.server.in(String(channelId)).fetchSockets();
        for (const client of clients) {
            console.log(`channelId:${channelId} contain userId:${client.data.userId}`);
        }
    }

    async notifyChannelDeleted(channelId: number, participantsIds: number[]){
        console.log("notifyChannelDeleted called server-side");
        for (const id of participantsIds){
            const socket = await this.getSocketByUserId(id);
            if (socket)
                socket.emit("channelDeleted", channelId);
        }
    }

    @SubscribeMessage("block")
    handleBlock(@MessageBody() data: { blockerId: number, blockedId: number }, @ConnectedSocket() client: Socket) {
        console.log(`userId: ${data.blockerId} is blocking ${data.blockedId}`);
        client.join(String(`whoBlocked${data.blockedId}`));
    }

    @SubscribeMessage("unblock")
    handleUnblock(@MessageBody() data: { blockerId: number, blockedId: number }, @ConnectedSocket() client: Socket) {
        console.log(`userId: ${data.blockerId} is unblocking ${data.blockedId}`);
        client.leave(String(`whoBlocked${data.blockedId}`));
    }

    @SubscribeMessage("joinChannel")
    handleJoinChannel(@MessageBody() channelId: number, @ConnectedSocket() client: Socket) {
        console.log(`userId: ${client.data.userId} is joining channelId: ${channelId}`);
        this.server.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
        client.join(String(channelId));
    }

    @SubscribeMessage("leaveChannel")
    handleLeaveChannel(@MessageBody() channelId: number, @ConnectedSocket() client: Socket) {
        console.log(`userId: ${client.data.userId} is leaving channelId: ${channelId}`);
        this.server.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
        client.leave(String(channelId));
    }

    @SubscribeMessage("notifySomeoneLeaveChannel")
    async handlenotifySomeoneLeaveChannel(@MessageBody() data: { channelId: number, userId: number }) {
        const { channelId, userId } = data;
        const socket = await this.getSocketByUserId(userId);
        if (!socket){
            console.log("shoulndt return here");
            return
        }
        console.log(`${userId} is kicked of ${channelId}`);
        socket.emit("kickedOrBanned", channelId);
        this.server.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
        socket.leave(String(channelId));
    }

    @SubscribeMessage("notifySomeoneJoinChannel")
    async handlenotifySomeoneJoinChannel(@MessageBody() data: { channelId: number, userId: number }) {
        const { channelId, userId } = data;
        const socket = await this.getSocketByUserId(userId);
        if (!socket)
            return
        socket.join(String(channelId));
        socket.emit("addedToChannel");
        this.server.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
        console.log(`userId: ${userId} is joining of ${channelId}`);
    }

    @SubscribeMessage('setNewUserConnected')
    handleSetNewUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
        this.server.emit("changeConnexionState");
    }

    @SubscribeMessage('isUserConnected')
    async handleIsUserConnected(@MessageBody() userId: number, @ConnectedSocket() client: Socket): Promise<boolean> {
        const socket = await this.getSocketByUserId(userId);
        if (socket)
            return true;
        return false;
    }

    isInRoom(client: Socket, channelId: number): boolean {
        const rooms = [...client.rooms].slice(1, );
        for (const room of rooms){
            if (room == String(channelId))
                return true;
        }
        return false;
    }

    @SubscribeMessage('message')
    async handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket): Promise<boolean> {
        if (data.content.length > 5000){
            data.content = "Message too long. Maximum length: 5000";
            return false;
        }
        if (this.isInRoom(client, data.channelId) === false)
            return false;
        let isSenderMuted: { isMuted: boolean, isSet: boolean, rowId: number  };
        isSenderMuted = await this.chatService.isMute({channelId: data.channelId, userId: data.senderId});
        if (isSenderMuted.isMuted === true){
            data.content = "you are mute from this channel";
            return true;
        }
        // emit with client instead of server doesnt trigger "message" events to initial client-sender
        client.to(String(data.channelId)).except(String(`whoBlocked${data.senderId}`)).emit("messageBack", data);
        return false;
    }
}