import { Injectable } from "@nestjs/common";
import { GameState } from './gameState';
import { Socket } from "socket.io";

@Injectable()
export class Lobby {
  player1?: Socket | undefined | null;
  player2?: Socket | undefined | null = null;
  spectators?: Socket[] | undefined[] | null
  gameState = new GameState();
  ballState = this.gameState.gameState.ballState;

  constructor(player: Socket | undefined) {
    this.player1 = player;
  }

  public printPlayersPos() {
    console.log(this.gameState.gameState.p1pos);
    console.log(this.gameState.gameState.p2pos);
  }
}

export let lobbies: Map<string, Lobby> = new Map();
