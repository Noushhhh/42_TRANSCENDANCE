import { Controller, Get } from '@nestjs/common';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { SocketService } from '../socket/socket.service';
import { Query } from '@nestjs/common';


@Controller('game')
export class GameController {
  constructor(
    private readonly gameLoopService: GameLoopService,
    private readonly gameLobby: GameLobbyService,
    private readonly socket: SocketService,
  ) { }

  @Get('lobby')
  connectToLobby(@Query('clientId') clientId: string) {
    this.gameLobby.addPlayerToLobby(clientId);
    return { test: 'bidule'};
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
