import { Injectable } from '@nestjs/common';
import { GatewayOut } from './gatewayOut';
import { Lobby, lobbies } from './lobbies';

// class Lobby {
//   player1?: string | null;
//   player2?: string | null = null;
//   gameState = new GameState();

//   constructor(player1: string) {
//     this.player1 = player1;
//   }
// }

@Injectable()
export class GameLobbyService {

  // public lobbies: Map<number, Lobby> = new Map();

  constructor(private readonly gatewayOut: GatewayOut) { }

  private printLobbies() {
    lobbies.forEach((value: Lobby, key: number) => {
      console.log("------------------")
      console.log("|", value, "|  ", key, "|")
      console.log("|", value.gameState.gameState.score.p1Score, "|")
      console.log("|", value.gameState.gameState.score.p2Score, "|")
      console.log("------------------")
    })
  }

  addPlayerToLobby(player: string): void {
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
        this.printLobbies();
        this.gatewayOut.isInLobby(true, player);
        return;
      }
    }

    const lobby = new Lobby(player);
    lobbies.set(lobbies.size, lobby);
    this.printLobbies();
    this.gatewayOut.isInLobby(true, player);
  }

  removePlayerFromLobby(clientId: string) {
    for (const [key, value] of lobbies) {
      const lobby = lobbies.get(key);
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
    for (const [key, value] of lobbies) {
      if (value.player1 === clientId)
        return true;
      if (value.player2 === clientId)
        return true;
    }
    return false;
  }
}
