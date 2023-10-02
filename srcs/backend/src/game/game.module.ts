import { Module } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { GameController } from './game.controller';
import { GatewayIn } from './gatewayIn';
import { GatewayOut } from './gatewayOut';
import { SocketModule } from '../socket/socket.module';
// import { SocketEvents } from '../socket/chat.gateway';
import { SocketService } from '../socket/socket.service';
import { GameDataService } from './data.service';

@Module({
  providers: [GameLogicService, GameLoopService, GameLobbyService, GatewayIn, GatewayOut, SocketService, GameDataService],
  controllers: [GameController],
  imports: [SocketModule],
})
export class GameModule {}
