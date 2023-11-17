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
  avatar?: string;
}

const friendsListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "1rem",
  cursor: "pointer",
};

const friendLignStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "flex-start",
  gap: "1rem",
};

const FriendsList: FC<FriendsListProps> = ({ userId, socket }) => {
  const [friendsList, setFriendsList] = useState<FriendType[]>([]);
  const [friendsMenu, setFriendsMenu] = useState<{
    visible: boolean;
    friend: FriendType | null;
    position: { top: number; left: number };
  }>({ visible: false, friend: null, position: { top: 0, left: 0 } });
  const [friendsStatusMap, setFriendsStatusMap] =
    useState<Map<number, string>>();

  useEffect(() => {
    getFriendsList(userId, setFriendsList).catch((e) => {
      console.log(e);
    });
  }, []);

  useEffect(() => {
    socket.emit("requestFriendsStatus", userId);
  }, []);

  useEffect(() => {
    const refreshFriendList = async () => {
      await getFriendsList(userId, setFriendsList).catch((e) => {
        console.log(e);
      });
    };
    socket.on("statusChanged", handleStatusChanged);
    socket.on("friendStatus", handleFriendStatus);
    socket.on("refreshFriendList", refreshFriendList);

    return () => {
      socket.off("statusChanged", handleStatusChanged);
      socket.off("friendStatus", handleFriendStatus);
      socket.off("refreshFriendList", refreshFriendList);
    };
  }, []);

  const handleStatusChanged = () => {
    socket.emit("requestFriendsStatus", userId);
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

  const handleFriendStatus = (myFriendsStatusMap: string) => {
    const parsedArray = JSON.parse(myFriendsStatusMap);
    const reconstructedMap = new Map<number, string>(parsedArray);
    setFriendsStatusMap(reconstructedMap);
  };

  const closeFriendMenu = () => {
    setFriendsMenu({
      visible: false,
      friend: null,
      position: { top: 0, left: 0 },
    });
  };

  const isUrlContainsHttps = (url: string) => {
    const firstChars = url.substring(0, 23);
    console.log("first chars= ", firstChars);
    if (firstChars === "https://cdn.intra.42.fr") return true;
    return false;
  };

  return (
    <div style={friendsListStyle}>
      {friendsList.map((friend, id) => (
        <p
          key={id}
          onClick={(e) => handleClick(e, friend)}
          style={friendLignStyle}
        >
          <img
            src={
              isUrlContainsHttps(friend.avatar!) === true
                ? friend.avatar
                : "http://localhost:4000/" + friend.avatar
            }
            alt=""
          />
          {friend.publicName
            ? formatPlayerName(friend.publicName)
            : formatPlayerName(friend.userName)}{" "}
          <p style={{ fontSize: "70%", color: "grey", margin: "0" }}>
            {friendsStatusMap?.get(friend.id)}
          </p>
        </p>
      ))}
      {friendsMenu.visible && (
        <FriendsMenu
          myId={userId}
          friend={friendsMenu.friend!}
          position={friendsMenu.position}
          socket={socket}
          closeFriendMenu={closeFriendMenu}
        />
      )}
    </div>
  );
};

export default FriendsList;