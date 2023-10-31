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
exports.GameLobbyService = void 0;
const common_1 = require("@nestjs/common");
const gatewayOut_1 = require("./gatewayOut");
const lobbies_1 = require("./lobbies");
const gameState_1 = require("./gameState");
const gameSockets_1 = require("./gameSockets");
const playerStatistics_service_1 = require("./playerStatistics.service");
const users_service_1 = require("../users/users.service");
let GameLobbyService = class GameLobbyService {
    constructor(gatewayOut, socketMap, playerStats, userService) {
        this.gatewayOut = gatewayOut;
        this.socketMap = socketMap;
        this.playerStats = playerStats;
        this.userService = userService;
    }
    printLobbies() {
        lobbies_1.lobbies.forEach((value, key) => {
            var _a, _b;
            console.log("------------------");
            console.log("|", key, "|");
            console.log("|", value.player1 ? '0' : 'X', "|");
            console.log("|", value.player2 ? '0' : 'X', "|");
            console.log("|", (_a = value.player1) === null || _a === void 0 ? void 0 : _a.id, "|");
            console.log("|", (_b = value.player2) === null || _b === void 0 ? void 0 : _b.id, "|");
            console.log("------------------");
        });
    }
    addPlayerToLobby(playerId, playerDbId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gatewayOut.updateLobbiesGameState();
            const player = this.socketMap.getSocket(playerId);
            if (this.isInLobby(player)) {
                console.log('Already in a lobby', player === null || player === void 0 ? void 0 : player.id);
                return;
            }
            for (const [key, value] of lobbies_1.lobbies) {
                if (!value.player1 || !value.player2) {
                    if (!value.player1) {
                        value.player1 = player;
                        value.gameState.gameState.p1Id = playerDbId;
                        const playerDb = yield this.userService.findUserWithId(playerDbId);
                        if (!playerDb)
                            throw new Error("player not found");
                        value.gameState.gameState.p1Name = playerDb === null || playerDb === void 0 ? void 0 : playerDb.username;
                    }
                    else if (!value.player2) {
                        value.player2 = player;
                        value.gameState.gameState.p2Id = playerDbId;
                        const playerDb = yield this.userService.findUserWithId(playerDbId);
                        if (!playerDb)
                            throw new Error("player not found");
                        value.gameState.gameState.p2Name = playerDb === null || playerDb === void 0 ? void 0 : playerDb.username;
                    }
                    player === null || player === void 0 ? void 0 : player.join(key);
                    this.gatewayOut.isInLobby(true, player);
                    if (value.player1 != null && value.player2 != null) {
                        this.gatewayOut.emitToRoom(key, 'isLobbyFull', true);
                        value.gameState.gameState.isLobbyFull = true;
                        this.playerStats.addGamePlayedToUsers(value.gameState.gameState.p1Id, value.gameState.gameState.p2Id);
                    }
                    // @to-do using a debug function here
                    this.printLobbies();
                    return;
                }
            }
            const lobbyName = `lobby${lobbies_1.lobbies.size}`;
            const lobby = new lobbies_1.Lobby(player, playerDbId, this.userService);
            lobbies_1.lobbies.set(lobbyName, lobby);
            player === null || player === void 0 ? void 0 : player.join(lobbyName);
            this.gatewayOut.isInLobby(true, player);
            this.printLobbies();
        });
    }
    addPlayerNameToLobby(playerId, playerSocketId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            for (const [key, lobby] of lobbies_1.lobbies) {
                const gameState = lobby.gameState.gameState;
                if (((_a = lobby.player1) === null || _a === void 0 ? void 0 : _a.id) === playerSocketId || ((_b = lobby.player2) === null || _b === void 0 ? void 0 : _b.id) === playerSocketId) {
                    const user = yield this.userService.findUserWithId(playerId);
                    if (user)
                        gameState.p1Id === playerId ? gameState.p1Name = user === null || user === void 0 ? void 0 : user.username : gameState.p2Name = user === null || user === void 0 ? void 0 : user.username;
                    else
                        throw new Error("Player not found.");
                    this.gatewayOut.emitToRoom(key, 'updateGameState', lobby.gameState.gameState);
                }
            }
        });
    }
    launchGameWithFriend(playerId, playerSocketId, friendId, friendSocketId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.socketMap.printSocketMap();
            const player1 = this.socketMap.getSocket(playerSocketId);
            const player2 = this.socketMap.getSocket(friendSocketId);
            if (!player1 || !player2)
                throw new Error("Error trying to find player socket");
            this.removePlayerFromLobby(player1);
            this.removePlayerFromLobby(player2);
            const lobbyName = `lobby${lobbies_1.lobbies.size}`;
            const lobby = new lobbies_1.Lobby(player1, playerId, this.userService);
            lobby.player2 = player2;
            lobby.gameState.gameState.p1Id = playerId;
            lobby.gameState.gameState.p2Id = friendId;
            const playerDb1 = yield this.userService.findUserWithId(playerId);
            const playerDb2 = yield this.userService.findUserWithId(friendId);
            if (!playerDb1 || !playerDb2)
                throw new Error("player not found");
            lobby.gameState.gameState.p1Name = playerDb1.username;
            lobby.gameState.gameState.p2Name = playerDb2.username;
            lobbies_1.lobbies.set(lobbyName, lobby);
            player1.join(lobbyName);
            this.gatewayOut.isInLobby(true, player1);
            player2.join(lobbyName);
            this.gatewayOut.isInLobby(true, player2);
            lobby.gameState.gameState.isLobbyFull = true;
            // @to-do using a debug function here
            this.printLobbies();
        });
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
            player.leave(key);
            // If player one leave the game
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === player.id) {
                if (lobby) {
                    lobby.player1 = null;
                }
                const p2Id = value.gameState.gameState.p2Id;
                const p2Name = value.gameState.gameState.p2Name;
                // If there is a player 2, he wins
                // There was a game so add this
                // game to the player's match history
                if (p2Id) {
                    this.playerStats.addWinToPlayer(p2Id);
                    this.playerStats.addGameToMatchHistory(value.gameState.gameState.p1Id, value.gameState.gameState.p2Name, value.gameState.gameState.score.p1Score, value.gameState.gameState.score.p2Score, true, false);
                    this.playerStats.addGameToMatchHistory(value.gameState.gameState.p2Id, value.gameState.gameState.p1Name, value.gameState.gameState.score.p2Score, value.gameState.gameState.score.p1Score, false, true);
                }
                else { // there is no more player in the lobby
                    lobbies_1.lobbies.delete(key);
                }
                // Telling the client player 1 is not in a lobby anymore
                this.gatewayOut.isInLobby(false, player);
                // Re init the room game state
                value.gameState = new gameState_1.GameState();
                value.gameState.gameState.p2Id = p2Id;
                value.gameState.gameState.p2Name = p2Name;
                this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
                // @to-do using a debug function here
                this.printLobbies();
                return;
            }
            // If player one leave the game
            if (((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === player.id) {
                if (lobby) {
                    lobby.player2 = null;
                }
                const p1Id = value.gameState.gameState.p1Id;
                const p1Name = value.gameState.gameState.p1Name;
                // If there is a player 1, he wins
                // There was a game so add this
                // game to the player's match history
                if (p1Id) {
                    console.log("Before adding win in p2");
                    this.playerStats.addWinToPlayer(p1Id);
                    console.log("After adding win in p2");
                    this.playerStats.addGameToMatchHistory(value.gameState.gameState.p1Id, value.gameState.gameState.p2Name, value.gameState.gameState.score.p1Score, value.gameState.gameState.score.p2Score, false, true);
                    this.playerStats.addGameToMatchHistory(value.gameState.gameState.p2Id, value.gameState.gameState.p1Name, value.gameState.gameState.score.p2Score, value.gameState.gameState.score.p1Score, true, false);
                }
                else { // there is no more player in the lobby
                    console.log("Lobby erased in p2");
                    lobbies_1.lobbies.delete(key);
                }
                // Telling the client player 1 is not in a lobby anymore
                this.gatewayOut.isInLobby(false, player);
                // Re init the room game state
                value.gameState = new gameState_1.GameState();
                value.gameState.gameState.p1Id = p1Id;
                value.gameState.gameState.p1Name = p1Name;
                this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
                // @to-do using a debug function here
                this.printLobbies();
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
        const clients = this.socketMap.server.sockets.adapter.rooms.get(`${roomName}`);
        if (!clients) {
            console.log('No clients in this room');
            return;
        }
        for (const clientId of clients) {
            //this is the socket of each client in the room.
            const clientSocket = this.socketMap.server.sockets.sockets.get(clientId);
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
            const serializedLobbies = lobbiesArray.map(([key, lobby]) => ({
                key,
                player1: lobby === null || lobby === void 0 ? void 0 : lobby.gameState.gameState.p1Name,
                player2: lobby === null || lobby === void 0 ? void 0 : lobby.gameState.gameState.p2Name,
            }));
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
    sendLobbyGameState(player) {
        var _a, _b;
        if (!player)
            return;
        for (const [key, value] of lobbies_1.lobbies) {
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === player.id || ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === (player === null || player === void 0 ? void 0 : player.id)) {
                this.gatewayOut.emitToRoom(key, 'updateGameState', value.gameState.gameState);
                return;
            }
        }
    }
    sendLobbyState(player) {
        var _a, _b;
        console.log("ET LA  ???");
        if (!player)
            return;
        for (const [key, value] of lobbies_1.lobbies) {
            console.log("nom du lobby = ", key);
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === player.id || ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === (player === null || player === void 0 ? void 0 : player.id)) {
                console.log("je passe ici ou pas ???");
                this.gatewayOut.emitToRoom(key, 'lobbyState', value.gameState.gameState);
                return;
            }
        }
    }
    changePlayerColor(player, color) {
        var _a, _b, _c;
        if (!player)
            return;
        for (const [key, value] of lobbies_1.lobbies) {
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === player.id || ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === (player === null || player === void 0 ? void 0 : player.id)) {
                ((_c = value.player1) === null || _c === void 0 ? void 0 : _c.id) === player.id ? value.gameState.gameState.p1Color = color : value.gameState.gameState.p2Color = color;
                this.gatewayOut.emitToRoom(key, 'updateGameState', value.gameState.gameState);
            }
        }
    }
};
exports.GameLobbyService = GameLobbyService;
exports.GameLobbyService = GameLobbyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gatewayOut_1.GatewayOut,
        gameSockets_1.gameSockets,
        playerStatistics_service_1.playerStatistics,
        users_service_1.UsersService])
], GameLobbyService);
