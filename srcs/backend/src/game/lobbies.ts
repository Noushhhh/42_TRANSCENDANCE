import { Injectable, NotFoundException } from "@nestjs/common";
import { GameState } from './gameState';
import { Socket } from "socket.io";
import { UsersService } from "../users/users.service";

@Injectable()
export class Lobby {
  player1?: Socket | undefined | null;
  player2?: Socket | undefined | null = null;
  spectators?: Socket[] | null = [];
  gameState = new GameState();
  ballState = this.gameState.gameState.ballState;

  private constructor() { }

  public static async create(player: Socket | undefined, playerId: number, userService: UsersService): Promise<Lobby | null> {
    const lobby = new Lobby();

    try {
      const playerDb = await userService.findUserWithId(playerId);
      lobby.player1 = player;
      lobby.gameState.gameState.p1Id = playerId;
      const playerUserName = playerDb?.publicName ? playerDb?.publicName : playerDb?.username;
      lobby.gameState.gameState.p1Name = playerUserName;

      return lobby;
    } catch (error) {
      return null;
    }
  }
}

export let lobbies: Map<string, Lobby> = new Map();
