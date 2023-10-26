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

  useEffect(() => {
    const fetchAccessToken = async () => {
      const response = await fetch('http://localhost:4000/api/auth/token', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      const accessToken = data.accessToken;

      const socket: Socket = io('http://localhost:4000', {
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


  if (userId === -1 || socket === undefined)
    return (<p>loader</p>)

  return (
    <div className="ChatBoxContainer">
      <div className="MessageContainer">
        <ChannelIdContext.Provider value={{ channelId, setChannelId }}>
          <SocketContext.Provider value={socket}>
            <ChannelHeaderContext.Provider value={{ channelHeader, setChannelHeader }}>
              <UserIdContext.Provider value={{ userId, setUserId }}>
                <MessageSide />
                <ContentMessage channelInfo={channelInfo} setChannelInfo={setChannelInfo} />
                <ChannelInfo isChannelInfoDisplay={channelInfo} setChannelInfo={setChannelInfo} />
              </UserIdContext.Provider>
            </ChannelHeaderContext.Provider>
          </SocketContext.Provider>
        </ChannelIdContext.Provider>
      </div>
    </div>
  );
}
export default ChatBoxContainer;
