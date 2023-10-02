import React, { FC, useEffect, useRef, useState } from "react";
import GamePhysics from "./gamePhysics/GamePhysics";
import "../styles/GameContainer.css";
import ScoreBoard from "./gameNetwork/ScoreBoard";
import { Socket, io } from "socket.io-client";
import { GameState } from "../assets/data";
import WaitingForPlayer from "./gameNetwork/WaitingForPlayer";
import Button from "./common/Button";
import GameMenu from "./GameMenu";
import MiddleLine from "./gamePhysics/MiddleLine";
import GameCustomization from "./gamePhysics/GameCustomization";
import { useLocation } from "react-router-dom";

const buttonStyle: React.CSSProperties = {
  position: "absolute",
  top: "5%",
  right: "15%",
  fontSize: "0.5rem",
};

interface GameContainerProps {
  socket: Socket;
}

const GameContainer: FC<GameContainerProps> = ({ socket }) => {
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isInLobby, setIsInLobby] = useState<boolean>(false);
  const [isLobbyFull, setIsLobbyFull] = useState<boolean>(false);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const clientId = useRef<string>("");
  const gameLaunched = useRef<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    socket.on("connect", connectListener);
    socket.on("updateGameState", updateGameStateListener);
    socket.on("isOnLobby", isInLobbyListener);
    socket.on("isLobbyFull", isLobbyFullListener);
    socket.on("gameEnd", handleGameEnd);

    return () => {
      socket.off("connect", connectListener);
      socket.off("updateGameState", updateGameStateListener);
      socket.off("isOnLobby", isInLobbyListener);
      socket.off("isLobbyFull", isLobbyFullListener);
      socket.off("gameEnd", handleGameEnd);
    };
  }, []);

  useEffect(() => {
    console.log("location changed");

    return () => {
      if (isInLobby) {
        socket.emit("removeFromLobby");
        console.log("client was in lobby and he just left");
      } else {
        console.log("leaving the component");
      }
    };
  }, [location.pathname, isInLobby]);

  useEffect(() => {
    if (isInLobby && isLobbyFull && !gameLaunched) {
      setTimeout(() => {
        start();
        setGameLaunchedRef();
      }, 1500);
    }
  }, []);

  const setGameLaunchedRef = () => {
    gameLaunched.current = true;
  };

  const connectListener = () => {
    clientId.current = socket.id;
  };

  const updateGameStateListener = (gameState: GameState) => {
    setIsPaused(gameState.isPaused);
  };

  const isInLobbyListener = (isOnLobby: boolean, clientIdRes: string) => {
    if (clientIdRes === socket.id) {
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

  const handleGameEnd = () => {
    console.log("game's finised");
    setIsPaused(true);
    setGameEnd(true);
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
          <GameCustomization socket={socket} />
          <GamePhysics socket={socket} isPaused={isPaused} />
          <Button onClick={() => handlePlayPause()} style={buttonStyle}>
            {isPaused ? "Play" : "Pause"}
          </Button>
        </div>
      );
    }
  }
  //  else if (isInLobby === false) {
  // }
  return <GameMenu socket={socket} />;
};

export default GameContainer;
