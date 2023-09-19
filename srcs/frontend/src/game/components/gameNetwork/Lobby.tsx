import React, { FC } from "react";
import { LobbyProps } from "../../assets/data";
import styled from "styled-components";
import Button from "../common/Button";

const Banner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10rem;
  background-color: #1a1a1a;
  border: 1px solid #1a1a1a;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 1.5rem 0;

  &:hover {
    background-color: #1a1a1a;
  }
`;

const Players = styled.div`
  font-size: 1.5rem;
  color: #fff;
  font-weight: bold;
`;

const Lobby: FC<LobbyProps> = ({ player1Id = "", player2Id = "", socket, lobbyName }) => {
  const isInLobby = () => {
    socket.emit("setIntoLobby", lobbyName);
  };

  return (
    <Banner>
      <Button onClick={isInLobby}>
        <Players>
          {player1Id} VS {player2Id}
        </Players>
      </Button>
    </Banner>
  );
};

export default Lobby;
