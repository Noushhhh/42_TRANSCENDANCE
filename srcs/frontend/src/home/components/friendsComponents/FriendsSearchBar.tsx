import React, { FC, useEffect, useState } from "react";
import { sendFriendRequest } from "../../../user/FriendUtils";
import { Socket } from "socket.io-client";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface User {
  id: number;
  name: string;
}

interface FriendsSearchBarProps {
  socket: Socket;
}

const mainDivStyle: React.CSSProperties = {
  display: "flex",
  margin: "1rem",
};

const searchBarStyle: React.CSSProperties = {
  width: "10rem",
  height: "1.5rem",
  border: "none",
};

const searchResStyle: React.CSSProperties = {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  marginTop: "2rem",
  background: "black",
  color: "white",
  width: "auto",
};

const searchResSlideStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  width: "auto",
  background: "black",
  minWidth: "100%",
  padding: "0 10px",
};

const FriendsSearchBar: FC<FriendsSearchBarProps> = ({ socket }) => {
  const [usersFound, setUsersFound] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    const handleSearchFriend = async () => {
      if (inputValue === "") {
        setUsersFound([]);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/users/getUsersWithStr`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Search-Header": inputValue.toString(),
          },
        }
      );

      if (!response.ok) return Promise.reject(await response.json());

      const data = await response.json();

      const transformedUsers = data.usersFound.map((user: any) => ({
        id: user.id,
        name: formatName(user.publicName),
      }));

      setUsersFound(transformedUsers);
    };

    const debounceTimer = setTimeout(() => {
      handleSearchFriend().catch((e) => e);
    }, 75);

    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const formatName = (name: string) => {
    if (name.length > 8) {
      return name.substring(0, 8) + "...";
    }
    return name;
  };

  return (
    <div style={mainDivStyle}>
      <input
        type="text"
        placeholder="Search Friend"
        style={searchBarStyle}
        onChange={(e) => handleValueChange(e)}
        value={inputValue}
      />
      <div style={searchResStyle}>
        {usersFound !== undefined
          ? usersFound.map((user, i) => (
              <div style={searchResSlideStyle} key={i}>
                <p>{user.name}</p>
                <button
                  style={{ backgroundColor: "green" }}
                  onClick={async () => {
                    await sendFriendRequest(user.id);
                    socket.emit("pendingRequestSent", user.id);
                    setUsersFound([]);
                    setInputValue("");
                  }}
                >
                  +
                </button>
              </div>
            ))
          : null}
      </div>
    </div>
  );
};

export default FriendsSearchBar;
