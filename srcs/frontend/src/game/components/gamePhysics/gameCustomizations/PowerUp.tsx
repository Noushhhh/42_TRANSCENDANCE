import React, { FC, useEffect, useRef } from "react";
import Konva from "konva";
import { Rect } from "react-konva";
import { Socket } from "socket.io-client";
import { gameConfig } from "../../../assets/gameConfig";
import { GameState } from "../../../assets/data";

interface PowerUpProps {
  socket: Socket;
}

const PowerUp: FC<PowerUpProps> = ({ socket }) => {
  const rectRef = useRef<Konva.Rect>(null);

  useEffect(() => {
    socket.on("updateGameState", handleUpdatePowerUp);
    return () => {
      socket.off("updateGameState", handleUpdatePowerUp);
    };
  });

  const handleUpdatePowerUp = (gameState: GameState) => {
    console.log(gameState.powerUp.x, gameState.powerUp.y);
    rectRef.current?.position({
      x: gameState.powerUp.x * gameConfig.konvaWidth,
      y: gameState.powerUp.y * gameConfig.konvaHeight,
    });
  };

  return (
    <> 
      <Rect
        ref={rectRef}
        x={-1}
        y={-1}
        width={(180 * window.innerWidth) / 1200}
        height={(180 * window.innerWidth) / 1200}
        fill="green"
      />
    </>
  );
};

export default PowerUp;
