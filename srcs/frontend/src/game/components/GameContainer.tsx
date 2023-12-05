import React, { FC, useEffect, useRef, useState } from "react";
import GamePhysics from "./gamePhysics/GamePhysics";
import "../styles/GameContainer.css";
import ScoreBoard from "./gameNetwork/ScoreBoard";
import { Socket } from "socket.io-client";
import { GameState } from "../assets/data";
import WaitingForPlayer from "./gameNetwork/WaitingForPlayer";
import GameMenu from "./GameMenu";
import MiddleLine from "./gamePhysics/MiddleLine";
import { useLocation } from "react-router-dom";
import AutoLaunch from "./gameNetwork/AutoLaunch";
import GameButtonsBar from "./gameUtils/GameButtonsBar";
import PrintWinner from "./gameUtils/PrintWinner";
import SocketError from "./gameNetwork/SocketError";
import PlayAgain from "./gameNetwork/PlayAgain";

interface GameContainerProps {
  socket: Socket | undefined;
  error: string;
  handleError: (error: SocketErrorObj) => void;
}

interface SocketErrorObj {
  statusCode: number;
  message: string;
}

const GameContainer: FC<GameContainerProps> = ({
  socket,
  error,
  handleError,
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isInLobby, setIsInLobby] = useState<boolean>(false);
  const [isLobbyFull, setIsLobbyFull] = useState<boolean>(false);
  const clientId = useRef<string>("");
  const gameLaunched = useRef<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    socket?.emit("requestLobbyState");
  }, []);

  useEffect(() => {
    socket?.on("connect", connectListener);
    socket?.on("updateGameState", updateGameStateListener);
    socket?.on("isOnLobby", isInLobbyListener);
    socket?.on("isLobbyFull", isLobbyFullListener);
    socket?.on("gameEnd", handleGameEnd);
    socket?.on("newGame", handleNewGame);
    socket?.on("lobbyState", handleLobbyState);

    return () => {
      socket?.off("connect", connectListener);
      socket?.off("updateGameState", updateGameStateListener);
      socket?.off("isOnLobby", isInLobbyListener);
      socket?.off("isLobbyFull", isLobbyFullListener);
      socket?.off("gameEnd", handleGameEnd);
      socket?.off("newGame", handleNewGame);
      socket?.off("lobbyState", handleLobbyState);
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      if (isInLobby) {
        socket?.emit("removeFromLobby");
      }
    };
  }, [location.pathname, isInLobby]);

  const handleNewGame = () => {
    setTimeout(() => {
      start();
      setGameLaunchedRef();
      handlePlayPause();
    }, 1500);
  };

  const setGameLaunchedRef = () => {
    gameLaunched.current = true;
  };

  const connectListener = () => {
    if (socket?.id) clientId.current = socket.id;
  };

  const updateGameStateListener = (gameState: GameState) => {
    setIsPaused(gameState.isPaused);
  };

  const handleLobbyState = (gameState: GameState) => {
    setIsLobbyFull(gameState.isLobbyFull);
    if (gameState.isLobbyFull === true) {
      setIsInLobby(true);
    }
  };

  const isInLobbyListener = (isOnLobby: boolean, clientIdRes: string) => {
    if (clientIdRes === socket?.id) {
      setIsInLobby(isOnLobby);
    }
  };

  const isLobbyFullListener = (isLobbyFull: boolean) => {
    setIsLobbyFull(isLobbyFull);
  };

  const handlePlayPause = () => {
    socket?.emit("getIsPaused", !isPaused);
    setIsPaused(!isPaused);
    if (isPaused === true) start().catch((e) => console.log(e));
    // else stop();
  };

  const handleGameEnd = () => {
    setIsPaused(true);
  };

  const start = async () => {
    const response = await fetch("http://localhost:4000/api/game/play", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return Promise.reject(await response.json());
  };

  if (isInLobby === true) {
    if (isLobbyFull === false && socket) {
      return (
        <>
          <WaitingForPlayer socket={socket} />
        </>
      );
    } else if (isLobbyFull === true && socket) {
      return (
        <div className="GameContainer">
          <GameButtonsBar
            socket={socket}
            isPaused={isPaused}
            handlePlayPause={handlePlayPause}
          />
          <MiddleLine />
          <ScoreBoard socket={socket} />
          <GamePhysics socket={socket} isPaused={isPaused} />
          <PrintWinner socket={socket} />
          <PlayAgain socket={socket} />
          <AutoLaunch
            start={start}
            setGameLaunchedRef={setGameLaunchedRef}
            handlePlayPause={handlePlayPause}
            socket={socket}
          />
        </div>
      );
    }
  } else if (isInLobby === false && socket) {
    return <GameMenu socket={socket} handleError={handleError} />;
  }
};

export default GameContainer;
