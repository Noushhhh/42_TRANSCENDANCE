import React, { FC } from "react";
import { removeFriend } from "../../../user/FriendUtils";
import { Socket } from "socket.io-client";

interface FriendsMenuProps {
  myId: number;
  friend: FriendType;
  position: { top: number; left: number };
  socket: Socket;
  closeFriendMenu: () => void;
}

interface FriendType {
  id: number;
  publicName?: string;
  userName: string;
}

const FriendsMenu: FC<FriendsMenuProps> = ({
  myId,
  friend,
  position,
  socket,
  closeFriendMenu,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "white",
        color: "black",
        padding: "0.5rem",
      }}
    >
      <button>See profile</button>
      <button>Play</button>
      <button
        onClick={() => {
          removeFriend(friend.id, socket).catch((e) => {
            console.log(e);
          });
          closeFriendMenu();
        }}
      >
        Remove friend
      </button>
    </div>
  );
};

export default FriendsMenu;
