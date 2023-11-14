import React, { FC, useState } from "react";
import { formatPlayerName } from "../../../game/components/gameNetwork/ScoreBoard";
import { acceptFriendRequest, refuseFriendRequest } from "../../../user/FriendUtils";
import { Socket } from "socket.io-client";

interface RequestCardProps {
  senderId: number;
  targetId: number;
  userName: string;
  publicName?: string;
  socket: Socket;
}

const RequestCard: FC<RequestCardProps> = ({
  senderId,
  targetId,
  userName,
  publicName,
  socket,
}) => {
  const [error, setError] = useState();

  if (error) return <>An error occured, please try again...</>;

  return (
    <div style={{ background: "black", padding: "0.5rem" }}>
      {publicName ? formatPlayerName(publicName) : formatPlayerName(userName)}{" "}
      <button
        onClick={() =>
          acceptFriendRequest(senderId, targetId, socket).catch((e) => {
            setError(e);
          })
        }
        style={{ background: "green" }}
      >
        V
      </button>{" "}
      <button
        onClick={() =>
          refuseFriendRequest(senderId, targetId, socket).catch((e) => {
            setError(e);
          })
        }
        style={{ background: "red" }}
      >
        X
      </button>
    </div>
  );
};

export default RequestCard;
