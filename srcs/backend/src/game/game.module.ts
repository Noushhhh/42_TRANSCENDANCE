import { Module } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GameLoopService } from './gameLoop.service';
import { GameController } from './game.controller';
import { GatewayIn } from './gatewayIn';
import { GatewayOut } from './gatewayOut';

@Module({
  providers: [GameLogicService, GameLoopService, GatewayIn, GatewayOut],
  controllers: [GameController],
})
export class GameModule {}
