import React, { FC, useEffect, useState } from "react";
import { isUrlContainsHttps } from "../home/components/friendsComponents/FriendsList";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface UserProfilProps {
  isDisplay: boolean;
  setIsDisplay: React.Dispatch<React.SetStateAction<boolean>>;
  userId: number;
}

interface UserProfile {
  id: number;
  publicName?: string | null;
  userName: string;
  avatar?: string | undefined;
  gamePlayed: number;
  gameWon: number;
}

const userProfilStyle: React.CSSProperties = {
  position: "absolute",
  left: "13%",
  background: "#201F1F",
  border: "2px solid white",
  padding: "2rem",
  zIndex: "1",
  textAlign: "left",
  width: "61%",
  color: "white",
};

const crossButtonStyle: React.CSSProperties = {
  padding: "0",
  position: "absolute",
  top: "5px",
  right: "3px",
  color: "red",
};

const UserProfil: FC<UserProfilProps> = ({
  isDisplay,
  setIsDisplay,
  userId,
}) => {
  const [userProfile, setUserProfile] = useState<{
    pName: string;
    pAvatar: string | undefined;
    gamePlayed: number;
    gameWon: number;
  }>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/getUserProfil`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "X-User-ID": userId.toString(),
            },
          }
        );

        if (!response.ok) {
          return Promise.reject(await response.json());
        }

        const formattedResponse = await response.json();
        const userProfile: UserProfile = formattedResponse.userProfile;

        const winPercentage_ =
          userProfile.gamePlayed === 0
            ? 0
            : parseFloat(
                ((100 * userProfile.gameWon) / userProfile.gamePlayed).toFixed(
                  2
                )
              );

        setUserProfile({
          pName: userProfile.publicName
            ? userProfile.publicName
            : userProfile.userName,
          pAvatar: userProfile.avatar,
          gamePlayed: userProfile.gamePlayed,
          gameWon: winPercentage_,
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser().catch((e) => console.error(e));
  }, []);

  if (!isDisplay) return <></>;
  return (
    <div style={userProfilStyle}>
      <button style={crossButtonStyle} onClick={() => setIsDisplay(false)}>
        X
      </button>
      <div style={{ display: "flex", gap: "10%", alignItems: "flex-end" }}>
        <p>{userProfile?.pName}</p>
        <img
          src={
            isUrlContainsHttps(userProfile?.pAvatar!) === true
              ? userProfile?.pAvatar
              : `${API_BASE_URL}` + userProfile?.pAvatar
          }
          alt=""
        />
      </div>

      <div>
        <p>Game Played: {userProfile?.gamePlayed}</p>
        <p>Game Won: {userProfile?.gameWon}%</p>
      </div>
    </div>
  );
};

export default UserProfil;
