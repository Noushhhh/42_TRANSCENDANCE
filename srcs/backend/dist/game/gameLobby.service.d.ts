import { GatewayOut } from './gatewayOut';
import { Socket } from 'socket.io';
import { SocketService } from '../socket/socket.service';
import { SocketEvents } from '../socket/socketEvents';
export declare class GameLobbyService {
    private readonly gatewayOut;
    private readonly socketMap;
    private readonly io;
    constructor(gatewayOut: GatewayOut, socketMap: SocketService, io: SocketEvents);
    private printLobbies;
    addPlayerToLobby(playerId: string): void;
    addSpectatorToLobby(spectatorId: string, lobbyName: string): void;
    removePlayerFromLobby(player: Socket): void;
    isPaused(player: Socket | undefined, isPaused: boolean): void;
    getAllClientsInARoom(roomName: string): void;
    private isInLobby;
    sendLobbies(player: Socket | undefined): void;
}
