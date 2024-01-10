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
const uuid_1 = require("uuid");
let GameLobbyService = class GameLobbyService {
    constructor(gatewayOut, socketMap, playerStats, userService) {
        this.gatewayOut = gatewayOut;
        this.socketMap = socketMap;
        this.playerStats = playerStats;
        this.userService = userService;
    }
    addPlayerToLobby(playerId, playerDbId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gatewayOut.updateLobbiesGameState();
            const player = this.socketMap.getSocket(playerId);
            if (!player) {
                throw new common_1.NotFoundException("player not found");
            }
            if (this.isInLobby(player)) {
                console.log('Already in a lobby', player === null || player === void 0 ? void 0 : player.id);
                return;
            }
            for (const [key, value] of lobbies_1.lobbies) {
                if (!value.player1 || !value.player2) {
                    if (!value.player1) {
                        // Adding p1 to lobby
                        value.player1 = player;
                        value.gameState.gameState.p1Id = playerDbId;
                        const playerDb = yield this.userService.findUserWithId(playerDbId);
                        if (!playerDb) {
                            throw new common_1.NotFoundException("player not found");
                        }
                        const playerUserName = (playerDb === null || playerDb === void 0 ? void 0 : playerDb.publicName) ? playerDb === null || playerDb === void 0 ? void 0 : playerDb.publicName : playerDb === null || playerDb === void 0 ? void 0 : playerDb.username;
                        value.gameState.gameState.p1Name = playerUserName;
                    }
                    else if (!value.player2) {
                        // Adding p1 to lobby
                        value.player2 = player;
                        value.gameState.gameState.p2Id = playerDbId;
                        const playerDb = yield this.userService.findUserWithId(playerDbId);
                        if (!playerDb) {
                            throw new common_1.NotFoundException("player not found");
                        }
                        const playerUserName = (playerDb === null || playerDb === void 0 ? void 0 : playerDb.publicName) ? playerDb === null || playerDb === void 0 ? void 0 : playerDb.publicName : playerDb === null || playerDb === void 0 ? void 0 : playerDb.username;
                        value.gameState.gameState.p2Name = playerUserName;
                    }
                    // Adding player to socket room and set him to "isInLobby"
                    player === null || player === void 0 ? void 0 : player.join(key);
                    this.gatewayOut.isInLobby(true, player);
                    // If the lobby is full, I tell it to the clients so it launch the game
                    if (value.player1 != null && value.player2 != null) {
                        this.gatewayOut.emitToRoom(key, 'isLobbyFull', true);
                        value.gameState.gameState.isLobbyFull = true;
                        value.gameState.gameState.newGameTimer = true;
                        setTimeout(() => {
                            value.gameState.gameState.newGameTimer = false;
                        }, 3000);
                    }
                    return;
                }
            }
            // If there are no lobbies with one player in it
            const lobbyName = (0, uuid_1.v4)();
            const lobby = yield lobbies_1.Lobby.create(player, playerDbId, this.userService);
            if (!lobby) {
                throw new common_1.NotFoundException("Error during lobby creation");
            }
            lobbies_1.lobbies.set(lobbyName, lobby);
            player === null || player === void 0 ? void 0 : player.join(lobbyName);
            this.gatewayOut.isInLobby(true, player);
        });
    }
    launchGameWithFriend(playerId, playerSocketId, friendId, friendSocketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const lobbyName = (0, uuid_1.v4)();
            const player1 = this.socketMap.getSocket(playerSocketId);
            if (!player1) {
                this.gatewayOut.emitToUser(friendSocketId, "error", { statusCode: 404, message: "player not found" });
                return;
            }
            const player2 = this.socketMap.getSocket(friendSocketId);
            if (!player2) {
                this.gatewayOut.emitToUser(playerSocketId, "error", { statusCode: 404, message: "player not found" });
                return;
            }
            const lobby = yield lobbies_1.Lobby.create(player1, playerId, this.userService);
            if (!lobby) {
                this.gatewayOut.emitToUser(player1.id, "error", { statusCode: 404, message: "Error during lobby creation" });
                return;
            }
            lobby.player2 = player2;
            lobby.gameState.gameState.p1Id = playerId;
            lobby.gameState.gameState.p2Id = friendId;
            const playerDb1 = yield this.userService.findUserWithId(playerId);
            if (!player1) {
                this.gatewayOut.emitToUser(friendSocketId, "error", { statusCode: 404, message: "player not found" });
                return;
            }
            const playerDb2 = yield this.userService.findUserWithId(friendId);
            if (!player2) {
                this.gatewayOut.emitToUser(playerSocketId, "error", { statusCode: 404, message: "player not found" });
                return;
            }
            const p1UserName = playerDb1.publicName ? playerDb1.publicName : playerDb1.username;
            const p2UserName = playerDb2.publicName ? playerDb2.publicName : playerDb2.username;
            lobby.gameState.gameState.p1Name = p1UserName;
            lobby.gameState.gameState.p2Name = p2UserName;
            lobbies_1.lobbies.set(lobbyName, lobby);
            player1.join(lobbyName);
            this.gatewayOut.isInLobby(true, player1);
            player2.join(lobbyName);
            this.gatewayOut.isInLobby(true, player2);
            lobby.gameState.gameState.isLobbyFull = true;
            this.gatewayOut.emitToRoom(lobbyName, "lobbyIsCreated", true);
            lobby.gameState.gameState.newGameTimer = true;
            setTimeout(() => {
                lobby.gameState.gameState.newGameTimer = false;
            }, 3000);
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
        return __awaiter(this, void 0, void 0, function* () {
            for (const [key, value] of lobbies_1.lobbies) {
                const lobby = lobbies_1.lobbies.get(key);
                player.leave(key);
                // If player one leave the game
                if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === player.id) {
                    const p1SocketId = this.getSocketIdWithId(value.gameState.gameState.p1Id);
                    if (lobby) {
                        lobby.player1 = null;
                    }
                    const p2Id = value.gameState.gameState.p2Id;
                    const p2Name = value.gameState.gameState.p2Name;
                    // If there is a player 2, he wins
                    // There was a game so add this
                    // game to the player's match history
                    if (p2Id && value.gameState.gameState.isGameFinished === false) {
                        yield this.playerStats.addGameStatsToPlayers(value, p2Id, true, false);
                    }
                    else if (!p2Id) { // there is no more player in the lobby
                        lobbies_1.lobbies.delete(key);
                    }
                    // Telling the client that player 1 is not in a lobby anymore
                    this.gatewayOut.isInLobby(false, player);
                    // Re init the room game state
                    value.gameState = new gameState_1.GameState();
                    value.gameState.gameState.p2Id = p2Id;
                    value.gameState.gameState.p2Name = p2Name;
                    this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
                    return;
                }
                // If player one leave the game
                if (((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === player.id) {
                    const p2SocketId = this.getSocketIdWithId(value.gameState.gameState.p2Id);
                    if (lobby) {
                        lobby.player2 = null;
                    }
                    const p1Id = value.gameState.gameState.p1Id;
                    const p1Name = value.gameState.gameState.p1Name;
                    // If there is a player 1, he wins
                    // There was a game so add this
                    // game to the player's match history
                    if (p1Id && value.gameState.gameState.isGameFinished === false) {
                        yield this.playerStats.addGameStatsToPlayers(value, p1Id, false, true);
                    }
                    else if (!p1Id) { // there is no more player in the lobby
                        lobbies_1.lobbies.delete(key);
                    }
                    // Telling the client that player 2 is not in a lobby anymore
                    this.gatewayOut.isInLobby(false, player);
                    // Re init the room game state
                    value.gameState = new gameState_1.GameState();
                    value.gameState.gameState.p1Id = p1Id;
                    value.gameState.gameState.p1Name = p1Name;
                    this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
                    this.gatewayOut.emitToUser(player.id, "isLobbyFull", false);
                    return;
                }
            }
        });
    }
    getAllClientsInARoom(roomName) {
        const clients = this.socketMap.server.sockets.adapter.rooms.get(`${roomName}`);
        if (!clients) {
            console.log('No clients in this room');
            return;
        }
        for (const clientId of clients) {
            const clientSocket = this.socketMap.server.sockets.sockets.get(clientId);
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
        if (!player)
            return;
        for (const [key, value] of lobbies_1.lobbies) {
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === player.id || ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === (player === null || player === void 0 ? void 0 : player.id)) {
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
    isPlayerInGame(playerId) {
        var _a, _b;
        const playerSocketId = this.getSocketIdWithId(playerId);
        for (const [key, value] of lobbies_1.lobbies) {
            if (playerSocketId === ((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) || playerSocketId === ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id)) {
                if (value.gameState.gameState.isLobbyFull)
                    return { isInGame: true, lobbyName: key };
            }
        }
        return { isInGame: false, lobbyName: undefined };
    }
    getSocketIdWithId(playerId) {
        var _a, _b;
        for (const [key, value] of lobbies_1.lobbies) {
            if (playerId === value.gameState.gameState.p1Id || playerId === value.gameState.gameState.p2Id) {
                return playerId === value.gameState.gameState.p1Id ? (_a = value.player1) === null || _a === void 0 ? void 0 : _a.id : (_b = value.player2) === null || _b === void 0 ? void 0 : _b.id;
            }
        }
        return undefined;
    }
    getPlayerOpponentSocketId(playerId) {
        var _a, _b, _c, _d, _e;
        for (const [key, value] of lobbies_1.lobbies) {
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === playerId || ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === playerId) {
                return ((_c = value.player1) === null || _c === void 0 ? void 0 : _c.id) === playerId ? (_d = value.player2) === null || _d === void 0 ? void 0 : _d.id : (_e = value.player1) === null || _e === void 0 ? void 0 : _e.id;
            }
        }
        return undefined;
    }
    isThisClientP1(playerId) {
        var _a, _b, _c;
        for (const [key, value] of lobbies_1.lobbies) {
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === playerId || ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === playerId) {
                return ((_c = value.player1) === null || _c === void 0 ? void 0 : _c.id) === playerId ? true : false;
            }
        }
        return false;
    }
    playAgain(playerId) {
        var _a, _b;
        for (const [key, value] of lobbies_1.lobbies) {
            if (((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) === playerId || ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id) === playerId) {
                value.gameState.gameState.isGameFinished = false;
            }
        }
    }
    isInSpectateMode(playerId) {
        var _a;
        for (const [key, value] of lobbies_1.lobbies) {
            if ((_a = value.spectators) === null || _a === void 0 ? void 0 : _a.some((spec) => spec.id === playerId)) {
                this.gatewayOut.emitToUser(playerId, "isInSpectateMode", true);
                return true;
            }
        }
        return false;
    }
    removeFromSpectate(playerId) {
        var _a;
        for (const [key, value] of lobbies_1.lobbies) {
            (_a = value.spectators) === null || _a === void 0 ? void 0 : _a.forEach((spec, i) => {
                var _a;
                if (spec.id === playerId) {
                    (_a = value.spectators) === null || _a === void 0 ? void 0 : _a.splice(i, 1);
                    this.gatewayOut.removeSpectate(false, playerId, key);
                }
            });
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
