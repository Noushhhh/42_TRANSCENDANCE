import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
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
export class ChatGateway implements OnModuleInit, OnGatewayDisconnect {

    @WebSocketServer()
    server!: Server;

    // constructor(@Inject(ChatService) private readonly chatService: ChatService) {}
    // constructor( private chatService: ChatService ) {}
    constructor(private listUser: listUserConnected) {};

    onModuleInit() {
        // middleware to check if client-socket can connect to our gateway
        this.server.use( async (socket, next) => {
            if (socket.handshake.auth.token === "mon-token"){
                socket.data.userId = 1;
                console.log('valid-token');
                this.listUser.listUserConnected.set(socket.data.userId, socket.id)
                this.listUser.readMap();
                // this.listUserConnected.set(socket.data.userId, socket.id);
                // this.readMap(this.listUserConnected);
                next();
            }
            else{
                console.log('invalid-token');
                next(new WsException('invalid token'));
            }
        })
        this.server.on('connection', async (socket) => {
            console.log('client connected (chat gateway=>)', socket.id);
            // this.readMap(this.listUserConnected);
            // this.nouveaufichier.setSocket(id);
            console.log('test1');
            // const conversationIds: number[] = await this.chatService.getAllConvFromId(socket.data.userId);
            // console.log("number convs:");
            // console.log(conversationIds);
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

    handleDisconnect(@ConnectedSocket() client: Socket) {
        for (const [key, value] of this.listUser.listUserConnected.entries()) {
            if (client.id === value)
                this.listUser.listUserConnected.delete(key);
        }
        console.log(`client disconnected (chat gateway): ${client.id}`);
        this.server.emit("changeConnexionState");
        const clientId = client.id;
        // this.socketService.removeSocket(clientId);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {

        // traiter le message: extraire le channelId du message
        // connaitre tous les users qui sont dans le channelId du message
        // renvoyer (socket.emit()) le contenu du message aux users appropries

        this.server.emit('message', client.id, data);
    }

}
