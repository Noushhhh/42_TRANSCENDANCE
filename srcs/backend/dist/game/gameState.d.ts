interface Vector2d {
    x: number;
    y: number;
}
export declare class GameState {
    private ballPos;
    gameState: {
        p1pos: {
            x: number;
            y: number;
        };
        p2pos: {
            x: number;
            y: number;
        };
        ballState: {
            ballDirection: string;
            ballDX: number;
            ballDY: number;
            ballPos: {
                x: number;
                y: number;
            };
        };
        ballRay: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        };
        isPaused: boolean;
        score: {
            p1Score: number;
            p2Score: number;
        };
        isLobbyFull: boolean;
    };
    ballState: {
        ballDirection: string;
        ballDX: number;
        ballDY: number;
        ballPos: Vector2d;
        scoreBoard: {
            p1Score: number;
            p2Score: number;
        };
    };
}
export {};
