import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { SocketService } from '../socket/socket.service';
export declare class GameController {
    private readonly gameLoopService;
    private readonly gameLobby;
    private readonly socket;
    constructor(gameLoopService: GameLoopService, gameLobby: GameLobbyService, socket: SocketService);
    connectToLobby(clientId: string): void;
    play(): {
        msg: string;
    };
    stop(): {
        msg: string;
    };
}
