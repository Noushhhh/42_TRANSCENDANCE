import React, { useEffect, useRef, useState } from "react";
import GamePhysics from "./GamePhysics";
import "../styles/GameContainer.css";
import ScoreBoard from "./ScoreBoard";
import { io } from "socket.io-client";
import { GameState } from "../assets/data";

const socket = io("http://localhost:4000");

function GameContainer() {
  const [isPaused, setIsPaused] = useState(true);
  const [isInLobby, setIsInLobby] = useState(false);
  const clientId = useRef<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Well connected to socket server");
      clientId.current = socket.id;
      console.log(clientId);
    });
    socket.on("updateGameState", (gameState: GameState) => {
      setIsPaused(gameState.isPaused);
    });
    socket.on("isOnLobby", (isOnLobby: boolean, clientIdRes: string) => {
      if (clientIdRes === clientId.current) {
        setIsInLobby(isOnLobby);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("updateGameState");
      socket.off("isOnLobby");
    };
  }, []);

  const handlePlayPause = () => {
    socket.emit("getIsPaused", !isPaused);
    setIsPaused(!isPaused);
    if (isPaused === true) start();
    // else stop();
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

  const lobby = () => {
    fetch(`http://localhost:4000/api/game/lobby?clientId=${clientId.current}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  if (isInLobby === true) {
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
        {/* <button
          style={{ position: "absolute", top: "5%", right: "25%" }}
          onClick={() => lobby()}
        >
          Join Lobby
        </button> */}
      </div>
    );
  } else if (isInLobby === false) {
    return (
      <>
        <button
          style={{ position: "absolute",top: "25%", right: "50%", fontSize: "3rem" }}
          onClick={() => lobby()}
        >
          Join Lobby
        </button>
      </>
    );
  }
}

export default GameContainer;
