import React, { useEffect, useRef, useState } from "react";
import GamePhysics from "./gamePhysics/GamePhysics";
import "../styles/GameContainer.css";
import ScoreBoard from "./gameNetwork/ScoreBoard";
import { io } from "socket.io-client";
import { GameState } from "../assets/data";
import WaitingForPlayer from "./gameNetwork/WaitingForPlayer";
import Button from "./common/Button";
import GameMenu from "./GameMenu";
import MiddleLine from "./gamePhysics/MiddleLine";

const socket = io("http://localhost:4000");

const buttonStyle: React.CSSProperties = {
  position: "absolute",
  top: "5%",
  right: "15%",
};

function GameContainer() {
  const [isPaused, setIsPaused] = useState(true);
  const [isInLobby, setIsInLobby] = useState(false);
  const [isLobbyFull, setIsLobbyFull] = useState(false);
  const clientId = useRef<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      clientId.current = socket.id;
    });
    socket.on("updateGameState", (gameState: GameState) => {
      setIsPaused(gameState.isPaused);
    });
    socket.on("isOnLobby", (isOnLobby: boolean, clientIdRes: string) => {
      if (clientIdRes === clientId.current) {
        setIsInLobby(isOnLobby);
      }
    });
    socket.on("isLobbyFull", (isLobbyFull: boolean) => {
      setIsLobbyFull(isLobbyFull);
    });

    return () => {
      socket.off("connect");
      socket.off("updateGameState");
      socket.off("isOnLobby");
      socket.off("isLobbyFull");
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

  if (isInLobby === true) {
    if (isLobbyFull === false) {
      return <WaitingForPlayer />;
    } else {
      return (
        <div className="GameContainer">
          <MiddleLine />
          <ScoreBoard socket={socket} />
          <GamePhysics socket={socket} isPaused={isPaused} />
          <Button onClick={handlePlayPause} style={buttonStyle}>
            {isPaused ? "Play" : "Pause"}
          </Button>
        </div>
      );
    }
  }
  //  else if (isInLobby === false) {
  // }
  return <GameMenu socket={socket} />;
}

export default GameContainer;
