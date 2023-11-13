import { BadRequestException, Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards";
import { Request } from "express";
import { StatsService } from "./stats.service";

@Controller('stats')
export class StatsController {

  constructor(private readonly statsService: StatsService) { }

  @UseGuards(JwtAuthGuard)
  @Get('getGameStats')
  async getGamePlayed(@Req() req: Request) {

    const userId = req.headers['x-user-id'];

    if (typeof userId === 'string') {
      const userIdInt = parseInt(userId);
      const gameStats = await this.statsService.getGamePlayed(userIdInt);
      return { gameStats: gameStats };
    }
    throw new BadRequestException("Error trying to parse userID");
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMatchHistory')
  async getMatchHistory(@Req() req: Request) {
    const userId = req.headers['x-user-id'];

    if (typeof userId === 'string') {
      const userIdInt = parseInt(userId);
      const matchHistory = await this.statsService.getMatchHistory(userIdInt);
      return { matchHistory: matchHistory };
    }
    throw new BadRequestException("Error trying to parse userID");
  }
}

