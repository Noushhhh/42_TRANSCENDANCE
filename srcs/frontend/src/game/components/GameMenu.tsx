import React, { FC } from "react";
import Button from "./common/Button";
import SpectateGame from "./gameNetwork/SpectateGame";
import { Socket } from "socket.io-client";

interface GameMenuProps {
  socket: Socket;
}

const GameMenu: FC<GameMenuProps> = ({ socket }) => {
  // @to-do REMOVE LOCALHOST
  const lobby = () => {
    try {
      fetch(`http://localhost:4000/api/game/lobby?clientId=${socket.id}`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("HTTP error, status: " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log("error: ", error);
    }
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
