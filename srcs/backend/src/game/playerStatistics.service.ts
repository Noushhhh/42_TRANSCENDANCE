import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Lobby } from "./lobbies";

@Injectable()
export class playerStatistics {

  constructor(private prisma: PrismaService) { }

  async addGamePlayedToUsers(idP1: number, idP2: number): Promise<number> {
    const p1 = await this.prisma.user.findUnique({
      where: {
        id: idP1,
      },
    });
    const p2 = await this.prisma.user.findUnique({
      where: {
        id: idP2,
      },
    });

    // @to-do throw exception if one of the 2 players is not found
    if (!p1 || !p2) {
      return -1;
    }

    await this.prisma.user.update({
      where: { id: idP1 },
      data: {
        gamesPlayed: {
          increment: 1,
        },
      },
    })

    await this.prisma.user.update({
      where: { id: idP2 },
      data: {
        gamesPlayed: {
          increment: 1,
        },
      },
    })

    return 0;
  }

  async addWinToPlayer(playerId: number): Promise<number> {
    const player = await this.prisma.user.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player) {
      return -1
    }

    await this.prisma.user.update({
      where: { id: playerId },
      data: {
        gamesWon: {
          increment: 1,
        },
      },
    })
    return 0
  }

  async addGamePlayedToOneUser(playerId: number): Promise<number> {
    const player = await this.prisma.user.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player) {
      throw new NotFoundException("Player not found")
    }

    await this.prisma.user.update({
      where: { id: playerId },
      data: {
        gamesPlayed: {
          increment: 1,
        },
      },
    });

    return 0;
  }

  async addGameToMatchHistory(
    playerId: number, opponentName: string, playerScore: number,
    opponentScore: number, p1Left: boolean, p2Left: boolean): Promise<number> {

    const player = await this.prisma.user.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return -1;
    }

    const newMatchHistory = await this.prisma.matchHistory.create({
      data: {
        date: new Date(),
        playerId: playerId,
        opponentName: opponentName,
        selfScore: playerScore,
        opponentScore: opponentScore,
        playerLeft: p1Left,
        opponentLeft: p2Left
      }
    });

    if (!newMatchHistory)
      return -1;

    // Add the new match history entry to the player's match history.
    await this.prisma.user.update({
      where: { id: playerId },
      data: {
        matchHistory: {
          connect: {
            id: newMatchHistory.id,
          },
        }
      },
    })

    return 0;
  }

  async addGameStatsToPlayers(lobby: Lobby, winnerId: number, p1Left: boolean, p2Left: boolean) {
    const gameState = lobby.gameState.gameState;

    await this.addGamePlayedToUsers(gameState.p1Id, gameState.p2Id);

    await this.addGameToMatchHistory(gameState.p1Id, gameState.p2Name, gameState.score.p1Score, gameState.score.p2Score, p1Left, p2Left);

    await this.addGameToMatchHistory(gameState.p2Id, gameState.p1Name, gameState.score.p2Score, gameState.score.p1Score, p2Left, p1Left);

    await this.addWinToPlayer(winnerId);
  }
}
