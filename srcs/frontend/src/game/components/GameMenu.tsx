import React, { FC, useEffect, useRef } from "react";
import Button from "./common/Button";
import SpectateGame from "./gameNetwork/SpectateGame";
import { Socket } from "socket.io-client";

interface GameMenuProps {
  socket: Socket;
}

const GameMenu: FC<GameMenuProps> = ({ socket }) => {
  const clientId = useRef<string>("");

  // @todo REMOVE LOCALHOST
  const lobby = () => {
    console.log("client id ici: ", socket.id);
    fetch(`http://localhost:4000/api/game/lobby?clientId=${socket.id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
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
        fontSize: "1rem",
      }}
    >
      <Button onClick={() => lobby()}>Find a game</Button>
      <SpectateGame socket={socket} />
    </div>
  );
};

export default GameMenu;
