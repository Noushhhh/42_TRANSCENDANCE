import React, { FC } from "react";
import GameCustomization from "../gamePhysics/GameCustomization";
import GameRules from "./GameRules";
import { Socket } from "socket.io-client";

interface GameButtonsBarProps {
  socket: Socket;
}

const GameButtonsBar: FC<GameButtonsBarProps> = ({
  socket,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        gap: "1.5rem",
        zIndex: "2",
        width: "100%",
        top: "1rem",
      }}
    >
      <GameCustomization socket={socket} />
      <GameRules />
    </div>
  );
};

export default GameButtonsBar;
