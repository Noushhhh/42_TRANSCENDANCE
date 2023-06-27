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
let GatewayIn = exports.GatewayIn = class GatewayIn {
    constructor(gameLoop) {
        this.gameLoop = gameLoop;
    }
    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log(socket.id);
            console.log('connected');
        });
    }
    getP1Pos(direction) {
        this.gameLoop.updateP1Pos(direction);
    }
    getP2Pos(direction) {
        this.gameLoop.updateP2Pos(direction);
    }
    setPause(isPaused) {
        if (isPaused === true) {
            this.server.emit('play');
        }
        else if (isPaused === false) {
            this.server.emit('pause');
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GatewayIn.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('getP1Pos'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "getP1Pos", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getP2Pos'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "getP2Pos", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getIsPaused'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", void 0)
], GatewayIn.prototype, "setPause", null);
exports.GatewayIn = GatewayIn = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [gameLoop_service_1.GameLoopService])
], GatewayIn);
