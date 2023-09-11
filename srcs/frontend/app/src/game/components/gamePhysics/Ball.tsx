import React, { FC, useRef, useEffect } from "react";
import Konva from "konva";
import { Circle } from "react-konva";
import { Vector2d } from "konva/lib/types";
import * as data from "../../assets/data";
import { gameConfig } from "../../assets/gameConfig";

const Ball: FC<data.BallProps> = ({ socket }) => {
  const circleRef = useRef<Konva.Circle>(null);

  useEffect(() => {
    socket.on("updateGameState", (gameState: data.GameState) => {
      const normBallPos: Vector2d = {
        x: gameState.ballState.ballPos.x * gameConfig.konvaWidth,
        y: gameState.ballState.ballPos.y * gameConfig.konvaHeight,
      };
      updateBallPos(normBallPos);
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
      x={gameConfig.konvaWidth / 2}
      y={gameConfig.konvaHeight / 2}
      radius={20}
      fill="green"
    />
  );
};

export default Ball;
