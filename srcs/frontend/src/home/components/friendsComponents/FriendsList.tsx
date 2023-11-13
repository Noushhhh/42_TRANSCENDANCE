import React, { FC, useEffect, useState } from "react";
import { formatPlayerName } from "../../../game/components/gameNetwork/ScoreBoard";
import FriendsMenu from "./FriendsMenu";
import { getFriendsList } from "../../../user/FriendUtils";
import { Socket } from "socket.io-client";

interface FriendsListProps {
  userId: number;
  socket: Socket;
}

interface FriendType {
  id: number;
  publicName?: string;
  userName: string;
}

const friendsListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "1rem",
  cursor: "pointer",
};

const FriendsList: FC<FriendsListProps> = ({ userId, socket }) => {
  const [friendsList, setFriendsList] = useState<FriendType[]>([]);
  const [friendsMenu, setFriendsMenu] = useState<{
    visible: boolean;
    friend: FriendType | null;
    position: { top: number; left: number };
  }>({ visible: false, friend: null, position: { top: 0, left: 0 } });

  useEffect(() => {
    getFriendsList(userId, setFriendsList).catch((e) => {
      console.log(e);
    });
  }, []);

  useEffect(() => {
    const asyncRefresh = async () => {
      await refreshFriendList();
    };

    socket.on("refreshFriendList", asyncRefresh);
    return () => {
      socket.off("refreshFriendList", asyncRefresh);
    };
  }, []);

  const refreshFriendList = async () => {
    await getFriendsList(userId, setFriendsList).catch((e) => {
      console.log(e);
    });
  };

  const handleClick = (event: React.MouseEvent, friend: FriendType) => {
    if (!friendsMenu.visible) {
      setFriendsMenu({
        visible: true,
        friend,
        position: { top: event.clientY, left: event.clientX },
      });
    } else {
      closeFriendMenu();
    }
  };

  const closeFriendMenu = () => {
    setFriendsMenu({
      visible: false,
      friend: null,
      position: { top: 0, left: 0 },
    });
  };

  return (
    <div style={friendsListStyle}>
      {friendsList.map((friend, id) => (
        <p key={id} onClick={(e) => handleClick(e, friend)}>
          {friend.publicName
            ? formatPlayerName(friend.publicName)
            : formatPlayerName(friend.userName)}
        </p>
      ))}
      {friendsMenu.visible && (
        <FriendsMenu
          myId={userId}
          friend={friendsMenu.friend!}
          position={friendsMenu.position}
        />
      )}
    </div>
  );
};

export default FriendsList;
