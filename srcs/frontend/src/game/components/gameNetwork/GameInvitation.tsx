import React, { FC, useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { blockUser as blockUserUtil, isUserIsBlockedBy } from "../../../chat/components/ChannelUtils";


interface GameInvitationProps {
  socket: Socket | undefined;
}

interface InvitationData {
  playerName: string;
  playerSocketId: string;
}

interface UsersId {
  callerId: number;
  targetId: number;
}

const GameInvitation: FC<GameInvitationProps> = ({ socket }) => {
  const [invitation, setInvitation] = useState<boolean>(false);
  const [invitedBy, setInvitedBy] = useState<string>("");
  const [toBlock, setToBlock] = useState<boolean>(false);
  const invitedBySocketId = useRef<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    socket?.on("invitation", handleInvitation);
    socket?.on("lobbyIsCreated", handleLobbyCreation);
    socket?.on("getUsersId", handleGetUsersId);

    return () => {
      socket?.off("invitation", handleInvitation);
      socket?.off("lobbyIsCreated", handleLobbyCreation);
      socket?.off("getUsersId", handleGetUsersId);
    };
  });

  const handleInvitation = async (data: InvitationData) => {
    setInvitation(true);
    setInvitedBy(data.playerName);
    invitedBySocketId.current = data.playerSocketId;
  };

  const handleLobbyCreation = () => {
    navigate("/home/game");
  };

  const handleGetUsersId = async (usersId: UsersId) => {
    if (toBlock === true) {
      blockUserUtil(usersId.callerId, usersId.targetId);
    }
  };

  const acceptInvitation = () => {
    socket?.emit("resToInvitation", {
      res: true,
      id: invitedBySocketId.current,
    });
    setInvitation(false);
    setInvitedBy("");
    invitedBySocketId.current = "";
    // navigate("/home/game");
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

  const blockUser = () => {
    socket?.emit("requestUsersId", invitedBySocketId.current);
    setToBlock(true);
    setInvitation(false);
    setInvitedBy("");
    invitedBySocketId.current = "";
  };

  if (invitation === true) {
    return (
      <div style={{ position: "absolute" }}>
        <p>{invitedBy} wants to play!</p>
        <div>
          <button onClick={acceptInvitation}>Accept</button>
          <button onClick={refuseInvitation}>Refuse</button>
          <button onClick={blockUser}>Block</button>
        </div>
      </div>
    );
  }
  return <></>;
};

export default GameInvitation;
