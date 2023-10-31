import React, { FC, useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { blockUser } from "../../../chat/components/ChannelUtils";

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

    return () => {
      socket?.off("invitation", handleInvitation);
    };
  });

  const handleInvitation = (data: InvitationData) => {
    setInvitation(true);
    setInvitedBy(data.playerName);
    invitedBySocketId.current = data.playerSocketId;
  };

  const acceptInvitation = () => {
    socket?.emit("resToInvitation", {
      res: true,
      id: invitedBySocketId.current,
    });
    setInvitation(false);
    setInvitedBy("");
    invitedBySocketId.current = "";
    navigate("/home/game");
  };

  const refuseInvitation = () => {
    socket?.emit("resToInvitation", {
      res: false,
      id: invitedBySocketId.current,
    });
  };

  const blockUser = () => {

  }

  if (invitation === true) {
    return (
      <div style={{ position: "absolute" }}>
        <p>{invitedBy} wants to play!</p>
        <div>
          <button onClick={acceptInvitation}>Accept</button>
          <button onClick={refuseInvitation}>Refuse</button>
          <button onClick={refuseInvitation}>Block</button>
        </div>
      </div>
    );
  }
  return <></>;
};

export default GameInvitation;
