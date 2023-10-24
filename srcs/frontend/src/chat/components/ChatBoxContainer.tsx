import React, { FC, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import "../styles/ChatBoxContainer.css";
import MessageSide from "./MessageSide";
import ContentMessage from "./ContentMessage";
import ChannelInfo from "./ChannelInfo";
import { ChannelIdContext } from "../contexts/channelIdContext";
import { ChannelHeaderContext } from "../contexts/channelHeaderContext";
import { SocketContext } from "../contexts/socketContext";
import { UserIdContext } from "../contexts/userIdContext";
import { getMyUserId } from "./ChannelUtils";

const ChatBoxContainer = () => {
  const [userId, setUserId] = useState<number>(-1);
  const [channelId, setChannelId] = useState<number>(-1);
  const [channelHeader, setChannelHeader] = useState<Channel[]>([]);
  const [channelInfo, setChannelInfo] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [displayMessageSide, setDisplayMessageSide] = useState<boolean>(true);
  const [channelClicked, setChannelClicked] = useState<boolean>(false);
  const [displayContentMessage, setDisplayContentMessage] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchAccessToken = async () => {
      const response = await fetch("http://localhost:4000/api/auth/token", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      const accessToken = data.accessToken;

      const socket: Socket = io("http://localhost:4000", {
        auth: {
          token: accessToken,
        },
      });
      setSocket(socket);

      // Your socket event handling logic here
    };

    fetchAccessToken();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const userIdFetched: number = await getMyUserId();
      setUserId(userIdFetched);
    };
    getUser();
  }, []);

  useEffect(() => {
    handleWindowResize();

    (`(displayMessageSide || !channelClicked) && window.innerWidth < 800`)
      ? setDisplayContentMessage(false)
      : setDisplayContentMessage(true);

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [channelClicked, displayMessageSide]);

  const handleWindowResize = () => {
    if (window.innerWidth < 800) setDisplayMessageSide(false);
    if (window.innerWidth >= 800) setDisplayMessageSide(true);
  };

  const backToChannels = () => {
    setChannelClicked(false);
    setDisplayMessageSide(true);
  };

  if (userId === -1 || socket === undefined) return <p>loader</p>;

  return (
    <div className="ChatBoxContainer">
      <div className="MessageContainer">
        <ChannelIdContext.Provider value={{ channelId, setChannelId }}>
          <SocketContext.Provider value={socket}>
            <ChannelHeaderContext.Provider
              value={{ channelHeader, setChannelHeader }}
            >
              <UserIdContext.Provider value={{ userId, setUserId }}>
                {displayMessageSide || !channelClicked ? (
                  <MessageSide setChannelClicked={setChannelClicked} />
                ) : null}
                {displayContentMessage ? (
                  <ContentMessage
                    channelInfo={channelInfo}
                    setChannelInfo={setChannelInfo}
                    backToChannels={backToChannels}
                  />
                ) : null}
                <ChannelInfo
                  isChannelInfoDisplay={channelInfo}
                  setChannelInfo={setChannelInfo}
                />
              </UserIdContext.Provider>
            </ChannelHeaderContext.Provider>
          </SocketContext.Provider>
        </ChannelIdContext.Provider>
      </div>
    </div>
  );
};
export default ChatBoxContainer;
