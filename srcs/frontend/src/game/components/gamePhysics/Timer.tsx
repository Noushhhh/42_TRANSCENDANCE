import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface TimerProps {
  socket: Socket;
}

const Timer: FC<TimerProps> = ({ socket }) => {
  const [timer, setTimer] = useState(3);
  const [launchTimer, setLaunchTimer] = useState(false);
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    socket.on("relaunchGame", handleRelaunchGame);
    return () => {
      socket.off("relaunchGame", handleRelaunchGame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDisplay(true);
    const interval = setInterval(() => {
      setTimer((curr) => {
        if (curr === 0) {
          setDisplay(false);
          clearInterval(interval);
          return 3;
        }

        return curr - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [launchTimer]);

  const handleRelaunchGame = () => {
    setLaunchTimer((curr) => !curr);
  };

  if (display === false) return;
  return (
    <div
      style={{
        position: "absolute",
        color: "red",
        fontSize: "2rem",
        backgroundColor: "#1a1a1a",
      }}
    >
      {timer}
    </div>
  );
};

export default Timer;
