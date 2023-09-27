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


const buttonStyle: React.CSSProperties = {
  position: "absolute",
  top: "5%",
  right: "15%",
  fontSize: "0.5rem",
};

const socket = io("http://localhost:4000");

function GameContainer() {
  const [isPaused, setIsPaused] = useState(true);
  const [isInLobby, setIsInLobby] = useState(false);
  const [isLobbyFull, setIsLobbyFull] = useState(false);
  const clientId = useRef<string>("");

  useEffect(() => {
    socket.on("connect", connectListener)
    socket.on("updateGameState", updateGameStateListener);
    socket.on("isOnLobby", isOnLobbyListener);
    socket.on("isLobbyFull", isLobbyFullListener);

    return () => {
      socket.off("connect", connectListener);
      socket.off("updateGameState", updateGameStateListener);
      socket.off("isOnLobby", isOnLobbyListener);
      socket.off("isLobbyFull", isLobbyFullListener);
    };
  }, []);

  const connectListener = () => {
    clientId.current = socket.id;
  }

  const updateGameStateListener = (gameState: GameState) => {
    setIsPaused(gameState.isPaused);
  };

  const isOnLobbyListener = (isOnLobby: boolean, clientIdRes: string) => {
    console.log('check entering lobby');
    console.log('clientIDRes', clientIdRes);
    console.log('clientID.current', clientId.current);
    
    if (clientIdRes === socket.id) {
      console.log('salut ca va ?');
      setIsInLobby(isOnLobby);
    }
  };

  const isLobbyFullListener = (isLobbyFull: boolean) => {
    setIsLobbyFull(isLobbyFull);
  };

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
