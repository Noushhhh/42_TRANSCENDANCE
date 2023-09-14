import { Injectable } from '@nestjs/common';
import { GatewayOut } from './gatewayOut';
import { Lobby, lobbies } from './lobbies';
import { Socket } from 'socket.io';
import { SocketService } from '../socket/socket.service';
import { GameState } from './gameState';
import { SocketEvents } from '../socket/socketEvents';

@Injectable()
export class GameLobbyService {

  constructor(
    private readonly gatewayOut: GatewayOut,
    private readonly socketMap: SocketService,
    private readonly io: SocketEvents,
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

  addPlayerToLobby(playerId: string): void {
    const player = this.socketMap.getSocket(playerId);
    if (this.isInLobby(player)) {
      console.log('Already in a lobby', player);
      return;
    }

    for (const [key, value] of lobbies) {
      if (!value.player1 || !value.player2) {
        if (!value.player1) {
          value.player1 = player;
        } else if (!value.player2) {
          value.player2 = player;
        }
        player?.join(key);
        this.gatewayOut.isInLobby(true, player);
        if (value.player1 != null && value.player2 != null) {
          this.gatewayOut.emitToRoom(key, 'isLobbyFull', true);
          value.gameState.gameState.isLobbyFull === true;
        }
        return;
      }
    }

    const lobbyName = `lobby${lobbies.size}`;
    const lobby = new Lobby(player);
    lobbies.set(lobbyName, lobby);
    player?.join(lobbyName);
    this.gatewayOut.isInLobby(true, player);
    this.getAllClientsInARoom(lobbyName);
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
        this.gatewayOut.isInLobby(false, player);
        value.gameState = new GameState();
        return;
      }
      if (value.player2?.id === player.id) {
        if (lobby) {
          lobby.player2 = null;
        }
        this.gatewayOut.isInLobby(false, player);
        value.gameState = new GameState();
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
    const clients = this.io.server.sockets.adapter.rooms.get(`${roomName}`);
    if (!clients) {
      console.log('No clients in this room');
      return;
    }
    for (const clientId of clients) {

      //this is the socket of each client in the room.
      const clientSocket = this.io.server.sockets.sockets.get(clientId);

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
        // Not necessarily required, we'll see. 
        // gameState: lobby.gameState,
        // ballState: lobby.gameState.ballState,
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
}
