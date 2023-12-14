import { BadRequestException, Controller, Get, NotFoundException, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards";
import { Request } from "express";
import { StatsService } from "./stats.service";

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {

  constructor(private readonly statsService: StatsService) { }

  @Get('getGameStats')
  async getGamePlayed(@Req() req: Request) {
    if (!req.user?.id) throw new NotFoundException("User not found");
    const gameStats = await this.statsService.getGamePlayed(req.user.id);
    return { gameStats: gameStats };
  }

  @Get('getMatchHistory')
  async getMatchHistory(@Req() req: Request) {
    if (!req.user?.id) throw new NotFoundException("User not found");
    const matchHistory = await this.statsService.getMatchHistory(req.user.id);
    return { matchHistory: matchHistory };

  }
}

