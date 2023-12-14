import { Controller, ForbiddenException, Get, Req, UseGuards } from '@nestjs/common';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { Request } from 'express';
import { playerStatistics } from './playerStatistics.service';
import { ConnectToLobbyDto } from './game.dto';
import { GatewayIn } from './gatewayIn';

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
    private readonly gateway: GatewayIn
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('lobby')
  async connectToLobby(@Query() dto: ConnectToLobbyDto, @Req() req: Request) {
    if (req.user) {
      const sockets = Array.from(this.gateway.server.sockets.sockets).map(socket => socket);
      for (const socket of sockets) {
        if (socket[1].data.userId == req.user.id) {
          if (socket[0] != dto.clientId) {
            throw new ForbiddenException("Wrong socket id provided");
          }
        }
      }
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
  @Get('play')
  play() {
    this.gameLoopService.startGameLoop();
    return { msg: 'started' };
  }
}
