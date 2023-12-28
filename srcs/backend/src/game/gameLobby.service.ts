import { Injectable, NotFoundException } from '@nestjs/common';
import { GatewayOut } from './gatewayOut';
import { Lobby, lobbies } from './lobbies';
import { Socket } from 'socket.io';
import { GameState } from './gameState';
import { gameSockets } from './gameSockets';
import { playerStatistics } from './playerStatistics.service';
import { UsersService } from '../users/users.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GameLobbyService {

  constructor(
    private readonly gatewayOut: GatewayOut,
    private readonly socketMap: gameSockets,
    private readonly playerStats: playerStatistics,
    private readonly userService: UsersService,
  ) { }

  printLobbies() {
    console.log("lobbies size", lobbies.size);
    lobbies.forEach((value: Lobby, key: string) => {
      console.log("------------------")
      console.log("|", key, "|")
      console.log("|", value.player1 ? '0' : 'X', "|")
      console.log("|", value.player2 ? '0' : 'X', "|")
      console.log("|", value.player1?.id, "|")
      console.log("|", value.player2?.id, "|")
      console.log("------------------")
    })
  }

  async addPlayerToLobby(playerId: string, playerDbId: number) {
    this.gatewayOut.updateLobbiesGameState();
    const player = this.socketMap.getSocket(playerId);
    if (!player) {
      throw new NotFoundException("player not found");
    }

    if (this.isInLobby(player)) {
      console.log('Already in a lobby', player?.id);
      return;
    }

    for (const [key, value] of lobbies) {
      if (!value.player1 || !value.player2) {
        if (!value.player1) {
          // Adding p1 to lobby
          value.player1 = player;
          value.gameState.gameState.p1Id = playerDbId;
          const playerDb = await this.userService.findUserWithId(playerDbId);
          if (!playerDb) {
            throw new NotFoundException("player not found");
          }
          const playerUserName = playerDb?.publicName ? playerDb?.publicName : playerDb?.username;
          value.gameState.gameState.p1Name = playerUserName;
        } else if (!value.player2) {
          // Adding p1 to lobby
          value.player2 = player;
          value.gameState.gameState.p2Id = playerDbId;
          const playerDb = await this.userService.findUserWithId(playerDbId);
          if (!playerDb) {
            console.log("C'est ici que ca casse ?")
            throw new NotFoundException("player not found");
          }
          const playerUserName = playerDb?.publicName ? playerDb?.publicName : playerDb?.username;
          value.gameState.gameState.p2Name = playerUserName;
        }
        // Adding player to socket room and set him to "isInLobby"
        player?.join(key);
        this.gatewayOut.isInLobby(true, player);

        // If the lobby is full, I tell it to the clients so it launch the game
        if (value.player1 != null && value.player2 != null) {
          this.gatewayOut.emitToRoom(key, 'isLobbyFull', true);
          value.gameState.gameState.isLobbyFull = true;
          value.gameState.gameState.newGameTimer = true;
          setTimeout(() => {
            value.gameState.gameState.newGameTimer = false;
          }, 1500);
        }
        // @to-do using a debug function here
        this.printLobbies();
        return;
      }
    }

    // If there are no lobbies with one player in it
    const lobbyName = uuid();
    const lobby = await Lobby.create(player, playerDbId, this.userService);
    if (!lobby) {
      throw new NotFoundException("Error during lobby creation");
    }

    lobbies.set(lobbyName, lobby);
    player?.join(lobbyName);
    this.gatewayOut.isInLobby(true, player);
    this.printLobbies();
  }

  async launchGameWithFriend(playerId: number, playerSocketId: string, friendId: number, friendSocketId: string) {
    this.socketMap.printSocketMap();

    const lobbyName = uuid();

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

    const lobby = await Lobby.create(player1, playerId, this.userService);
    if (!lobby) {
      this.gatewayOut.emitToUser(player1.id, "error", { statusCode: 404, message: "Error during lobby creation" });
      return;
    }

    lobby.player2 = player2;
    lobby.gameState.gameState.p1Id = playerId;
    lobby.gameState.gameState.p2Id = friendId;

    const playerDb1 = await this.userService.findUserWithId(playerId);
    if (!player1) {
      this.gatewayOut.emitToUser(friendSocketId, "error", { statusCode: 404, message: "player not found" });
      return;
    }

    const playerDb2 = await this.userService.findUserWithId(friendId);
    if (!player2) {
      this.gatewayOut.emitToUser(playerSocketId, "error", { statusCode: 404, message: "player not found" });
      return;
    }
    const p1UserName = playerDb1.publicName ? playerDb1.publicName : playerDb1.username;
    const p2UserName = playerDb2.publicName ? playerDb2.publicName : playerDb2.username;

    lobby.gameState.gameState.p1Name = p1UserName;
    lobby.gameState.gameState.p2Name = p2UserName;

    lobbies.set(lobbyName, lobby);
    player1.join(lobbyName);
    this.gatewayOut.isInLobby(true, player1);
    player2.join(lobbyName);
    this.gatewayOut.isInLobby(true, player2);
    lobby.gameState.gameState.isLobbyFull = true;

    this.gatewayOut.emitToRoom(lobbyName, "lobbyIsCreated", true);

    lobby.gameState.gameState.newGameTimer = true;
    setTimeout(() => {
      lobby.gameState.gameState.newGameTimer = false;
    }, 1500);

    // @to-do using a debug function here
    this.printLobbies();
  }

  addSpectatorToLobby(spectatorId: string, lobbyName: string) {
    const spectator = this.socketMap.getSocket(spectatorId);
    if (!spectator) return;

    for (const [key, value] of lobbies) {
      if (key === lobbyName) {
        value.spectators?.push(spectator);
        spectator.join(lobbyName);
        this.gatewayOut.isInLobby(true, spectator);
        this.gatewayOut.emitToUser(spectatorId, "isLobbyFull", true);
      }
    }
  }

  async removePlayerFromLobby(player: Socket) {
    for (const [key, value] of lobbies) {
      const lobby = lobbies.get(key);
      player.leave(key);
      // If player one leave the game
      if (value.player1?.id === player.id) {
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
          await this.playerStats.addGameStatsToPlayers(value, p2Id, true, false);
        } else if (!p2Id) { // there is no more player in the lobby
          lobbies.delete(key);
        }
        // Telling the client that player 1 is not in a lobby anymore
        this.gatewayOut.isInLobby(false, player);
        // Re init the room game state
        value.gameState = new GameState();
        value.gameState.gameState.p2Id = p2Id
        value.gameState.gameState.p2Name = p2Name;
        this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
        // @to-do using a debug function here
        this.printLobbies();
        return;
      }
      // If player one leave the game
      if (value.player2?.id === player.id) {
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
          await this.playerStats.addGameStatsToPlayers(value, p1Id, false, true);
        } else if (!p1Id) { // there is no more player in the lobby
          lobbies.delete(key);
        }

        // Telling the client that player 2 is not in a lobby anymore
        this.gatewayOut.isInLobby(false, player);
        // Re init the room game state
        value.gameState = new GameState();
        value.gameState.gameState.p1Id = p1Id;
        value.gameState.gameState.p1Name = p1Name;
        this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
        this.gatewayOut.emitToUser(player.id, "isLobbyFull", false);
        // @to-do using a debug function here
        this.printLobbies();
        return;
      }
    }
  }

  getAllClientsInARoom(roomName: string) {
    const clients = this.socketMap.server.sockets.adapter.rooms.get(`${roomName}`);
    if (!clients) {
      console.log('No clients in this room');
      return;
    }
    for (const clientId of clients) {

      //this is the socket of each client in the room.
      const clientSocket = this.socketMap.server.sockets.sockets.get(clientId);

      console.log(clientSocket?.id);
    }
  }

  isInLobby(player: Socket | undefined): boolean {
    for (const [key, value] of lobbies) {
      if (value.player1?.id === player?.id)
        return true;
      if (value.player2?.id === player?.id)
        return true;
    }
    return false;
  }

  sendLobbies(player: Socket | undefined) {
    if (player) {
      const lobbiesArray = Array.from(lobbies.entries());
      const serializedLobbies = lobbiesArray.map(([key, lobby]) => ({
        key,
        player1: lobby?.gameState.gameState.p1Name,
        player2: lobby?.gameState.gameState.p2Name,
      }));
      this.gatewayOut.emitToUser(player.id, "getAllLobbies", { lobbies: serializedLobbies });
    }
  }

  sendPlayersPos(player: Socket | undefined) {
    if (!player) return
    for (const [key, value] of lobbies) {
      if (value.player1?.id === player?.id || value.player2?.id === player?.id) {
        this.gatewayOut.emitToRoom(key, 'receivePlayersPos', [value.gameState.gameState.p1pos, value.gameState.gameState.p2pos]);
        return;
      }
    }
  }

  printLobbyPlayerPos() {
    for (const [key, value] of lobbies) {
      console.log(key, "p1pos:", value.gameState.gameState.p1pos);
      console.log(key, "p2pos:", value.gameState.gameState.p2pos);
      console.log(key, "config: ", value.gameState.gameData);
    }
  }

  sendLobbyGameState(player: Socket | undefined) {
    if (!player) return;
    for (const [key, value] of lobbies) {
      if (value.player1?.id === player.id || value.player2?.id === player?.id) {
        this.gatewayOut.emitToRoom(key, 'updateGameState', value.gameState.gameState);
        return;
      }
    }
  }

  sendLobbyState(player: Socket | undefined) {
    if (!player) return;

    for (const [key, value] of lobbies) {
      if (value.player1?.id === player.id || value.player2?.id === player?.id) {
        this.gatewayOut.emitToRoom(key, 'lobbyState', value.gameState.gameState);
        return;
      }
    }
  }

  changePlayerColor(player: Socket, color: string) {
    if (!player) return;
    for (const [key, value] of lobbies) {
      if (value.player1?.id === player.id || value.player2?.id === player?.id) {
        value.player1?.id === player.id ? value.gameState.gameState.p1Color = color : value.gameState.gameState.p2Color = color
        this.gatewayOut.emitToRoom(key, 'updateGameState', value.gameState.gameState);
      }
    }
  }

  isPlayerInGame(playerId: number): { isInGame: boolean, lobbyName: string | undefined } {
    const playerSocketId = this.getSocketIdWithId(playerId);

    for (const [key, value] of lobbies) {
      if (playerSocketId === value.player1?.id || playerSocketId === value.player2?.id) {
        if (value.gameState.gameState.isLobbyFull)
          return { isInGame: true, lobbyName: key };
      }
    }
    return { isInGame: false, lobbyName: undefined };
  }

  private getSocketIdWithId(playerId: number): string | undefined {
    for (const [key, value] of lobbies) {
      if (playerId === value.gameState.gameState.p1Id || playerId === value.gameState.gameState.p2Id) {
        return playerId === value.gameState.gameState.p1Id ? value.player1?.id : value.player2?.id;
      }
    }
    return undefined;
  }

  getPlayerOpponentSocketId(playerId: string): string | undefined {
    for (const [key, value] of lobbies) {
      if (value.player1?.id === playerId || value.player2?.id === playerId) {
        return value.player1?.id === playerId ? value.player2?.id : value.player1?.id;
      }
    }
    return undefined;
  }

  isThisClientP1(playerId: string): boolean {
    for (const [key, value] of lobbies) {
      if (value.player1?.id === playerId || value.player2?.id === playerId) {
        return value.player1?.id === playerId ? true : false;
      }
    }
    return false;
  }

  playAgain(playerId: string) {
    for (const [key, value] of lobbies) {
      if (value.player1?.id === playerId || value.player2?.id === playerId) {
        value.gameState.gameState.isGameFinished = false;
      }
    }
  }

  isInSpectateMode(playerId: string) {
    for (const [key, value] of lobbies) {
      value.spectators?.forEach((spec) => {
        console.log("SPEC ? %s, playerId = %s", spec.id, playerId);
        if (spec.id === playerId)
          this.gatewayOut.emitToUser(playerId, "isInSpectateMode", true);
      })
    }
  }
}
