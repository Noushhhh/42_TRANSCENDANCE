import React, { FC, useEffect, useRef, useState } from "react";
import Konva from "konva";
import { Line } from "react-konva";
import { GameState, KONVA_HEIGHT, KONVA_WIDTH, RayProps } from "../assets/data";
import { Vector2d } from "konva/lib/types";

const Ray: FC<RayProps> = ({ socket }) => {
  const [linePoints, setLinePoints] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    socket.on("updateGameState", (gameState: GameState) => {
      setLinePoints([
        gameState.ballRay.x1,
        gameState.ballRay.y1,
        gameState.ballRay.x2,
        gameState.ballRay.y2,
      ]);
    });

    return () => {
      socket.off("updateGameState");
    };
  }, []);

  return (
    <>
      <Line points={linePoints} stroke="red" />
    </>
  );
};

export default Ray;
