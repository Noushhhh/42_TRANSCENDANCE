import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface AutoLaunchProps {
  start: () => void;
  setGameLaunchedRef: () => void;
  handlePlayPause: () => void;
  socket: Socket;
}

const AutoLaunch: FC<AutoLaunchProps> = ({
  start,
  setGameLaunchedRef,
  handlePlayPause,
  socket,
}) => {
  const [player1Replay, setPlayer1Replay] = useState(false);
  const [player2Replay, setPlayer2Replay] = useState(false);

  useEffect(() => {
    socket.on("relaunchGame", handleRelaunchGame);
    socket.on("player1Replay", handlePayer1Replay);
    socket.on("player2Replay", handlePayer2Replay);

    return () => {
      socket.off("relaunchGame", handleRelaunchGame);
      socket.off("player1Replay", handlePayer1Replay);
      socket.off("player2Replay", handlePayer2Replay);
    };
  }, []);

  useEffect(() => {
    if (player1Replay === true && player2Replay === true) {
      setTimeout(() => {
        start();
        setGameLaunchedRef();
        handlePlayPause();
      }, 1500);
      setPlayer1Replay(false);
      setPlayer2Replay(false);
    }
  }, [player1Replay, player2Replay]);

  useEffect(() => {
    setTimeout(() => {
      start();
      setGameLaunchedRef();
      handlePlayPause();
    }, 1500);
  }, []);

  const handleRelaunchGame = () => {};

  const handlePayer1Replay = (res: boolean) => {
    setPlayer1Replay(res);
  };

  const handlePayer2Replay = (res: boolean) => {
    setPlayer2Replay(res);
  };

  return true;
};

export default AutoLaunch;
