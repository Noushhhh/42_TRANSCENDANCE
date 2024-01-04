import React, { FC, useEffect, useState } from "react";
import { SpectateGameProps } from "../../assets/data";
import Lobby from "./Lobby";
import Button from "../common/Button";

type LobbyData = {
  key: string;
  player1: string;
  player2: string;
};

const SpectateGame: FC<SpectateGameProps> = ({ socket }) => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [lobbiesState, setLobbiesState] = useState<LobbyData[]>([]);

  useEffect(() => {
    return () => {
      socket.emit("updateStatus", "Online");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isButtonClicked]);

  useEffect(() => {
    socket.on("getAllLobbies", getAllLobbiesListener);
    return () => {
      socket.off("getAllLobbies", getAllLobbiesListener);
    };
  }, [socket]);

  const getAllLobbiesListener = (data: { lobbies: LobbyData[] }) => {
    console.log("lobbies: ", data.lobbies, typeof data.lobbies);
    setLobbiesState(data.lobbies);
  };

  const requestLobbies = () => {
    socket.emit("requestLobbies");
    setIsButtonClicked(true);
  };

  if (isButtonClicked === false) {
    return (
      <Button onClick={() => requestLobbies()} style={{ marginTop: "1.5rem" }}>
        Spectate game
      </Button>
    );
  } else if (isButtonClicked === true && lobbiesState.length > 0) {
    return (
      <div style={{ width: "100%" }}>
        {lobbiesState.map((value: LobbyData, index: number) => (
          <Lobby
            key={index}
            lobbyName={value.key}
            player1Id={value.player1}
            player2Id={value.player2}
            socket={socket}
          />
        ))}
      </div>
    );
  }
  return <div>No games</div>;
};

export default SpectateGame;
