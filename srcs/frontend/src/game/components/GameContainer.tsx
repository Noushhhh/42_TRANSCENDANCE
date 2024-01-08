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
import PlayAgain from "./gameNetwork/PlayAgain";
import Timer from "./gamePhysics/Timer";
import MobileControls from "./gamePhysics/MobileControls";
import { isMobile } from "react-device-detect";

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
  const [isInLobby, setIsInLobby] = useState<boolean>(false);
  const [isLobbyFull, setIsLobbyFull] = useState<boolean>(false);
  const [isInSpectate, setIsInSpectate] = useState<boolean>(false);
  const clientId = useRef<string>("");
  const gameLaunched = useRef<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    socket?.emit("requestLobbyState");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket?.emit("isInSpectateMode");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLobbyFull]);

  useEffect(() => {
    if (isInSpectate === true) {
      socket?.emit("updateStatus", "Spectating game");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInSpectate]);

  useEffect(() => {
    socket?.on("connect", connectListener);
    socket?.on("isOnLobby", isInLobbyListener);
    socket?.on("isLobbyFull", isLobbyFullListener);
    socket?.on("newGame", handleNewGame);
    socket?.on("lobbyState", handleLobbyState);
    socket?.on("isInSpectateMode", handleIsInSpectateMode);

    return () => {
      socket?.off("connect", connectListener);
      socket?.off("isOnLobby", isInLobbyListener);
      socket?.off("isLobbyFull", isLobbyFullListener);
      socket?.off("newGame", handleNewGame);
      socket?.off("lobbyState", handleLobbyState);
      socket?.off("isInSpectateMode", handleIsInSpectateMode);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {});

  useEffect(() => {
    return () => {
      if (isInLobby) {
        socket?.emit("removeFromLobby");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isInLobby]);

  const handleNewGame = () => {
    if (!isInLobby) return;
    setTimeout(() => {
      start();
      setGameLaunchedRef();
    }, 3000);
  };

  const setGameLaunchedRef = () => {
    gameLaunched.current = true;
  };

  const connectListener = () => {
    if (socket?.id) clientId.current = socket.id;
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

  const handleIsInSpectateMode = (res: boolean) => {
    setIsInSpectate(res);
  };

  const handleSpectateBack = () => {
    socket?.emit("leaveSpecateMode");
  };

  const start = async () => {
    const response = await fetch("http://localhost:4000/api/game/play", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return Promise.reject(await response.json());
  };

  if (isInLobby === true) {
    if (isLobbyFull === false && socket && isInSpectate === false) {
      return (
        <>
          <WaitingForPlayer socket={socket} />
        </>
      );
    } else if (isLobbyFull === false && isInSpectate === true) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>Game is finished</div>
          <button onClick={() => handleSpectateBack()}>Back</button>
        </div>
      );
    } else if (isLobbyFull === true && socket) {
      return (
        <div className="GameContainer">
          <GameButtonsBar socket={socket} />
          <MiddleLine />
          <ScoreBoard socket={socket} />
          <GamePhysics socket={socket} />
          {isInSpectate === false ? <Timer socket={socket} /> : null}
          <PrintWinner socket={socket} />
          <PlayAgain socket={socket} />
          <AutoLaunch
            start={start}
            setGameLaunchedRef={setGameLaunchedRef}
            socket={socket}
          />
          {isMobile ? <MobileControls socket={socket} /> : null}
        </div>
      );
    }
  } else if (isInLobby === false && socket) {
    return <GameMenu socket={socket} handleError={handleError} />;
  }
  return <></>;
};

export default GameContainer;
