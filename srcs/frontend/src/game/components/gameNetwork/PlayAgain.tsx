import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface PlayAgainProps {
  socket: Socket;
}

const mainStyle: React.CSSProperties = {
  position: "absolute",
  background: "#201f1f",
  padding: "1rem",
  borderRadius: "5px",
};

const PlayAgain: FC<PlayAgainProps> = ({ socket }) => {
  const [isDisplay, setIsDisplay] = useState(false);

  useEffect(() => {
    socket.on("playAgain", handlePlayAgain);

    return () => {
      socket.off("playAgain", handlePlayAgain);
    };
  }, []);

  const handlePlayAgain = () => {
    setIsDisplay(true);
  };

  if (!isDisplay) return <></>;

  return (
    <div style={mainStyle}>
      <p>PlayAgain ?</p>
      <button
        style={{ color: "green" }}
        onClick={() => {
          socket.emit("acceptReplay");
          setIsDisplay(false);
        }}
      >
        V
      </button>
      <button
        style={{ color: "red" }}
        onClick={() => {
          socket.emit("refuseReplay");
          setIsDisplay(false);
          socket.emit("setFalseIsLobbyFull");
        }}
      >
        X
      </button>
    </div>
  );
};

export default PlayAgain;
