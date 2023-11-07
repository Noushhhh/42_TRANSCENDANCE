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

  // private constructor(player: Socket | undefined, playerId: number, private readonly userService: UsersService) {
  //   this.initializeLobby(player, playerId);
  // }
  private constructor() { }

  // private async initializeLobby(player: Socket | undefined, playerId: number) {
  //   try {
  //     const playerDb = await this.userService.findUserWithId(playerId);
  //     this.player1 = player;
  //     this.gameState.gameState.p1Id = playerId;
  //     this.gameState.gameState.p1Name = playerDb.username;
  //   } catch (error) {
  //     console.log("ici j'ai l'erreur: ");
  //     throw error;
  //   }
  // }

  public static async create(player: Socket | undefined, playerId: number, userService: UsersService): Promise<Lobby> {
    const lobby = new Lobby();

    try {
      const playerDb = await userService.findUserWithId(playerId);
      lobby.player1 = player;
      lobby.gameState.gameState.p1Id = playerId;
      lobby.gameState.gameState.p1Name = playerDb.username;

      return lobby;
    } catch (error) {
      console.log("An error occurred during lobby initialization:", error);
      throw error; // You can re-throw the error or handle it here
    }
  }

  public printPlayersPos() {
    console.log("print 4: ", this.gameState.gameState.p1pos);
    console.log("print 4: ", this.gameState.gameState.p2pos);
  }
}

export let lobbies: Map<string, Lobby> = new Map();
export let lobbiesMap: Map<string, string> = new Map();
