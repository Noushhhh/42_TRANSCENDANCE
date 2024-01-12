import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
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
        this.server.use(async (socket, next) => {

            try {
                const response = await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);
                socket.data.userId = response;
                next();
            } catch (error) {
                next(new WsException('invalid token'));
            }
        })
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

    async joinBlockedRooms(userId: number, socket: Socket) {
        try {
            const blockedUsersId: number[] = await this.chatService.getBlockedUsersById(userId);
            for (const id of blockedUsersId) {
                socket.join(String(`whoBlocked${id}`));
            }
        } catch (error) {
            this.socketError(String(userId), "Error blocking user");
        }
    }

    async leaveBlockedRooms(userId: number, socket: Socket) {
        try {
            const blockedUsersId: number[] = await this.chatService.getBlockedUsersById(userId);
            for (const id of blockedUsersId) {
                socket.leave(String(`whoBlocked${id}`));
            }
        } catch (error){
            return ;
        }
    }

    async joinRoomsForClient(userId: number, socket: Socket) {
        try {
            const channelIds: number[] = await this.chatService.getAllConvFromId(userId);
            for (const channelId of channelIds) {
                socket.join(String(channelId));
                socket.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
            }
        } catch (error){
            this.socketError(String(userId), "Error joining rooms");
        }
    }

    async leaveRoomsForClient(userId: number, socket: Socket) {
        try {
            const channelIds: number[] = await this.chatService.getAllConvFromId(userId);
            for (const channelId of channelIds) {
                socket.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
                socket.leave(String(channelId));
            }
        } catch (error){
            return ;
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

    async notifyChannelDeleted(channelId: number, participantsIds: number[]) {
        for (const id of participantsIds) {
            const socket = await this.getSocketByUserId(id);
            if (socket)
                socket.emit("channelDeleted", channelId);
        }
    }

    @SubscribeMessage("block")
    handleBlock(@MessageBody() data: { blockerId: number, blockedId: number }, @ConnectedSocket() client: Socket) {
        if (typeof data.blockerId !== 'number' || typeof data.blockedId !== 'number') {
            this.socketError(client.id, "Error trying to block user");
            return;
        }
        client.join(String(`whoBlocked${data.blockedId}`));
    }

    @SubscribeMessage("unblock")
    handleUnblock(@MessageBody() data: { blockerId: number, blockedId: number }, @ConnectedSocket() client: Socket) {
        if (typeof data.blockerId !== 'number' || typeof data.blockedId !== 'number') {
            this.socketError(client.id, "Error trying to unblock user");
            return;
        }

        client.leave(String(`whoBlocked${data.blockedId}`));
    }

    @SubscribeMessage("joinChannel")
    handleJoinChannel(@MessageBody() channelId: number, @ConnectedSocket() client: Socket) {
        if (typeof channelId !== 'number') {
            this.socketError(client.id, "Error trying to join channel");
            return;
        }

        this.server.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
        client.join(String(channelId));
    }

    @SubscribeMessage("leaveChannel")
    handleLeaveChannel(@MessageBody() channelId: number, @ConnectedSocket() client: Socket) {
        if (typeof channelId !== 'number') {
            this.socketError(client.id, "Error trying to leave channel");
            return;
        }

        this.server.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
        client.leave(String(channelId));
    }

    @SubscribeMessage("notifySomeoneLeaveChannel")
    async handlenotifySomeoneLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: number, userId: number }) {
        if (typeof data.channelId !== 'number' || typeof data.userId !== 'number') {
            this.socketError(client.id, "Error trying to notify users");
            return;
        }

        const { channelId, userId } = data;

        this.server.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
        const socket = await this.getSocketByUserId(userId);
        if (!socket) {
            return
        }
        socket.emit("kickedOrBanned", channelId);
        socket.leave(String(channelId));
    }

    @SubscribeMessage("notifySomeoneJoinChannel")
    async handlenotifySomeoneJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: number, userId: number }) {
        if (typeof data.channelId !== 'number' || typeof data.userId !== 'number') {
            this.socketError(client.id, "Error trying to notify users");
            return;
        }

        const { channelId, userId } = data;
        this.server.to(String(channelId)).emit("channelNumberMembersChanged", channelId);
        const socket = await this.getSocketByUserId(userId);
        if (!socket)
            return
        socket.join(String(channelId));
        socket.emit("addedToChannel");
    }

    @SubscribeMessage('isChannelLive')
    async handleIsUserConnected(@MessageBody() data: { channelId: number, userId: number }, @ConnectedSocket() client: Socket): Promise<boolean> {
        if (typeof data.channelId !== 'number' || typeof data.userId !== 'number') {
            this.socketError(client.id, "Error trying to notify users");
            return false;
        }

        const { channelId, userId } = data;
        const connectedClients = await this.server.in(String(channelId)).fetchSockets();
        for (const client of connectedClients) {
            if (client.data.userId && client.data.userId != userId)
                return true;
        }
        return false;
    }

    isInRoom(client: Socket, channelId: number): boolean {
        const rooms = [...client.rooms].slice(1,);
        for (const room of rooms) {
            if (room == String(channelId))
                return true;
        }
        return false;
    }

    @SubscribeMessage('message')
    async handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket): Promise<boolean> {
        if (typeof data.channelId !== 'number' || typeof data.content !== 'string'
            || typeof data.id !== 'number' || typeof data.senderId !== 'number') {
            this.socketError(client.id, "Error trying to send message");
            return false;
        }

        if (data.content.length > 5000) {
            data.content = "Message too long. Maximum length: 5000";
            return false;
        }
        if (this.isInRoom(client, data.channelId) === false) {
            return false;
        }
        let isSenderMuted: { isMuted: boolean, isSet: boolean, rowId: number };
        isSenderMuted = await this.chatService.isMute({ channelId: data.channelId, userId: data.senderId });
        if (isSenderMuted.isMuted === true) {
            data.content = "you are muted from this channel";
            return true;
        }

        client.to(String(data.channelId)).except(String(`whoBlocked${data.senderId}`)).emit("messageBack", data);
        return false;
    }

    socketError(clientId: string, message: string) {
        this.server.to(clientId).emit('error', message);
    }
}