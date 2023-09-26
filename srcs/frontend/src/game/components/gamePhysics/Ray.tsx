import React, { FC, useEffect, useRef, useState } from "react";
import Konva from "konva";
import { Line } from "react-konva";
import { GameState, RayProps } from "../../assets/data";

const Ray: FC<RayProps> = ({ socket }) => {
  const [linePoints, setLinePoints] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    socket.on("updateGameState", (gameState: GameState) => {
      setLinePoints([
        gameState.ballRayUp.x1 * window.innerWidth,
        gameState.ballRayUp.y1 * window.innerHeight,
        gameState.ballRayUp.x2 * window.innerWidth,
        gameState.ballRayUp.y2 * window.innerHeight,
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
