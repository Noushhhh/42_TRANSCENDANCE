import React, { FC } from "react";
import { removeFriend } from "../../../user/FriendUtils";

interface FriendsMenuProps {
  myId: number;
  friend: FriendType;
  position: { top: number; left: number };
}

interface FriendType {
  id: number;
  publicName?: string;
  userName: string;
}

const FriendsMenu: FC<FriendsMenuProps> = ({ myId, friend, position }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "white",
        color: "black",
        padding: "0.5rem",
      }}
    >
      <button
        onClick={() =>
          removeFriend(myId, friend).catch((e) => {
            console.log(e);
          })
        }
      >
        Remove friend
      </button>
    </div>
  );
};

export default FriendsMenu;
