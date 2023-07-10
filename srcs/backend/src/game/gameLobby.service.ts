import { Injectable } from '@nestjs/common';
import { GatewayOut } from './gatewayOut';

interface Lobby {
  player1?: string | null;
  player2?: string | null;
}

@Injectable()
export class GameLobbyService {

  private lobbies: Map<number, Lobby> = new Map();

  constructor(private readonly gatewayOut: GatewayOut) { }

  private printLobbies() {
    this.lobbies.forEach((value: Lobby, key: number, map: Map<number, Lobby>) => {
      console.log("------------------")
      console.log("|", value, "|  ", key, "|")
      console.log("------------------")
    })
  }

  addPlayerToLobby(player: string): void {
    if (this.isInLobby(player)) {
      console.log('Already in a lobby', player);
      return;
    }

    for (const [key, value] of this.lobbies) {
      if (!value.player1 || !value.player2) {
        if (!value.player1) {
          value.player1 = player;
        } else if (!value.player2) {
          value.player2 = player;
        }
        this.printLobbies();
        this.gatewayOut.isInLobby(true, player);
        return;
      }
    }

    const lobby = {
      player1: player,
      player2: null,
    }
    this.lobbies.set(this.lobbies.size, lobby);
    this.printLobbies();
    this.gatewayOut.isInLobby(true, player);
  }

  removePlayerFromLobby(clientId: string) {
    for (const [key, value] of this.lobbies) {
      const lobby = this.lobbies.get(key);
      if (value.player1 === clientId) {
        if (lobby) {
          lobby.player1 = null;
        }
        this.printLobbies();
        this.gatewayOut.isInLobby(false, clientId);
        return ;
      }
      if (value.player2 === clientId) {
        if (lobby) {
          lobby.player2 = null;
        }
        this.printLobbies();
        this.gatewayOut.isInLobby(false, clientId);
        return ;
      }
    }
  }

  private isInLobby(clientId: string): boolean {
    for (const [key, value] of this.lobbies) {
      if (value.player1 === clientId)
        return true;
      if (value.player2 === clientId)
        return true;
    }
    return false;
  }
}
