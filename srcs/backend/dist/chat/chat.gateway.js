"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const socket_service_1 = require("./socket.service");
let ChatGateway = class ChatGateway {
    // constructor(@Inject(ChatService) private readonly chatService: ChatService) {}
    // constructor( private chatService: ChatService ) {}
    constructor(listUser) {
        this.listUser = listUser;
    }
    ;
    onModuleInit() {
        // middleware to check if client-socket can connect to our gateway
        this.server.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
            if (socket.handshake.auth.token === "mon-token") {
                socket.data.userId = 1;
                console.log('valid-token');
                this.listUser.listUserConnected.set(socket.data.userId, socket.id);
                this.listUser.readMap();
                // this.listUserConnected.set(socket.data.userId, socket.id);
                // this.readMap(this.listUserConnected);
                next();
            }
            else {
                console.log('invalid-token');
                next(new websockets_1.WsException('invalid token'));
            }
        }));
        this.server.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
            console.log('client connected (chat gateway=>)', socket.id);
            // this.readMap(this.listUserConnected);
            // this.nouveaufichier.setSocket(id);
            console.log('test1');
            // const conversationIds: number[] = await this.chatService.getAllConvFromId(socket.data.userId);
            // console.log("number convs:");
            // console.log(conversationIds);
        }));
    }
    handleSetNewUserConnected(userId, client) {
        this.listUser.listUserConnected.set(userId, client.id);
        this.server.emit("changeConnexionState");
    }
    handleIsUserConnected(userId, client) {
        const socketId = this.listUser.listUserConnected.get(userId); // get the socketId from userId
        if (!socketId)
            return false;
        const connectedSockets = this.server.sockets.sockets; // get a map of connected sockets
        return connectedSockets.has(socketId); // is the socketId of our clients is in this map ?
    }
    handleDisconnect(client) {
        for (const [key, value] of this.listUser.listUserConnected.entries()) {
            if (client.id === value)
                this.listUser.listUserConnected.delete(key);
        }
        console.log(`client disconnected (chat gateway): ${client.id}`);
        this.server.emit("changeConnexionState");
        const clientId = client.id;
        // this.socketService.removeSocket(clientId);
    }
    handleMessage(data, client) {
        // traiter le message: extraire le channelId du message
        // connaitre tous les users qui sont dans le channelId du message
        // renvoyer (socket.emit()) le contenu du message aux users appropries
        this.server.emit('message', client.id, data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('setNewUserConnected'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleSetNewUserConnected", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('isUserConnected'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", Boolean)
], ChatGateway.prototype, "handleIsUserConnected", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [socket_service_1.listUserConnected])
], ChatGateway);
