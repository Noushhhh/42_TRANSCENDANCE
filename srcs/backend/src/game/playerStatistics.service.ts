import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class playerStatistics {

  constructor(private prisma: PrismaService) { }

  async addGamePlayedToUsers(idP1: number, idP2: number) {
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
      throw new Error("One of the players is not found.");
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
  }

  async addWinToPlayer(playerId: number) {
    const player = await this.prisma.user.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player) {
      throw new Error("Player not found.");
    }


    await this.prisma.user.update({
      where: { id: playerId },
      data: {
        gamesWon: {
          increment: 1,
        },
      },
    })
  }

  async addGamePlayedToOneUser(playerId: number) {
    const player = await this.prisma.user.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player) {
      throw new NotFoundException("Player not found.");
    }

    await this.prisma.user.update({
      where: { id: playerId },
      data: {
        gamesPlayed: {
          increment: 1,
        },
      },
    });
  }

  async addGameToMatchHistory(
    playerId: number, opponentName: string, playerScore: number,
    opponentScore: number, p1Left: boolean, p2Left: boolean) {

    const player = await this.prisma.user.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      throw new NotFoundException("Player not found.");
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
      throw new NotFoundException("Error during match history creation");

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
  }
}
