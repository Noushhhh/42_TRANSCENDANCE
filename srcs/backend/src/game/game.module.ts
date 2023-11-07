import { Module } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { GameController } from './game.controller';
import { GatewayIn } from './gatewayIn';
import { GatewayOut } from './gatewayOut';
import { gameSockets } from './gameSockets';
import { playerStatistics } from './playerStatistics.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

// GatewayIn
// GatewayOut
@Module({
  providers: [GameLogicService, GameLoopService, GameLobbyService, gameSockets, GatewayIn, GatewayOut, playerStatistics, UsersService, AuthService, JwtService],
  controllers: [GameController],
})
export class GameModule { }
