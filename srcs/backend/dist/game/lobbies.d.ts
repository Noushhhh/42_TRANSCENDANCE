import { GameState } from './gameState';
import { Socket } from "socket.io";
export declare class Lobby {
    player1?: Socket | undefined | null;
    player2?: Socket | undefined | null;
    spectators?: Socket[] | null;
    gameState: GameState;
    ballState: {
        ballDirection: string;
        ballDX: number;
        ballDY: number;
        ballPos: {
            x: number;
            y: number;
        };
    };
    constructor(player: Socket | undefined);
    printPlayersPos(): void;
}
export declare let lobbies: Map<string, Lobby>;
