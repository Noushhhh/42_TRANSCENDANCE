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
exports.GatewayIn = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const gameLoop_service_1 = require("./gameLoop.service");
const gameLobby_service_1 = require("./gameLobby.service");
const data_service_1 = require("./data.service");
let GatewayIn = class GatewayIn {
    constructor(gameLoop, gameLobby, gameData) {
        this.gameLoop = gameLoop;
        this.gameLobby = gameLobby;
        this.gameData = gameData;
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
    setGameData(data) {
        console.log('data: ', data);
        // this.gameData.setKonvaHeight(data[0]);
        // this.gameData.setKonvaWidth(data[1]);
        // this.gameData.setPaddleHeight(data[2]);
        // this.gameData.setPaddleWidth(data[3]);
        // this.gameLoop.printGameData();
        // this.gameData.printData();
    }
    sendPlayersPos(client) {
        this.gameLobby.sendPlayersPos(client);
        this.gameLobby.printLobbyPlayerPos();
    }
};
exports.GatewayIn = GatewayIn;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GatewayIn.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('getPlayerPos'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "getPlayerPos", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getIsPaused'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "setPause", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('requestLobbies'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "requestLobbie", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('setIntoLobby'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "setIntoLobby", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('setGameData'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "setGameData", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendPlayersPos'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "sendPlayersPos", null);
exports.GatewayIn = GatewayIn = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [gameLoop_service_1.GameLoopService,
        gameLobby_service_1.GameLobbyService,
        data_service_1.GameDataService])
], GatewayIn);
