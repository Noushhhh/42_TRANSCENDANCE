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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvents = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const socket_service_1 = require("./socket.service");
let SocketEvents = exports.SocketEvents = class SocketEvents {
    constructor(socketService) {
        this.socketService = socketService;
        this.listUserConnected = new Map();
    }
    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log('client connected', socket.id);
        });
    }
    handleConnection(socket) {
        const clientId = socket.id;
        this.socketService.setSocket(clientId, socket);
    }
    readMap(map) {
        console.log('readmap:');
        console.log(Array.from(map.values()));
    }
    handleSetNewUserConnected(userId, client) {
        console.log("user conneted");
        console.log(userId);
        this.listUserConnected.set(userId, client.id);
        this.server.emit("changeConnexionState");
        this.readMap(this.listUserConnected);
    }
    handleIsUserConnected(userId, client) {
        const socketId = this.listUserConnected.get(userId); // get the socketId from userId
        if (!socketId)
            return false;
        const connectedSockets = this.server.sockets.sockets; // get a map of connected sockets
        return connectedSockets.has(socketId); // is the socketId of our clients is in this map ?
    }
    handleDisconnect(client) {
        for (const [key, value] of this.listUserConnected.entries()) {
            if (client.id === value)
                this.listUserConnected.delete(key);
        }
        this.server.emit("changeConnexionState");
        const clientId = client.id;
        this.socketService.removeSocket(clientId);
    }
    handleMessage(data, client) {
        this.server.emit('message', client.id, data);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketEvents.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('setNewUserConnected'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketEvents.prototype, "handleSetNewUserConnected", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('isUserConnected'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", Boolean)
], SocketEvents.prototype, "handleIsUserConnected", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketEvents.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketEvents.prototype, "handleMessage", null);
exports.SocketEvents = SocketEvents = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [socket_service_1.SocketService])
], SocketEvents);
