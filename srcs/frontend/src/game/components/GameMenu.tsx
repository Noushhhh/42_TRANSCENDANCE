import React, { FC } from "react";
import Button from "./common/Button";
import SpectateGame from "./gameNetwork/SpectateGame";
import { Socket } from "socket.io-client";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface GameMenuProps {
  socket: Socket;
  handleError: (error: SocketErrorObj) => void;
}

interface SocketErrorObj {
  statusCode: number;
  message: string;
}

const GameMenu: FC<GameMenuProps> = ({ socket, handleError }) => {
  const lobby = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/game/lobby?clientId=${socket.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) return Promise.reject(await response.json());
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
      {/* <button onClick={() => socket.emit("printLobbies")}>PRINT LOBBIES</button> */}
      <Button
        onClick={() =>
          lobby().catch((e) =>
            handleError({ statusCode: 404, message: "Error in lobby creation" })
          )
        }
      >
        Find a game
      </Button>
      <SpectateGame socket={socket} />
    </div>
  );
};

export default GameMenu;
