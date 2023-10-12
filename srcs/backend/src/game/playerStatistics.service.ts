import { Injectable } from "@nestjs/common";
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

        console.log("2 players id: ", idP1, idP2);

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
            throw new Error("Player not found.");
        }

        await this.prisma.user.update({
            where: { id: playerId },
            data: {
                gamesPlayed: {
                    increment: 1,
                },
            },
        })
    }
}