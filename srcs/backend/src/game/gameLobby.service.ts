import { Injectable } from '@nestjs/common';
import { GatewayOut } from './gatewayOut';
import { Lobby, lobbies } from './lobbies';
import { Socket } from 'socket.io';
import { SocketService } from '../socket/socket.service';
import { GameState } from './gameState';

@Injectable()
export class GameLobbyService {

  constructor(
    private readonly gatewayOut: GatewayOut,
    private readonly socketMap: SocketService
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
        return;
      }
    }

    const lobbyName = `lobby${lobbies.size}`;
    const lobby = new Lobby(player);
    lobbies.set(lobbyName, lobby);
    player?.join(lobbyName);
    this.gatewayOut.isInLobby(true, player);
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
        return ;
      }
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
}
