import React, { FC } from "react";
import PlayPauseButton from "./PlayPauseButton";
import GameCustomization from "../gamePhysics/GameCustomization";
import GameRules from "./GameRules";
import { Socket } from "socket.io-client";

interface GameButtonsBarProps {
  socket: Socket;
  isPaused: boolean;
  handlePlayPause: () => void;
}

const GameButtonsBar: FC<GameButtonsBarProps> = ({
  socket,
  isPaused,
  handlePlayPause,
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
      <PlayPauseButton isPaused={isPaused} handlePlayPause={handlePlayPause} />
    </div>
  );
};

export default GameButtonsBar;
