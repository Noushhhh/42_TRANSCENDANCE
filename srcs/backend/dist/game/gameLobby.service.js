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
exports.GameLobbyService = void 0;
const common_1 = require("@nestjs/common");
const gatewayOut_1 = require("./gatewayOut");
const lobbies_1 = require("./lobbies");
const socket_service_1 = require("../socket/socket.service");
const gameState_1 = require("./gameState");
const socketEvents_1 = require("../socket/socketEvents");
let GameLobbyService = class GameLobbyService {
    constructor(gatewayOut, socketMap, io) {
        this.gatewayOut = gatewayOut;
        this.socketMap = socketMap;
        this.io = io;
    }
    printLobbies() {
        lobbies_1.lobbies.forEach((value, key) => {
            console.log("------------------");
            console.log("|", value, "|  ", key, "|");
            console.log("|", value.gameState.gameState.p1pos.x, "|");
            console.log("|", value.gameState.gameState.p1pos.y, "|");
            console.log("------------------");
        });
    }
    addPlayerToLobby(playerId) {
        const player = this.socketMap.getSocket(playerId);
        if (this.isInLobby(player)) {
            console.log('Already in a lobby', player);
            return;
        }
        for (const [key, value] of lobbies_1.lobbies) {
            if (!value.player1 || !value.player2) {
                if (!value.player1) {
                    value.player1 = player;
                }
                else if (!value.player2) {
                    value.player2 = player;
                }
                player === null || player === void 0 ? void 0 : player.join(key);
                this.gatewayOut.isInLobby(true, player);
                if (value.player1 != null && value.player2 != null) {
                    this.gatewayOut.emitToRoom(key, 'isLobbyFull', true);
                    value.gameState.gameState.isLobbyFull === true;
                }
                return;
            }
        }
        const lobbyName = `lobby${lobbies_1.lobbies.size}`;
        const lobby = new lobbies_1.Lobby(player);
        lobbies_1.lobbies.set(lobbyName, lobby);
        player === null || player === void 0 ? void 0 : player.join(lobbyName);
        this.gatewayOut.isInLobby(true, player);
        this.getAllClientsInARoom(lobbyName);
    }
    addSpectatorToLobby(spectatorId, lobbyName) {
        var _a;
        const spectator = this.socketMap.getSocket(spectatorId);
        if (!spectator)
            return;
        for (const [key, value] of lobbies_1.lobbies) {
            if (key === lobbyName) {
                (_a = value.spectators) === null || _a === void 0 ? void 0 : _a.push(spectator);
                spectator.join(lobbyName);
                this.gatewayOut.isInLobby(true, spectator);
                this.gatewayOut.emitToUser(spectatorId, "isLobbyFull", true);
            }
        }
    }
    removePlayerFromLobby(player) {
        var _a, _b;
        for (const [key, value] of lobbies_1.lobbies) {
            const lobby = lobbies_1.lobbies.get(key);
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === player.id) {
                if (lobby) {
                    lobby.player1 = null;
                }
                this.gatewayOut.isInLobby(false, player);
                value.gameState = new gameState_1.GameState();
                return;
            }
            if (((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === player.id) {
                if (lobby) {
                    lobby.player2 = null;
                }
                this.gatewayOut.isInLobby(false, player);
                value.gameState = new gameState_1.GameState();
                return;
            }
        }
    }
    isPaused(player, isPaused) {
        var _a, _b;
        for (const [key, value] of lobbies_1.lobbies) {
            if ((player === null || player === void 0 ? void 0 : player.id) === ((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) || (player === null || player === void 0 ? void 0 : player.id) === ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id)) {
                value.gameState.gameState.isPaused = isPaused;
                return;
            }
        }
    }
    getAllClientsInARoom(roomName) {
        const clients = this.io.server.sockets.adapter.rooms.get(`${roomName}`);
        if (!clients) {
            console.log('No clients in this room');
            return;
        }
        for (const clientId of clients) {
            //this is the socket of each client in the room.
            const clientSocket = this.io.server.sockets.sockets.get(clientId);
            console.log(clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.id);
        }
    }
    isInLobby(player) {
        var _a, _b;
        for (const [key, value] of lobbies_1.lobbies) {
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === (player === null || player === void 0 ? void 0 : player.id))
                return true;
            if (((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === (player === null || player === void 0 ? void 0 : player.id))
                return true;
        }
        return false;
    }
    sendLobbies(player) {
        if (player) {
            const lobbiesArray = Array.from(lobbies_1.lobbies.entries());
            const serializedLobbies = lobbiesArray.map(([key, lobby]) => {
                var _a, _b;
                return ({
                    key,
                    player1: (_a = lobby === null || lobby === void 0 ? void 0 : lobby.player1) === null || _a === void 0 ? void 0 : _a.id,
                    player2: (_b = lobby === null || lobby === void 0 ? void 0 : lobby.player2) === null || _b === void 0 ? void 0 : _b.id,
                    // Not necessarily required, we'll see. 
                    // gameState: lobby.gameState,
                    // ballState: lobby.gameState.ballState,
                });
            });
            console.log("Lobbies here", serializedLobbies);
            this.gatewayOut.emitToUser(player.id, "getAllLobbies", { lobbies: serializedLobbies });
        }
    }
    sendPlayersPos(player) {
        var _a, _b;
        if (!player)
            return;
        for (const [key, value] of lobbies_1.lobbies) {
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === (player === null || player === void 0 ? void 0 : player.id) || ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === (player === null || player === void 0 ? void 0 : player.id)) {
                this.gatewayOut.emitToRoom(key, 'receivePlayersPos', [value.gameState.gameState.p1pos, value.gameState.gameState.p2pos]);
                return;
            }
        }
    }
    printLobbyPlayerPos() {
        for (const [key, value] of lobbies_1.lobbies) {
            console.log(key, "p1pos:", value.gameState.gameState.p1pos);
            console.log(key, "p2pos:", value.gameState.gameState.p2pos);
            console.log(key, "config: ", value.gameState.gameData);
        }
    }
};
exports.GameLobbyService = GameLobbyService;
exports.GameLobbyService = GameLobbyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gatewayOut_1.GatewayOut,
        socket_service_1.SocketService,
        socketEvents_1.SocketEvents])
], GameLobbyService);
