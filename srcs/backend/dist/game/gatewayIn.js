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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayIn = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const gameLoop_service_1 = require("./gameLoop.service");
const gameLobby_service_1 = require("./gameLobby.service");
const gameSockets_1 = require("./gameSockets");
const playerStatistics_service_1 = require("./playerStatistics.service");
let GatewayIn = class GatewayIn {
    constructor(gameLoop, gameLobby, gameSockets, playerStats) {
        this.gameLoop = gameLoop;
        this.gameLobby = gameLobby;
        this.gameSockets = gameSockets;
        this.playerStats = playerStats;
    }
    onModuleInit() {
        this.gameSockets.server = this.server;
    }
    handleConnection(socket) {
        const clientId = socket.id;
        this.gameSockets.setSocket(clientId, socket);
        socket.setMaxListeners(11);
    }
    handleDisconnect(client) {
        console.log('client disconnected', client.id);
        this.gameLobby.removePlayerFromLobby(client);
    }
    getPlayerPos(direction, client) {
        this.gameLoop.updatePlayerPos(direction, client);
    }
    setPause(isPaused, client) {
        this.gameLobby.isPaused(client, isPaused);
    }
    requestLobbie(client) {
        this.gameLobby.sendLobbies(client);
    }
    setIntoLobby(lobbyName, client) {
        this.gameLobby.addSpectatorToLobby(client.id, lobbyName);
    }
    sendPlayersPos(client) {
        this.gameLobby.sendPlayersPos(client);
    }
    requestGameState(client) {
        this.gameLobby.sendLobbyGameState(client);
    }
    getPaddleSize(client, num) {
        console.log("je recois: ", num);
    }
    removeFromLobby(client) {
        this.gameLobby.removePlayerFromLobby(client);
    }
    resizeEvent() {
        this.gameLoop.resizeEvent();
    }
    addGameToPlayer() {
    }
};
exports.GatewayIn = GatewayIn;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], GatewayIn.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('getPlayerPos'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "getPlayerPos", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getIsPaused'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, typeof (_c = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "setPause", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('requestLobbies'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "requestLobbie", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('setIntoLobby'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_e = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "setIntoLobby", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendPlayersPos'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "sendPlayersPos", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('requestGameState'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "requestGameState", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updatePaddleSize'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _h : Object, Number]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "getPaddleSize", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('removeFromLobby'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "removeFromLobby", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('resizeEvent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "resizeEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('addGameToPlayersStats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "addGameToPlayer", null);
exports.GatewayIn = GatewayIn = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [gameLoop_service_1.GameLoopService,
        gameLobby_service_1.GameLobbyService,
        gameSockets_1.gameSockets,
        playerStatistics_service_1.playerStatistics])
], GatewayIn);
