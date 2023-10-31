import React, { useEffect } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import { useState } from "react";
import axios from "axios";
import {
  isChannelExist,
  fetchUser,
  blockUser,
  unblockUser,
  isUserIsBlockedBy,
  fetchConversation,
} from "./ChannelUtils";
import { useSetChannelIdContext } from "../contexts/channelIdContext";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";
import { createChannel } from "./ChannelUtils";
import { create } from "@mui/material/styles/createTransitions";
import { useNavigate } from "react-router-dom";

interface UserProfileMenuProps {
  user: User;
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const setChannelHeader = useSetChannelHeaderContext();
  const setChannelId = useSetChannelIdContext();

  const socket = useSocketContext();
  const userId = useUserIdContext();

  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const menu: string[] = ["Profile", "Private message", "Play", "Block"];
  const menuIfBlock: string[] = [
    "Profile",
    "Private message",
    "Play",
    "Unblock",
  ];

  useEffect(() => {
    socket.on("isInviteAccepted", handleInvitation);

    return () => {
      socket.off("isInviteAccepted", handleInvitation);
    }
  })

  const handleInvitation = (accepted: boolean) => {
    console.log("response = ", accepted);
    if (accepted === true) {
      socket.emit("launchGameWithFriend", { user1: userId, user2: user.id });
      navigate("/home/game");
    }
  }

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    const isBlocked: boolean = await isUserIsBlockedBy(userId, user.id);
    setIsBlocked(isBlocked);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfilClick = () => {
    handleClose();
  };

  const handlePrivateMessageClick = async () => {
    console.log("handle privayte message");
    const response = await isChannelExist([userId, user.id]);
    if (response !== -1) {
      setChannelId(response);
    } else {
      try {
        const channelIdCreated: number = await createChannel(
          "",
          "",
          [userId, user.id],
          "PUBLIC",
          setChannelHeader,
          userId,
          socket
        );
        socket.emit("joinChannel", channelIdCreated);
      } catch (error) {
        console.log("error while creating channel");
      }
    }
    handleClose();
  };

  const handlePlayClick = () => {
    // For theo's function : create game between 2 ids
    console.log("client id, friend id =", userId, user.id);
    socket.emit("invitation", { user1: userId, user2: user.id });
    // navigate("/home/game");
  };

  const handleBlockClick = async () => {
    // Ajoutez ici la logique pour "Bloquer"
    await blockUser(userId, user.id);
    await fetchUser(setChannelHeader, userId, socket);
    // await fetchConversation();
    console.log("blocked");
    handleClose();
  };

  const handleUnblockClick = async () => {
    // Ajoutez ici la logique pour "Bloquer"
    await unblockUser(userId, user.id);
    await fetchUser(setChannelHeader, userId, socket);
    // await fetchUser(setChannelHeader, userId, socket);
    console.log("Unblocked");
    handleClose();
  };

  const menuFunctions: { [key: string]: () => void } = {
    Profile: handleProfilClick,
    "Private message": handlePrivateMessageClick,
    Play: handlePlayClick,
    Block: handleBlockClick,
  };

  const menuFunctionsBlocked: { [key: string]: () => void } = {
    Profile: handleProfilClick,
    "Private message": handlePrivateMessageClick,
    Play: handlePlayClick,
    Unblock: handleUnblockClick,
  };

  return (
    <div>
      <p onClick={handleClick} className="User">
        {user.username}
      </p>
      <Menu
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {isBlocked
          ? menuIfBlock.map((item, index) => {
              return (
                <MenuItem key={index} onClick={menuFunctionsBlocked[item]}>
                  {item}
                </MenuItem>
              );
            })
          : menu.map((item, index) => {
              return (
                <MenuItem key={index} onClick={menuFunctions[item]}>
                  {item}
                </MenuItem>
              );
            })}
      </Menu>
    </div>
  );
}
