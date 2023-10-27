import { Injectable } from '@nestjs/common';
import { GatewayOut } from './gatewayOut';
import { Lobby, lobbies } from './lobbies';
import { Socket } from 'socket.io';
import { GameState } from './gameState';
import { gameSockets } from './gameSockets';
import { playerStatistics } from './playerStatistics.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GameLobbyService {

  constructor(
    private readonly gatewayOut: GatewayOut,
    private readonly socketMap: gameSockets,
    private readonly playerStats: playerStatistics,
    private readonly userService: UsersService,
  ) { }

  private printLobbies() {
    lobbies.forEach((value: Lobby, key: string) => {
      console.log("------------------")
      console.log("|", key, "|")
      console.log("|", value.player1 ? '0' : 'X', "|")
      console.log("|", value.player2 ? '0' : 'X', "|")
      console.log("------------------")
    })
  }

  async addPlayerToLobby(playerId: string, playerDbId: number) {
    this.gatewayOut.updateLobbiesGameState();
    const player = this.socketMap.getSocket(playerId);
    console.log("je log les donnes: ", playerId, playerDbId);
    if (this.isInLobby(player)) {
      console.log('Already in a lobby', player?.id);
      return;
    }

    for (const [key, value] of lobbies) {
      if (!value.player1 || !value.player2) {
        if (!value.player1) {
          console.log("je suis bien ici car p1 est partit et il revient");
          value.player1 = player;
          value.gameState.gameState.p1Id = playerDbId;
          const playerDb = await this.userService.findUserWithId(playerDbId);
          if (!playerDb)
            throw new Error("player not found")
          value.gameState.gameState.p1Name = playerDb?.username;
          console.log("ici j'ajoue name du P1", playerDb?.username);
        } else if (!value.player2) {
          value.player2 = player;
          value.gameState.gameState.p2Id = playerDbId;
          const playerDb = await this.userService.findUserWithId(playerDbId);
          if (!playerDb)
            throw new Error("player not found")
          value.gameState.gameState.p2Name = playerDb?.username;
          console.log("ici j'ajoue name du P2", playerDb?.username);
        }
        player?.join(key);
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

    const lobbyName = `lobby${lobbies.size}`;
    const lobby = new Lobby(player, playerDbId, this.userService);
    lobbies.set(lobbyName, lobby);
    player?.join(lobbyName);
    this.gatewayOut.isInLobby(true, player);
    this.printLobbies();
  }

  async addPlayerNameToLobby(playerId: number, playerSocketId: string) {
    for (const [key, lobby] of lobbies) {
      const gameState = lobby.gameState.gameState;
      if (lobby.player1?.id === playerSocketId || lobby.player2?.id === playerSocketId) {
        const user = await this.userService.findUserWithId(playerId);
        if (user)
          gameState.p1Id === playerId ? gameState.p1Name = user?.username : gameState.p2Name = user?.username;
        else
          throw new Error("Player not found.");
        this.gatewayOut.emitToRoom(key, 'updateGameState', lobby.gameState.gameState);
      }
    }
  }

  async launchGameWithFriend(playerId: number, playerSocketId: string, friendId: number, friendSocketId: string) {
    const player1 = this.socketMap.getSocket(playerSocketId);
    const player2 = this.socketMap.getSocket(friendSocketId);

    if (!player1 || !player2)
      throw new Error("Error trying to find player socket");


    const lobbyName = `lobby${lobbies.size}`;
    const lobby = new Lobby(player1, playerId, this.userService);
    lobby.player2 = player2;
    lobby.gameState.gameState.p1Id = playerId;
    lobby.gameState.gameState.p2Id = friendId;
    const playerDb1 = await this.userService.findUserWithId(playerId);
    const playerDb2 = await this.userService.findUserWithId(friendId);
    if (!playerDb1 || !playerDb2)
      throw new Error("player not found")
    lobby.gameState.gameState.p1Name = playerDb1.username;
    lobby.gameState.gameState.p2Name = playerDb2.username;

    lobbies.set(lobbyName, lobby);
    player1.join(lobbyName);
    this.gatewayOut.isInLobby(true, player1);
    player2.join(lobbyName);
    this.gatewayOut.isInLobby(true, player2);

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

  removePlayerFromLobby(player: Socket) {
    for (const [key, value] of lobbies) {
      const lobby = lobbies.get(key);
      player.leave(key);
      // If player one leave the game
      if (value.player1?.id === player.id) {
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
          this.playerStats.addGameToMatchHistory(value.gameState.gameState.p1Id,
            value.gameState.gameState.p2Name, value.gameState.gameState.score.p1Score,
            value.gameState.gameState.score.p2Score, true, false);
          this.playerStats.addGameToMatchHistory(value.gameState.gameState.p2Id,
            value.gameState.gameState.p1Name, value.gameState.gameState.score.p2Score,
            value.gameState.gameState.score.p1Score, false, true);
        }
        // Telling the client player 1 is not in a lobby anymore
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
        if (lobby) {
          lobby.player2 = null;
        }
        const p1Id = value.gameState.gameState.p1Id;
        const p1Name = value.gameState.gameState.p1Name;
        // If there is a player 1, he wins
        // There was a game so add this
        // game to the player's match history
        if (p1Id) {
          this.playerStats.addWinToPlayer(p1Id);
          this.playerStats.addGameToMatchHistory(value.gameState.gameState.p1Id,
            value.gameState.gameState.p2Name, value.gameState.gameState.score.p1Score,
            value.gameState.gameState.score.p2Score, false, true);
          this.playerStats.addGameToMatchHistory(value.gameState.gameState.p2Id,
            value.gameState.gameState.p1Name, value.gameState.gameState.score.p2Score,
            value.gameState.gameState.score.p1Score, true, false);
        }
        // Telling the client player 1 is not in a lobby anymore
        this.gatewayOut.isInLobby(false, player);
        // Re init the room game state
        value.gameState = new GameState();
        value.gameState.gameState.p1Id = p1Id;
        value.gameState.gameState.p1Name = p1Name;
        this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
        // @to-do using a debug function here
        this.printLobbies();
        return;
      }
    }
  }

  isPaused(player: Socket | undefined, isPaused: boolean) {
    for (const [key, value] of lobbies) {
      if (player?.id === value.player1?.id || player?.id === value.player2?.id) {
        value.gameState.gameState.isPaused = isPaused;
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

  private isInLobby(player: Socket | undefined): boolean {
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
        player1: lobby?.player1?.id,
        player2: lobby?.player2?.id,
      }));
      console.log("Lobbies here", serializedLobbies);
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

  changePlayerColor(player: Socket, color: string) {
    if (!player) return;
    for (const [key, value] of lobbies) {
      if (value.player1?.id === player.id || value.player2?.id === player?.id) {
        value.player1?.id === player.id ? value.gameState.gameState.p1Color = color : value.gameState.gameState.p2Color = color
        this.gatewayOut.emitToRoom(key, 'updateGameState', value.gameState.gameState);
      }
    }
  }
}
