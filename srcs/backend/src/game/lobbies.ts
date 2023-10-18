import { Injectable } from "@nestjs/common";
import { GameState } from './gameState';
import { Socket } from "socket.io";

@Injectable()
export class Lobby {
  player1?: Socket | undefined | null;
  player2?: Socket | undefined | null = null;
  spectators?: Socket[] | null = [];
  gameState = new GameState();
  ballState = this.gameState.gameState.ballState;

  constructor(player: Socket | undefined, playerId: number) {
    this.player1 = player;
    this.gameState.gameState.p1Id = playerId;
  }

  public printPlayersPos() {
    console.log("print 4: ", this.gameState.gameState.p1pos);
    console.log("print 4: ", this.gameState.gameState.p2pos);
  }
}

export let lobbies: Map<string, Lobby> = new Map();
