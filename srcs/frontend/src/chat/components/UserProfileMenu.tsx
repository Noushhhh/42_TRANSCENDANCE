import React, { useEffect, useRef } from "react";
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
import {
  useChannelIdContext,
  useSetChannelIdContext,
} from "../contexts/channelIdContext";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";
import { createChannel } from "./ChannelUtils";
import { create } from "@mui/material/styles/createTransitions";
import { useNavigate } from "react-router-dom";
import InvitationStatus from "./InvitationStatus";
import { removeFriend, sendFriendRequest } from "../../user/FriendUtils";
import UserProfil from "../../user/UserProfil";

interface UserProfileMenuProps {
  user: User;
}

interface GatewayResponse {
  success: boolean;
  message: string;
}

interface InvitationRes {
  res: boolean;
  client: number;
}

interface IsPlayerInLobbyType {
  isInGame: boolean;
  lobbyName: string | undefined;
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [invitationStatus, setInvitationStatus] = useState<string>("");
  const [areUsersFriend, setAreUsersFriend] = useState<boolean>(false);
  const [isUserProfilDisplayed, setIsUserProfilDisplayed] = useState(false);
  const [isUserInGame, setIsUserInGame] = useState<{
    isInLobby: boolean;
    lobbyName: string | undefined;
  }>();

  const setChannelHeader = useSetChannelHeaderContext();
  const setChannelId = useSetChannelIdContext();
  const channelId: number = useChannelIdContext();

  const socket = useSocketContext();
  const userId = useUserIdContext();

  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const menu: string[] = [
    "Profile",
    "Private message",
    areUsersFriend === false ? "Add Friend" : "Remove Friend",
    "Play",
    "Spectate",
    "Block",
  ];
  const menuIfBlock: string[] = [
    "Profile",
    "Private message",
    areUsersFriend === false ? "Add Friend" : "Remove Friend",
    "Play",
    "Spectate",
    "Unblock",
  ];

  useEffect(() => {
    socket.emit("isUserInGame", user.id, (data: IsPlayerInLobbyType) => {
      setIsUserInGame({ isInLobby: data.isInGame, lobbyName: data.lobbyName });
    });
  }, []);

  useEffect(() => {
    socket.on("isInviteAccepted", handleInvitation);
    socket.on("lobbyIsCreated", handleLobbyCreation);
    socket.on("invitationStatus", handleInvitationStatus);

    return () => {
      socket.off("isInviteAccepted", handleInvitation);
      socket.off("lobbyIsCreated", handleLobbyCreation);
      socket.off("invitationStatus", handleInvitationStatus);
    };
  }, []);

  const handleLobbyCreation = () => {
    navigate("/home/game");
  };

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    handleAreUsersFriend();
    setAnchorEl(event.currentTarget);
    const isBlocked: boolean = await isUserIsBlockedBy(userId, user.id);
    setIsBlocked(isBlocked);
  };

  const handleInvitationStatus = (status: string) => {
    setInvitationStatus(status);
    setTimeout(() => {
      setInvitationStatus("");
    }, 1500);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfilClick = () => {
    handleClose();
    setIsUserProfilDisplayed(true);
  };

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(user.id);
      socket.emit("pendingRequestSent", user.id);
    } catch (error) {
      console.error("Error trying to send friend request");
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend(user.id, socket);
    } catch (error) {
      console.log("Error trying to remove friend");
    }
  };

  const handleAreUsersFriend = () => {
    socket.emit(
      "areUsersFriend",
      { userId1: userId, userId2: user.id },
      (res: boolean) => {
        setAreUsersFriend(res);
      }
    );
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
        const data = {
          channelId,
          userId: user.id,
        };
        socket.emit("joinChannel", channelIdCreated);
        socket.emit("notifySomeoneJoinChannel", data);
      } catch (error) {
        console.log("error while creating channel");
      }
    }
    handleClose();
  };

  const handlePlayClick = async () => {
    try {
      if ((await isUserIsBlockedBy(user.id, userId)) === true) return;
    } catch (error) {
      console.log("error fetching isUserIsBlockedBy route");
    }

    socket.emit(
      "invitation",
      { user1: userId, user2: user.id },
      (res: GatewayResponse) => {
        if (res.success === false) {
          handleInvitationStatus(res.message);
        }
      }
    );
  };

  const handleInvitation = (invitationRes: InvitationRes) => {
    if (invitationRes.res === true && invitationRes.client === user.id) {
      socket.emit(
        "launchGameWithFriend",
        { user1: userId, user2: user.id },
        (res: GatewayResponse) => {
          console.log(res.message);
        }
      );
    }
    if (invitationRes.res === false) {
      handleInvitationStatus("Invitation refused");
    }
  };

  const handleBlockClick = async () => {
    try {
      await blockUser(userId, user.id);
      socket.emit("block", { blockerId: userId, blockedId: user.id });
      await fetchUser(setChannelHeader, userId, socket);
      console.log("blocked");
      handleClose();
    } catch (error) {
      console.log("error blocking user");
    }
  };

  const handleUnblockClick = async () => {
    try {
      // Ajoutez ici la logique pour "Bloquer"
      await unblockUser(userId, user.id);
      socket.emit("unblock", { blockerId: userId, blockedId: user.id });
      await fetchUser(setChannelHeader, userId, socket);
      // await fetchUser(setChannelHeader, userId, socket);
      console.log("Unblocked");
      handleClose();
    } catch (error) {
      console.log("error unblocking user");
    }
  };

  const handleSpectateUser = () => {
    if (isUserInGame?.isInLobby === true) {
      socket.emit("setIntoLobby", isUserInGame.lobbyName);
      handleLobbyCreation();
    }
  };

  const addOrRemove = areUsersFriend ? "Remove Friend" : "Add Friend";

  const menuFunctions: { [key: string]: () => void } = {
    Profile: handleProfilClick,
    "Private message": handlePrivateMessageClick,
    [addOrRemove]:
      areUsersFriend === false ? handleAddFriend : handleRemoveFriend,
    Play: handlePlayClick,
    Spectate: handleSpectateUser,
    Block: handleBlockClick,
  };

  const menuFunctionsBlocked: { [key: string]: () => void } = {
    Profile: handleProfilClick,
    "Private message": handlePrivateMessageClick,
    [addOrRemove]:
      areUsersFriend === false ? handleAddFriend : handleRemoveFriend,
    Play: handlePlayClick,
    Spectate: handleSpectateUser,
    Unblock: handleUnblockClick,
  };

  return (
    <div>
      {isUserProfilDisplayed ? (
        <UserProfil
          isDisplay={isUserProfilDisplayed}
          setIsDisplay={setIsUserProfilDisplayed}
          userId={user.id}
        />
      ) : null}
      <InvitationStatus invitationStatus={invitationStatus} />
      <p onClick={handleClick} className="User">
        {user.publicName && user.publicName}
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
