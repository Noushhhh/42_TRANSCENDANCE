import React, { FC, useRef, useEffect, useState } from "react";
import Konva from "konva";
import { Circle } from "react-konva";
import { Vector2d } from "konva/lib/types";
import * as data from "../../assets/data";
import { gameConfig } from "../../assets/gameConfig";

const Ball: FC<data.BallProps> = ({ socket }) => {
  const circleRef = useRef<Konva.Circle>(null);
  const [ballSize, setBallSize] = useState<number>(20);

  // console.log("ballSize = ", ballSize);
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

  useEffect(() => {
    window.addEventListener("resize", updateBallSize);

    return () => {
      window.removeEventListener("resize", updateBallSize);
    };
  });

  const updateBallSize = () => {
    setBallSize((20 * (window.innerWidth - 1200)) / 1200);
  };

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
      radius={ballSize}
      fill="green"
    />
  );
};

export default Ball;
