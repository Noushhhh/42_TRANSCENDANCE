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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.lobbies = exports.Lobby = void 0;
const common_1 = require("@nestjs/common");
const gameState_1 = require("./gameState");
let Lobby = class Lobby {
    constructor(player) {
        this.player2 = null;
        this.spectators = [];
        this.gameState = new gameState_1.GameState();
        this.ballState = this.gameState.gameState.ballState;
        this.player1 = player;
    }
    printPlayersPos() {
        console.log("print 4: ", this.gameState.gameState.p1pos);
        console.log("print 4: ", this.gameState.gameState.p2pos);
    }
};
exports.Lobby = Lobby;
exports.Lobby = Lobby = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], Lobby);
exports.lobbies = new Map();
