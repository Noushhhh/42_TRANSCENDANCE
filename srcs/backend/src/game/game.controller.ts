import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { Request } from 'express';
import { playerStatistics } from './playerStatistics.service';
import { ConnectToLobbyDto, PlayerNameDto } from './game.dto';

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
  async connectToLobby(@Query() dto: ConnectToLobbyDto, @Req() req: Request) {
    if (req.user) {
      try {
        await this.gameLobby.addPlayerToLobby(dto.clientId, req.user.id);
      } catch (error) {
        throw error;
      }
      return { status: 'player connected to lobby' };
    }
    return { status: 'player not connected to lobby' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('addGameToPlayer')
  async addGameToPlayer(@Req() req: Request) {
    if (req.user) {
      try {
        await this.playerStats.addGamePlayedToOneUser(req.user?.id);
      } catch (error) {
        throw error;
      }
      return { msg: 'player games incremented' };
    }
    return { msg: 'error trying to increment game played' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('play')
  play() {
    this.gameLoopService.startGameLoop();
    return { msg: 'started' };
  }
}
