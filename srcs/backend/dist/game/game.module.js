"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const gameLogic_service_1 = require("./gameLogic.service");
const gameLoop_service_1 = require("./gameLoop.service");
const gameLobby_service_1 = require("./gameLobby.service");
const game_controller_1 = require("./game.controller");
const gatewayIn_1 = require("./gatewayIn");
const gatewayOut_1 = require("./gatewayOut");
const data_service_1 = require("./data.service");
const gameSockets_1 = require("./gameSockets");
const playerStatistics_service_1 = require("./playerStatistics.service");
const users_service_1 = require("../users/users.service");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        providers: [gameLogic_service_1.GameLogicService, gameLoop_service_1.GameLoopService, gameLobby_service_1.GameLobbyService, gatewayIn_1.GatewayIn, gatewayOut_1.GatewayOut, data_service_1.GameDataService, gameSockets_1.gameSockets, playerStatistics_service_1.playerStatistics, users_service_1.UsersService],
        controllers: [game_controller_1.GameController],
    })
], GameModule);
