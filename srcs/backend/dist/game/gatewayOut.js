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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayOut = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const lobbies_1 = require("./lobbies");
const socket_service_1 = require("../socket/socket.service");
const SocketEvents_1 = require("../socket/SocketEvents");
let GatewayOut = class GatewayOut {
    constructor(socketMap, io) {
        this.socketMap = socketMap;
        this.io = io;
    }
    updateGameState(gameState) {
        this.server.emit('updateGameState', gameState);
    }
    emitToRoom(roomName, event, data) {
        this.io.server.to(roomName).emit(event, data);
    }
    emitToUser(userId, event, data) {
        var _a;
        (_a = this.socketMap.getSocket(userId)) === null || _a === void 0 ? void 0 : _a.emit(event, data);
    }
    updateLobbiesGameState() {
        for (const [key, value] of lobbies_1.lobbies) {
            this.emitToRoom(key, 'updateGameState', value.gameState.gameState);
        }
    }
    isInLobby(isInLobby, player) {
        this.server.emit('isOnLobby', isInLobby, player === null || player === void 0 ? void 0 : player.id);
    }
};
exports.GatewayOut = GatewayOut;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GatewayOut.prototype, "server", void 0);
exports.GatewayOut = GatewayOut = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [socket_service_1.SocketService, SocketEvents_1.SocketEvents])
], GatewayOut);
