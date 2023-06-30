import React, { useEffect, useState } from "react";
import GamePhysics from "./GamePhysics";
import "../styles/GameContainer.css";
import ScoreBoard from "./ScoreBoard";
import { io } from "socket.io-client";
import { GameState } from "../assets/data";

const socket = io("http://localhost:4000");

function GameContainer() {
  const [isPaused, setIsPaused] = useState(true);

  /* ----------------------------- */
  //     PLAY/PAUSE SOCKET LOGIC
  /* ----------------------------- */
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Well connected to socket server");
    });
    socket.on("updateGameState", (gameState: GameState) => {
      setIsPaused(gameState.isPaused);
    });

    return () => {
      socket.off("connect");
      socket.off("updateGameState");
    };
  }, []);

  const handlePlayPause = () => {
    socket.emit("getIsPaused", !isPaused);
    setIsPaused(!isPaused);
    if (isPaused === true) start();
    else stop();
  };

  const start = () => {
    fetch("http://localhost:4000/api/game/play")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const stop = () => {
    fetch("http://localhost:4000/api/game/stop")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="GameContainer">
      <ScoreBoard socket={socket} />
      <GamePhysics socket={socket} isPaused={isPaused} />
      <button
        style={{ position: "absolute", top: "5%", right: "15%" }}
        onClick={() => handlePlayPause()}
      >
        {isPaused ? "Play" : "Pause"}
      </button>
    </div>
  );
}

export default GameContainer;
