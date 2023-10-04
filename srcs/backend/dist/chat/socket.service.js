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
exports.listUserConnected = void 0;
const socket_io_1 = require("socket.io");
const websockets_1 = require("@nestjs/websockets");
class listUserConnected {
    constructor() {
        // map with, key = userId, string = socketId
        this.listUserConnected = new Map();
    }
    getSocketById(socketId) {
        return this.server.sockets.sockets.get(socketId);
    }
    readMap() {
        console.log('readmap:');
        if (this.listUserConnected)
            console.log(this.listUserConnected.values());
        else
            console.log('0 clients connected');
    }
    alertChannelDeleted(userId, channelId) {
        const socketId = this.listUserConnected.get(userId);
        if (!socketId) {
            throw new Error("socketId not found");
        }
        const socket = this.getSocketById(socketId);
        if (!socket) {
            throw new Error("socket not found");
        }
        console.log("ping server-side channel deleted", channelId);
        socket.emit('channelDeleted', channelId);
        // Utilisez userId pour trouver la socket de l'utilisateur
    }
}
exports.listUserConnected = listUserConnected;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], listUserConnected.prototype, "server", void 0);
