import React, { FC, useEffect, useRef } from "react";
import Button from "./common/Button";
import SpectateGame from "./gameNetwork/SpectateGame";
import { Socket } from "socket.io-client";

interface GameMenuProps {
  socket: Socket;
}

const GameMenu: FC<GameMenuProps> = ({ socket }) => {
  const clientId = useRef<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      clientId.current = socket.id;
    });

    return () => {
      socket.off("connect");
    };
  }, [socket]);

  const lobby = () => {
    fetch(`http://localhost:4000/api/game/lobby?clientId=${clientId.current}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "50%",
        fontSize: "3rem",
      }}
    >
      <Button onClick={() => lobby()}>Find a game</Button>
      <SpectateGame socket={socket} />
    </div>
  );
};

export default GameMenu;
