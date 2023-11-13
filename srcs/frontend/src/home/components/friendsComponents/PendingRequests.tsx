import React, { FC, useEffect, useState } from "react";
import RequestCard from "./RequestCard";
import { Socket } from "socket.io-client";
import { fetchPendingRequests } from "../../../user/FriendUtils";

interface PendingRequestsProps {
  userId: number;
  socket: Socket;
}

interface PendingRequestsType {
  id: number;
  publicName?: string;
  userName: string;
}

const spanStyle: React.CSSProperties = {
  backgroundColor: "red",
  padding: "0.5rem",
  borderRadius: "100%",
};

const mainDivStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  margin: "1rem",
};

const PendingRequests: FC<PendingRequestsProps> = ({ userId, socket }) => {
  const [pendingRequests, setPendingRequests] = useState<PendingRequestsType[]>(
    []
  );
  const [requestsNumber, setRequestsNumber] = useState<number>(0);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    fetchPendingRequests(
      setIsLoading,
      userId,
      setPendingRequests,
      setRequestsNumber
    ).catch((e) => {
      setError(e);
    });
  }, []);

  useEffect(() => {
    const refreshPendingRequests = async () => {
      await fetchPendingRequests(
        setIsLoading,
        userId,
        setPendingRequests,
        setRequestsNumber
      ).catch((e) => {
        setError(e);
      });
    };

    socket.on("refreshPendingRequests", refreshPendingRequests);
    return () => {
      socket.off("refreshPendingRequests", refreshPendingRequests);
    };
  }, []);

  const handleShowFriendRequests = () => {
    setShowFriendRequests((curr) => !curr);
  };

  if (isLoading) return <>Loading ...</>;

  if (error) return <>Something went wrong, please try again ...</>;

  return (
    <div style={mainDivStyle}>
      <div
        style={{ cursor: "pointer" }}
        onClick={() => handleShowFriendRequests()}
      >
        Friend requests{" "}
        {requestsNumber > 0 ? (
          <span style={spanStyle}>{requestsNumber}</span>
        ) : null}
      </div>
      {showFriendRequests ? (
        <div>
          {pendingRequests.map((request, id) => (
            <RequestCard
              key={id}
              senderId={userId}
              targetId={request.id}
              publicName={request.publicName}
              userName={request.userName}
              socket={socket}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PendingRequests;
