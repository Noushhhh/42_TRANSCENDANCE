import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface AutoLaunchProps {
  start: () => Promise<undefined>;
  setGameLaunchedRef: () => void;
  socket: Socket;
}

const AutoLaunch: FC<AutoLaunchProps> = ({
  start,
  setGameLaunchedRef,
  socket,
}) => {
  const [player1Replay, setPlayer1Replay] = useState(false);
  const [player2Replay, setPlayer2Replay] = useState(false);

  useEffect(() => {
    socket.on("player1Replay", handlePayer1Replay);
    socket.on("player2Replay", handlePayer2Replay);

    return () => {
      socket.off("player1Replay", handlePayer1Replay);
      socket.off("player2Replay", handlePayer2Replay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (player1Replay === true && player2Replay === true) {
      socket.emit("relaunchTimer");
      setTimeout(() => {
        start().catch((e) => console.log(e));
        setGameLaunchedRef();
        socket.emit("playAgain");
      }, 3000);
      setPlayer1Replay(false);
      setPlayer2Replay(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player1Replay, player2Replay]);

  useEffect(() => {
    setTimeout(() => {
      start().catch((e) => console.log(e));
      setGameLaunchedRef();
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayer1Replay = (res: boolean) => {
    setPlayer1Replay(res);
  };

  const handlePayer2Replay = (res: boolean) => {
    setPlayer2Replay(res);
  };

  return <></>;
};

export default AutoLaunch;
