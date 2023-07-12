import { Injectable } from "@nestjs/common";
import { GameState } from './gameState';
import { Socket } from "socket.io";

@Injectable()
export class Lobby {
  player1?: string | null;
  player2?: string | null = null;
  spectators?: Socket[] | null
  gameState = new GameState();

  constructor(player1: string) {
    this.player1 = player1;
  }
}

export let lobbies: Map<number, Lobby> = new Map();
// @Injectable()
// export class Lobbies {
//   public lobbies: Map<number, Lobby> = new Map();
// }
