import React, { FC, useEffect, useState, useRef } from "react";
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
import { toggleMenuMobile } from "../contexts/toggleMenuMobile";
import { fetchUser } from "./ChannelUtils";

interface ChatProps {
  socket: Socket | undefined;
}

const ChatBoxContainer: FC<ChatProps> = ({ socket }) => {
  const [userId, setUserId] = useState<number>(-1);
  const [channelId, setChannelId] = useState<number>(-1);
  const [channelHeader, setChannelHeader] = useState<Channel[]>([]);
  const [channelInfo, setChannelInfo] = useState<boolean>(false);
  const [displayMessageSide, setDisplayMessageSide] = useState<boolean>(true); // state to make visible/not visible the MessageSide component
  const [channelClicked, setChannelClicked] = useState<boolean>(false);
  const [displayContentMessage, setDisplayContentMessage] = useState<boolean>(false);
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const [previewLastMessage, setPreviewLastMessage] = useState<Message>();

  useEffect(() => {
    const getUser = async () => {
      try {
        const userIdFetched: number = await getMyUserId();
        setUserId(userIdFetched);
      } catch (error: any){
        console.log(error.message);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    handleWindowResize();

    (displayMessageSide || !channelClicked) && window.innerWidth < 800
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

    if (toggleMenu === false && window.innerWidth < 800) {
      setDisplayContentMessage(true);
      setToggleMenu(false);
    }

    if (toggleMenu === false && channelInfo && window.innerWidth < 800) {
      setToggleMenu(true);
    }
  };

  const backToChannels = () => {
    setChannelClicked(false);
    setDisplayMessageSide(true);
  };
  
  useEffect(() => {
    if (socket){
      console.log("render");
      socket.on("kickedOrBanned", kickedOrBannedEvent);
    }
    return () => {
      if (socket){
        console.log("return useffect");
        socket.off("kickedOrBanned", kickedOrBannedEvent);
      }
    };
  }, [socket]);

  useEffect(() => {
    console.log(displayContentMessage);
  }, [displayContentMessage]);

  const kickedOrBannedEvent = async (bannedFromChannelId: number) => {
    try {
      if (socket){
        await fetchUser(setChannelHeader, userId, socket);
        backToChannels();
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    console.log(channelClicked);
  }, [channelClicked])

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
                  <MessageSide
                    setChannelClicked={setChannelClicked}
                    previewLastMessage={previewLastMessage}
                    setPreviewLastMessage={setPreviewLastMessage}
                  />
                ) : null}
                <toggleMenuMobile.Provider
                  value={{ toggleMenu, setToggleMenu }}
                >
                  {displayContentMessage &&
                  toggleMenu === false &&
                  (window.innerWidth > 799 || channelClicked) ? (
                    <ContentMessage
                      channelInfo={channelInfo}
                      setChannelInfo={setChannelInfo}
                      backToChannels={backToChannels}
                      setPreviewLastMessage={setPreviewLastMessage}
                    />
                  ) : null}
                  <ChannelInfo
                    isChannelInfoDisplay={channelInfo}
                    setChannelInfo={setChannelInfo}
                    setDisplayMessageSide={setDisplayMessageSide}
                    setChannelClicked={setChannelClicked}
                  />
                </toggleMenuMobile.Provider>
              </UserIdContext.Provider>
            </ChannelHeaderContext.Provider>
          </SocketContext.Provider>
        </ChannelIdContext.Provider>
      </div>
    </div>
  );
};
export default ChatBoxContainer;
