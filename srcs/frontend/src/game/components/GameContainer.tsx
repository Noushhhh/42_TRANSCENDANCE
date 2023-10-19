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

interface GameContainerProps {
  socket: Socket;
}

const GameContainer: FC<GameContainerProps> = ({ socket }) => {
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isInLobby, setIsInLobby] = useState<boolean>(false);
  const [isLobbyFull, setIsLobbyFull] = useState<boolean>(false);
  const clientId = useRef<string>("");
  const gameLaunched = useRef<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    socket.on("connect", connectListener);
    socket.on("updateGameState", updateGameStateListener);
    socket.on("isOnLobby", isInLobbyListener);
    socket.on("isLobbyFull", isLobbyFullListener);
    socket.on("gameEnd", handleGameEnd);
    socket.on("newGame", handleNewGame);

    return () => {
      socket.off("connect", connectListener);
      socket.off("updateGameState", updateGameStateListener);
      socket.off("isOnLobby", isInLobbyListener);
      socket.off("isLobbyFull", isLobbyFullListener);
      socket.off("gameEnd", handleGameEnd);
      socket.off("newGame", handleNewGame);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (isInLobby) {
        socket.emit("removeFromLobby");
      }
    };
  }, [location.pathname, isInLobby]);

  const handleNewGame = () => {
    setTimeout(() => {
      start();
      setGameLaunchedRef();
      handlePlayPause();
      try {
        fetch("http://localhost:4000/api/game/addGameToPlayer", {
          method: "GET",
          credentials: "include",
        })
          .then((response) => {
            if (!response.ok)
              throw new Error("HTTP error, status: " + response.status);
            return response.json();
          })
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log("player not found error: ", error);
      }
    }, 1500);
  };

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
    setIsPaused(true);
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
      return (
        <>
          <WaitingForPlayer />
        </>
      );
    } else {
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
          <AutoLaunch
            start={start}
            setGameLaunchedRef={setGameLaunchedRef}
            handlePlayPause={handlePlayPause}
          />
        </div>
      );
    }
  }
  return <GameMenu socket={socket} />;
};

export default GameContainer;
