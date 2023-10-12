import { Module } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { GameController } from './game.controller';
import { GatewayIn } from './gatewayIn';
import { GatewayOut } from './gatewayOut';
import { GameDataService } from './data.service';
import { gameSockets } from './gameSockets';
import { playerStatistics } from './playerStatistics.service';

@Module({
  providers: [GameLogicService, GameLoopService, GameLobbyService, GatewayIn, GatewayOut, GameDataService, gameSockets, playerStatistics],
  controllers: [GameController],
})
export class GameModule { }
