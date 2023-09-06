import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
export declare class GatewayIn implements OnGatewayDisconnect {
    private readonly gameLoop;
    private readonly gameLobby;
    server: Server;
    constructor(gameLoop: GameLoopService, gameLobby: GameLobbyService);
    handleDisconnect(client: Socket): void;
    getPlayerPos(direction: string, client: Socket): void;
    setPause(isPaused: boolean, client: Socket): void;
    requestLobbie(client: Socket): void;
    setIntoLobby(lobbyName: string, client: Socket): void;
}
