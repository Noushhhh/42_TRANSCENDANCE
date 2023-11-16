// Home.tsx
import React, { useState, useEffect, FC } from "react";
import { getMyUserId } from "../../chat/components/ChannelUtils";
import PendingRequests from "./friendsComponents/PendingRequests";
import FriendsList from "./friendsComponents/FriendsList";
import { Socket } from "socket.io-client";

interface FriendsProps {
  socket: Socket | undefined;
}

const Friends: FC<FriendsProps> = ({ socket }) => {
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    getMyId();
  }, []);

  const getMyId = async () => {
    const id = await getMyUserId();

    setUserId(id);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {userId === 0 || !socket ? (
        <>Loading ...</>
      ) : (
        <div>
          <PendingRequests userId={userId} socket={socket} />
          <FriendsList userId={userId} socket={socket} />
        </div>
      )}
    </div>
  );
};

export default Friends;
