import { GameLogicService } from './gameLogic.service';
import { GatewayOut } from './gatewayOut';
import { Socket } from 'socket.io';
export declare class GameLoopService {
    private readonly gameLogicService;
    private readonly gatewayOut;
    private gameLoopRunning;
    constructor(gameLogicService: GameLogicService, gatewayOut: GatewayOut);
    startGameLoop(): void;
    stopGameLoop(): void;
    private gameLoop;
    private updateGameState;
    private findPlayerLobby;
    updatePlayerPos(direction: string, player: Socket): void;
    private updateBall;
}
