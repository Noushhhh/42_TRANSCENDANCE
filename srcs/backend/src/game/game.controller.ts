import { Controller, ForbiddenException, Get, HttpStatus, NotFoundException, Req, Res, UseGuards } from '@nestjs/common';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { Request, Response } from 'express';
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
    private readonly gateway: GatewayIn
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('lobby')
  async connectToLobby(@Query() dto: ConnectToLobbyDto, @Req() req: Request, @Res() res: Response) {
    if (req.user) {
      try {
        const sockets = Array.from(this.gateway.server.sockets.sockets).map(socket => socket);
        for (const socket of sockets) {
          if (socket[1].data.userId == req.user.id) {
            if (socket[0] !== dto.clientId) {
              throw new ForbiddenException("Wrong socket id provided");
            } else if (socket[0] === dto.clientId) {
              break;
            }
          }
        }

        await this.gameLobby.addPlayerToLobby(dto.clientId, req.user.id);
        res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK });
      } catch (error) {
        if (error instanceof NotFoundException) {
          res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
        } else if (error instanceof ForbiddenException) {
          res.status(HttpStatus.FORBIDDEN).json({ statusCode: HttpStatus.FORBIDDEN, message: "Wrong socket provided", error: "Forbidden" });
        }
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('play')
  play(@Res() res: Response) {
    this.gameLoopService.startGameLoop();
    res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK });
  }
}
