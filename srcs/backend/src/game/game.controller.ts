import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { Request } from 'express';
import { playerStatistics } from './playerStatistics.service';

interface User {
  id: number;
  username: string;
  avatar: string;
  hashPassword: string;
  twoFASecret: boolean;
  twoFAUrl: boolean;
  firstConnexion: boolean;
  TwoFA: boolean;
  // Other properties...
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Controller('game')
export class GameController {
  constructor(
    private readonly gameLoopService: GameLoopService,
    private readonly gameLobby: GameLobbyService,
    private readonly playerStats: playerStatistics,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('lobby')
  connectToLobby(@Query('clientId') clientId: string, @Req() req: Request) {
    if (req.user) {
      this.gameLobby.addPlayerToLobby(clientId, req.user.id);
    }
    return { test: 'player connected to lobby' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('addGameToPlayer')
  addGameToPlayer(@Req() req: Request) {
    if (req.user)
      this.playerStats.addGamePlayedToOneUser(req.user?.id)
    return { msg: 'player games incremented' };
  }

  @Get('play')
  play() {
    this.gameLoopService.startGameLoop();
    return { msg: 'started' };
  }

  @Get('stop')
  stop() {
    this.gameLoopService.stopGameLoop();
    return { msg: 'stopped' };
  }
}
