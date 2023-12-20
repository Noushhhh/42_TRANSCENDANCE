import { BadRequestException, Controller, Get, HttpStatus, NotFoundException, Req, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards";
import { Request, Response } from "express";
import { StatsService } from "./stats.service";

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {

  constructor(private readonly statsService: StatsService) { }

  @Get('getGameStats')
  async getGamePlayed(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user?.id) throw new NotFoundException("User not found");

      const gameStats = await this.statsService.getGamePlayed(req.user.id);
      res.status(HttpStatus.ACCEPTED).json({ statusCode: HttpStatus.ACCEPTED, gameStats: gameStats });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
    }
  }

  @Get('getMatchHistory')
  async getMatchHistory(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user?.id) throw new NotFoundException("User not found");

      const matchHistory = await this.statsService.getMatchHistory(req.user.id);
      res.status(HttpStatus.ACCEPTED).json({ statusCode: HttpStatus.ACCEPTED, matchHistory: matchHistory });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
    }
  }
}

