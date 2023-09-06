import { Server, Socket } from 'socket.io';
import { GameState } from './types';
import { SocketService } from '../socket/socket.service';
import { SocketEvents } from '../socket/socketEvents';
interface Vector2d {
    x: number;
    y: number;
}
export declare class GatewayOut {
    private readonly socketMap;
    private readonly io;
    server: Server;
    constructor(socketMap: SocketService, io: SocketEvents);
    sendBallPos(pos: Vector2d): void;
    updateGameState(gameState: GameState): void;
    emitToRoom(roomName: string, event: string, data: any): void;
    emitToUser(userId: string, event: string, data: any): void;
    updateLobbiesGameState(): void;
    isInLobby(isInLobby: boolean, player: Socket | undefined): void;
}
export {};
