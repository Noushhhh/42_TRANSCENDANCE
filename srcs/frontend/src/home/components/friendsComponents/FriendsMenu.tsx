import React, { FC, useEffect, useState } from "react";
import { removeFriend } from "../../../user/FriendUtils";
import { Socket } from "socket.io-client";
import { isUserIsBlockedBy } from "../../../chat/components/ChannelUtils";
import { useNavigate } from "react-router-dom";
import UserProfil from "../../../user/UserProfil";

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

const spectate: React.CSSProperties = {
  cursor: "pointer",
};

const cantSpectate: React.CSSProperties = {
  color: "grey",
  background: "#8080808f",
  cursor: "auto",
};

const FriendsMenu: FC<FriendsMenuProps> = ({
  myId,
  friend,
  position,
  socket,
  closeFriendMenu,
}) => {
  const [invitationStatus, setInvitationStatus] = useState<string>("");
  const [isUserProfilDisplayed, setIsUserProfilDisplayed] = useState(false);
  const [isUserInGame, setIsUserInGame] = useState<{
    isInLobby: boolean;
    lobbyName: string | undefined;
  }>();

  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("isUserInGame", friend.id, (data: IsPlayerInLobbyType) => {
      setIsUserInGame({ isInLobby: data.isInGame, lobbyName: data.lobbyName });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friend.id]);

  useEffect(() => {
    socket.on("isInviteAccepted", handleInvitation);
    socket.on("lobbyIsCreated", handleLobbyCreation);
    socket.on("invitationStatus", handleInvitationStatus);

    return () => {
      socket.off("isInviteAccepted", handleInvitation);
      socket.off("lobbyIsCreated", handleLobbyCreation);
      socket.off("invitationStatus", handleInvitationStatus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayClick = async () => {
    try {
      if ((await isUserIsBlockedBy(friend.id)) === true) return;
    } catch (error) {
      console.log("error fetching isUserIsBlockedBy route");
    }

    socket.emit(
      "invitation",
      { user1: myId, user2: friend.id },
      (res: GatewayResponse) => {
        if (res.success === false) {
          handleInvitationStatus(res.message);
        }
      }
    );
  };

  const handleInvitation = (invitationRes: InvitationRes) => {
    if (invitationRes.res === true && invitationRes.client === friend.id) {
      socket.emit(
        "launchGameWithFriend",
        { user1: myId, user2: friend.id },
        (res: GatewayResponse) => {
          console.log(res.message);
        }
      );
    }
    if (invitationRes.res === false) {
      handleInvitationStatus("Invitation refused");
    }
  };

  const handleInvitationStatus = (status: string) => {
    setInvitationStatus(status);
    setTimeout(() => {
      setInvitationStatus("");
    }, 1500);
  };

  const handleLobbyCreation = () => {
    navigate("/home/game");
  };

  const handleProfilClick = () => {
    // handleClose();
    setIsUserProfilDisplayed(true);
  };

  const handleSpectateUser = () => {
    if (isUserInGame?.isInLobby === true) {
      socket.emit("setIntoLobby", isUserInGame.lobbyName);
      handleLobbyCreation();
    }
  };

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
      <span style={{ color: "red", fontSize: "0.6rem" }}>
        {invitationStatus}
      </span>
      {isUserProfilDisplayed ? (
        <UserProfil
          isDisplay={isUserProfilDisplayed}
          setIsDisplay={setIsUserProfilDisplayed}
          userId={friend.id}
        />
      ) : null}
      <button onClick={() => handleProfilClick()}>See profile</button>
      <button onClick={() => handlePlayClick()}>Play</button>
      <button
        onClick={() => handleSpectateUser()}
        style={!isUserInGame?.isInLobby ? cantSpectate : spectate}
      >
        Spectate
      </button>
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
