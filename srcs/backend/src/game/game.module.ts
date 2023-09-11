import { Module } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { GameController } from './game.controller';
import { GatewayIn } from './gatewayIn';
import { GatewayOut } from './gatewayOut';
import { SocketModule } from '../socket/SocketModule';
import { SocketEvents } from '../socket/socketEvents';
import { SocketService } from '../socket/socket.service';
import { GameDataService } from './data.service';

@Module({
  providers: [GameLogicService, GameLoopService, GameLobbyService, GatewayIn, GatewayOut, SocketEvents, SocketService, GameDataService],
  controllers: [GameController],
  imports: [SocketModule],
})
export class GameModule {}
