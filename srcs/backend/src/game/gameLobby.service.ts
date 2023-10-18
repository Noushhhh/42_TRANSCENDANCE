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
      console.log("|", value, "|  ", key, "|")
      console.log("|", value.gameState.gameState.p1pos.x, "|")
      console.log("|", value.gameState.gameState.p1pos.y, "|")
      console.log("------------------")
    })
  }

  addPlayerToLobby(playerId: string, playerDbId: number) {
    this.gatewayOut.updateLobbiesGameState();
    const player = this.socketMap.getSocket(playerId);
    if (this.isInLobby(player)) {
      console.log('Already in a lobby', player?.id);
      return;
    }

    for (const [key, value] of lobbies) {
      if (!value.player1 || !value.player2) {
        if (!value.player1) {
          value.player1 = player;
          value.gameState.gameState.p1Id = playerDbId;
        } else if (!value.player2) {
          value.player2 = player;
          value.gameState.gameState.p2Id = playerDbId;
        }
        player?.join(key);
        this.gatewayOut.isInLobby(true, player);
        if (value.player1 != null && value.player2 != null) {
          this.gatewayOut.emitToRoom(key, 'isLobbyFull', true);
          value.gameState.gameState.isLobbyFull = true;
          this.playerStats.addGamePlayedToUsers(value.gameState.gameState.p1Id, value.gameState.gameState.p2Id);
        }
        return;
      }
    }

    const lobbyName = `lobby${lobbies.size}`;
    const lobby = new Lobby(player, playerDbId);
    lobbies.set(lobbyName, lobby);
    player?.join(lobbyName);
    this.gatewayOut.isInLobby(true, player);
    this.getAllClientsInARoom(lobbyName);
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
      if (value.player1?.id === player.id) {
        if (lobby) {
          lobby.player1 = null;
        }
        const p2Id = value.gameState.gameState.p2Id;
        if (p2Id)
          this.playerStats.addWinToPlayer(p2Id);
        this.gatewayOut.isInLobby(false, player);
        value.gameState = new GameState();
        value.gameState.gameState.p2Id = p2Id
        this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
        return;
      }
      if (value.player2?.id === player.id) {
        if (lobby) {
          lobby.player2 = null;
        }
        const p1Id = value.gameState.gameState.p1Id;
        if (p1Id)
          this.playerStats.addWinToPlayer(p1Id);
        this.gatewayOut.isInLobby(false, player);
        value.gameState = new GameState();
        value.gameState.gameState.p1Id = p1Id
        this.gatewayOut.emitToRoom(key, "isLobbyFull", false);
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
