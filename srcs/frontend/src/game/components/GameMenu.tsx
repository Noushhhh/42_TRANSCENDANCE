import React, { FC } from "react";
import Button from "./common/Button";
import SpectateGame from "./gameNetwork/SpectateGame";
import { Socket } from "socket.io-client";

interface GameMenuProps {
  socket: Socket;
  handleError: (error: SocketErrorObj) => void;
}

interface SocketErrorObj {
  statusCode: number;
  message: string;
}

const GameMenu: FC<GameMenuProps> = ({ socket, handleError }) => {
  // @to-do REMOVE LOCALHOST
  const lobby = () => {
    fetch(`http://localhost:4000/api/game/lobby?clientId=${socket.id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Player not found " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        handleError({ statusCode: 404, message: "Error in lobby creation" });
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
      <button onClick={() => socket.emit("printLobbies")}>PRINT LOBBIES</button>
      <Button onClick={() => lobby()}>Find a game</Button>
      <SpectateGame socket={socket} />
    </div>
  );
};

export default GameMenu;
