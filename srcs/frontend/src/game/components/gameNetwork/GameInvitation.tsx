import React, { FC, useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

interface GameInvitationProps {
  socket: Socket | undefined;
}

interface InvitationData {
  playerName: string;
  playerSocketId: string;
}

const GameInvitation: FC<GameInvitationProps> = ({ socket }) => {
  const [invitation, setInvitation] = useState<boolean>(false);
  const [invitedBy, setInvitedBy] = useState<string>("");
  const invitedBySocketId = useRef<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    socket?.on("invitation", handleInvitation);
    socket?.on("lobbyIsCreated", handleLobbyCreation);

    return () => {
      socket?.off("invitation", handleInvitation);
      socket?.off("lobbyIsCreated", handleLobbyCreation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleInvitation = async (data: InvitationData) => {
    setInvitation(true);
    setInvitedBy(data.playerName);
    invitedBySocketId.current = data.playerSocketId;
  };

  const handleLobbyCreation = () => {
    navigate("/home/game");
  };

  const acceptInvitation = () => {
    socket?.emit("resToInvitation", {
      res: true,
      id: invitedBySocketId.current,
    });
    setInvitation(false);
    setInvitedBy("");
    invitedBySocketId.current = "";
  };

  const refuseInvitation = () => {
    socket?.emit("resToInvitation", {
      res: false,
      id: invitedBySocketId.current,
    });
    setInvitation(false);
    setInvitedBy("");
    invitedBySocketId.current = "";
  };

  if (invitation === true) {
    return (
      <div
        style={{
          position: "absolute",
          background: "black",
          padding: "1rem",
          fontFamily: "PressStart2P",
        }}
      >
        <p>{invitedBy} wants to play!</p>
        <div style={{display: "flex", justifyContent: "space-around"}}>
          <button onClick={acceptInvitation}>Accept</button>
          <button onClick={refuseInvitation}>Refuse</button>
        </div>
      </div>
    );
  }
  return <></>;
};

export default GameInvitation;
