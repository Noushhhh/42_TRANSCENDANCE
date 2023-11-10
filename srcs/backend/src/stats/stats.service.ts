import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";

interface GameStats {
  gamePlayed: number;
  gameWon: number;
}

interface MatchHistory {
  id: number;
  date: Date;
  playerId: number;
  opponentName: string;
  selfScore: number;
  opponentScore: number;
  playerLeft: boolean;
  opponentLeft: boolean;
}

@Injectable()
export class StatsService {

  constructor(private readonly userService: UsersService, private readonly prisma: PrismaService) { }

  public async getGamePlayed(userId: number): Promise<GameStats> {
    const user = await this.userService.findUserWithId(userId);
    if (!user) {
      throw new NotFoundException("Player not found");
    }

    const gameStats = {
      gamePlayed: user.gamesPlayed,
      gameWon: user.gamesWon
    }

    return gameStats;
  }

  public async getMatchHistory(userId: number): Promise<MatchHistory[] | undefined> {
    const matchHistories = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        matchHistory: true,
      },
    });

    return matchHistories?.matchHistory;
  }
}
