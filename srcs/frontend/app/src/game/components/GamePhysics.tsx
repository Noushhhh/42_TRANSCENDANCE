import { Stage, Layer, Rect, Circle } from "react-konva";
import React, { FC, useEffect, useRef } from "react";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";

interface GamePhysicsProps {
  setP1Score: React.Dispatch<React.SetStateAction<number>>;
  setP2Score: React.Dispatch<React.SetStateAction<number>>;
  isPaused: boolean;
}

const KONVA_WIDTH = 1200;
const KONVA_HEIGHT = 800;
const PADDLE_HEIGHT = 150;
const PADDLE_WIDTH = 25;

const p1Props = {
  x: 10,
  y: 310,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  fill: "red",
  draggable: false,
};

const p2Props = {
  x: KONVA_WIDTH - 10 - PADDLE_WIDTH,
  y: 310,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  fill: "red",
  draggable: false,
};

let ballDirection = "left";
let ballDX = 0;
let ballDY = 0;

const GamePhysics: FC<GamePhysicsProps> = ({
  setP1Score,
  setP2Score,
  isPaused = true,
}) => {
  const rect1Ref = useRef<Konva.Rect>(null);
  const rect2Ref = useRef<Konva.Rect>(null);
  const circleRef = useRef<Konva.Circle>(null);
  const keyState = useRef<{ [key: string]: boolean }>({});

  const p1Pos = useRef<Vector2d>({ x: 10, y: 310 });
  const p2Pos = useRef<Vector2d>({
    x: KONVA_WIDTH - 10 - PADDLE_WIDTH,
    y: 310,
  });

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      keyState.current[event.key] = true;
    };

    const handleKeyUp = (event: globalThis.KeyboardEvent) => {
      keyState.current[event.key] = false;
    };

    let animRequest: number;

    const updateRect = () => {
      if (isPaused) return;

      const rect1 = rect1Ref.current;
      if (!rect1) return;

      const rect2 = rect2Ref.current;
      if (!rect2) return;

      const position1 = rect1.position();
      const position2 = rect2.position();
      const moveAmount = 6;

      if (keyState.current["w"]) {
        if (position1.y > 0) {
          rect1.position({ x: position1.x, y: position1.y - moveAmount });
          p1Pos.current = rect1.position();
        }
      }
      if (keyState.current["s"]) {
        if (position1.y < KONVA_HEIGHT - PADDLE_HEIGHT) {
          rect1.position({ x: position1.x, y: position1.y + moveAmount });
          p1Pos.current = rect1.position();
        }
      }
      if (keyState.current["ArrowUp"]) {
        if (position2.y > 0) {
          rect2.position({ x: position2.x, y: position2.y - moveAmount });
          p2Pos.current = rect2.position();
        }
      }
      if (keyState.current["ArrowDown"]) {
        if (position2.y < KONVA_HEIGHT - PADDLE_HEIGHT) {
          rect2.position({ x: position2.x, y: position2.y + moveAmount });
          p2Pos.current = rect2.position();
        }
      }
      animRequest = requestAnimationFrame(updateRect);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const animRequest2 = requestAnimationFrame(updateRect);

    return () => {
      cancelAnimationFrame(animRequest);
      cancelAnimationFrame(animRequest2);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPaused]);

  const moveBall = () => {
    const ball = circleRef.current;
    if (!ball) return;

    const ballPos = ball.position();

    if (ballDirection === "left") {
      if (!p1Pos.current) return;
      if (
        ballPos.x < 10 + PADDLE_WIDTH + 15 &&
        ballPos.x > 5 + PADDLE_WIDTH + 15 &&
        ballPos.y > p1Pos.current?.y &&
        ballPos.y < p1Pos.current?.y + PADDLE_HEIGHT
      ) {
        const t = p1Pos.current.y + PADDLE_HEIGHT / 2 - ballPos.y;
        const tt = t / (PADDLE_HEIGHT / 2);
        const ttt = tt * (Math.PI / 4);
        ballDX = Math.cos(ttt) * 2;
        ballDY = -Math.sin(ttt) * 2;

        ballDirection = "right";
        return;
      } else if (ballPos.y < 0) {
        ballDY = -ballDY;
      } else if (ballPos.y > KONVA_HEIGHT) {
        ballDY = -ballDY;
      }
      if (ballPos.x < 0) {
        setP2Score((curr: number) => curr + 1);
        ball.position({ x: KONVA_WIDTH / 2, y: KONVA_HEIGHT / 2 });
        ballDX = 0;
        ballDY = 0;
      } else {
        ball.position({ x: ballPos.x - 2 - ballDX, y: ballPos.y - ballDY });
      }
    } else if (ballDirection === "right") {
      if (!p2Pos.current) return;
      if (
        ballPos.x > KONVA_WIDTH - PADDLE_WIDTH - 20 &&
        ballPos.x < KONVA_WIDTH - PADDLE_WIDTH - 15 &&
        ballPos.y > p2Pos.current?.y &&
        ballPos.y < p2Pos.current?.y + PADDLE_HEIGHT
      ) {
        const t = p2Pos.current.y + PADDLE_HEIGHT / 2 - ballPos.y;
        const tt = t / (PADDLE_HEIGHT / 2);
        const ttt = -(tt * (Math.PI / 4));
        ballDX = Math.cos(ttt) * 2;
        ballDY = -Math.sin(ttt) * 2;

        ballDirection = "left";
        return;
      } else if (ballPos.y < 0) {
        ballDY = -ballDY;
      } else if (ballPos.y > KONVA_HEIGHT) {
        ballDY = -ballDY;
      }
      if (ballPos.x > KONVA_WIDTH) {
        setP1Score((curr: number) => curr + 1);
        ball.position({ x: KONVA_WIDTH / 2, y: KONVA_HEIGHT / 2 });
        ballDX = 0;
        ballDY = 0;
      } else {
        ball.position({ x: ballPos.x + 2 + ballDX, y: ballPos.y + ballDY });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        moveBall();
      }
    }, 1);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Stage
      style={{ backgroundColor: "white" }}
      className="GamePhysics"
      width={KONVA_WIDTH}
      height={KONVA_HEIGHT}
    >
      <Layer>
        <Rect ref={rect1Ref} {...p1Props} />
        <Circle
          ref={circleRef}
          x={KONVA_WIDTH / 2}
          y={KONVA_HEIGHT / 2}
          radius={20}
          fill="green"
        />
        <Rect ref={rect2Ref} {...p2Props} />
      </Layer>
    </Stage>
  );
};

export default GamePhysics;
