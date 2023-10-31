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

    return () => {
      socket?.off("invitation", handleInvitation);
    };
  });

  const handleInvitation = (data: InvitationData) => {
    console.log("invitation recue par = ", data.playerName);
    console.log("inviation socket id = ", data.playerSocketId);
    setInvitation(true);
    setInvitedBy(invitedBy);
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

  if (invitation === true) {
    return (
      <div style={{ position: "absolute" }}>
        <p>{invitedBy} wants to play!</p>
        <div>
          <button onClick={acceptInvitation}>Accept</button>
          <button onClick={refuseInvitation}>Refuse</button>
        </div>
      </div>
    );
  }
  return <></>;
};

export default GameInvitation;
