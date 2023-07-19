import React, { FC, useRef, useEffect } from "react";
import Konva from "konva";
import { Circle } from "react-konva";
import { Vector2d } from "konva/lib/types";
import * as data from "../../assets/data";

const Ball: FC<data.BallProps> = ({ socket }) => {
  const circleRef = useRef<Konva.Circle>(null);

  useEffect(() => {
    socket.on("updateGameState", (gameState: data.GameState) => {
      updateBallPos(gameState.ballState.ballPos);
    });

    return () => {
      socket.off("updateBallPos");
    };
  });

  const updateBallPos = (pos: Vector2d) => {
    const ball = circleRef.current;
    if (!ball) return;

    requestAnimationFrame(() => {
      ball.position(pos);
    });
  };

  return (
    <Circle
      ref={circleRef}
      x={data.KONVA_WIDTH / 2}
      y={data.KONVA_HEIGHT / 2}
      radius={20}
      fill="green"
    />
  );
};

export default Ball;
