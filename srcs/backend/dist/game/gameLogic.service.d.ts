interface Vector2d {
    x: number;
    y: number;
}
export declare class GameLogicService {
    ballMove: (ballDirection: string, ballPos: Vector2d, p1Pos: Vector2d, p2Pos: Vector2d, ballDX: number, ballDY: number, scoreBoard: {
        p1Score: number;
        p2Score: number;
    }, ballRay: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }) => {
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
