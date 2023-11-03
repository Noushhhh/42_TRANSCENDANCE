import { Injectable, NotFoundException } from "@nestjs/common";
import { GameState } from './gameState';
import { Socket } from "socket.io";
import { UsersService } from "../users/users.service";
import { NotFoundError } from "rxjs";

@Injectable()
export class Lobby {
  player1?: Socket | undefined | null;
  player2?: Socket | undefined | null = null;
  spectators?: Socket[] | null = [];
  gameState = new GameState();
  ballState = this.gameState.gameState.ballState;

  constructor(player: Socket | undefined, playerId: number, private readonly userService: UsersService) {
    try {
      this.initializeLobby(player, playerId);
    } catch (error) {
      throw error;
    }
  }

  private async initializeLobby(player: Socket | undefined, playerId: number) {
    try {
      const playerDb = await this.userService.findUserWithId(playerId);
      this.player1 = player;
      this.gameState.gameState.p1Id = playerId;
      this.gameState.gameState.p1Name = playerDb.username;
    } catch (error) {
      console.log("ici j'ai l'erreur: ");
      throw error;
    }
  }

  public printPlayersPos() {
    console.log("print 4: ", this.gameState.gameState.p1pos);
    console.log("print 4: ", this.gameState.gameState.p2pos);
  }
}

export let lobbies: Map<string, Lobby> = new Map();
export let lobbiesMap: Map<string, string> = new Map();
