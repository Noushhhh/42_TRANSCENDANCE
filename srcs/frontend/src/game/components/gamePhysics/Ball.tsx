import React, { FC, useRef, useEffect, useState } from "react";
import Konva from "konva";
import { Circle, Rect } from "react-konva";
import { Vector2d } from "konva/lib/types";
import * as data from "../../assets/data";
import { gameConfig } from "../../assets/gameConfig";

const Ball: FC<data.BallProps> = ({ socket }) => {
  const circleRef = useRef<Konva.Circle>(null);
  const rectRef = useRef<Konva.Rect>(null);

  useEffect(() => {
    socket.on("updateGameState", updateGameStateListener);

    return () => {
      socket.off("updateBallPos", updateGameStateListener);
    };
  });

  useEffect(() => {
    window.addEventListener("resize", updateBallSize);

    return () => {
      window.removeEventListener("resize", updateBallSize);
    };
  });

  const updateGameStateListener = (gameState: data.GameState) => {
    const normBallPos: Vector2d = {
      x: gameState.ballState.ballPos.x * gameConfig.konvaWidth,
      y: gameState.ballState.ballPos.y * gameConfig.konvaHeight,
    };
    updateBallPos(normBallPos);
  };

  const updateBallSize = () => {
    // setBallSize((20 * window.innerWidth) / 1200);
  };

  const updateBallPos = (pos: Vector2d) => {
    
    const ball = rectRef.current;
    if (!ball) return;

    requestAnimationFrame(() => {
      ball.position(pos);
    });
  };

  return (
    // <Circle
    //   ref={circleRef}
    //   x={gameConfig.konvaWidth / 2}
    //   y={gameConfig.konvaHeight / 2}
    //   radius={ballSize}
    //   fill="green"
    // />
    <Rect
      ref={rectRef}
      x={gameConfig.konvaWidth / 2 - 20}
      y={gameConfig.konvaHeight / 2 - 20}
      width={(20 * window.innerWidth) / 1200}
      height={(20 * window.innerWidth) / 1200}
      fill="white"
    />
  );
};

export default Ball;
