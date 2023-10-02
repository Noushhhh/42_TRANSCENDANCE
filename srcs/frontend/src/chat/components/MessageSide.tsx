import React, { useEffect, useState, useRef } from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import "../styles/SearchBar.css";
import "../types/channel.type";
import {
  useChannelHeaderContext,
  useSetChannelHeaderContext,
} from "../contexts/channelHeaderContext";
import { fetchUser } from "./ChannelUtils";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";
import ChannelManagerMenu from "./ChannelManagerMenu";
import ChannelManager from "./ChannelManager";
import HeaderChannelInfo from "./HeaderChannelInfo";

function MessageSide() {
  const [previewLastMessage, setPreviewLastMessage] = useState<Message>();
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [displayResults, setDisplayResults] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [listUsersSearched, setListUsersSearched] = useState<User[] | null>([]);
  const [stateMessageToClick, setStateMessageToClick] = useState<boolean[]>([
    false,
    false,
  ]); // index 0 = create, index 1 = join
  const [headerTitle, setHeaderTitle] = useState<string>("");

  const fetchBoolean = useRef(false);
  const userId = useUserIdContext();
  const socket = useSocketContext();
  const channelHeader = useChannelHeaderContext();
  const setChannelHeader = useSetChannelHeaderContext();

  const setStateMessageToFalse = () => {
    setStateMessageToClick([false, false]);
  };

  useEffect(() => {
    if (stateMessageToClick[0] === true) {
      setHeaderTitle("Create a channel");
    } else if (stateMessageToClick[1] === true)
      setHeaderTitle("Join a channel");
  }, [stateMessageToClick]);

  function findChannelById(channelId: number): Channel | undefined {
    return channelHeader.find((channel) => channel.channelId === channelId);
  }

  useEffect(() => {
    socket.on("message", messageEvent);

    socket.on("changeConnexionState", changeConnexionStateEvent);
    return () => {
      socket.off("message", messageEvent);
      socket.off("changeConnexionState", changeConnexionStateEvent);
    };
  });

  const messageEvent = (id: any, data: Message) => {
    if (!data) return;
    setPreviewLastMessage(data);
    const foundChannel = findChannelById(data.channelId);
    if (!foundChannel) return;
    foundChannel.dateLastMsg = data.createdAt;
  };

  const changeConnexionStateEvent = () => {
    needReload === false ? setNeedReload(true) : setNeedReload(false);
  };

  useEffect(() => {
    fetchUser(setChannelHeader, userId, socket);
    return () => {
      fetchBoolean.current = true;
    };
  }, [needReload]);

  return (
    <div className="MessageSide">
      {stateMessageToClick[0] === true || stateMessageToClick[1] === true ? (
        <HeaderChannelInfo
          handleClick={setStateMessageToFalse}
          title={headerTitle}
        />
      ) : (
        <div className="containerSearchBar">
          <ChannelManagerMenu
            stateMessageToClick={stateMessageToClick}
            setStateMessageToClick={setStateMessageToClick}
          />
          <SearchBar
            setDisplayResults={setDisplayResults}
            setInputValue={setInputValue}
            inputValue={inputValue}
          />
        </div>
      )}
      <SearchBarResults
        inputValue={inputValue}
        displayResults={displayResults}
        showUserMenu={true}
        addUserToList={() => {}}
        onlySearchInChannel={false}
        listUsersSearched={listUsersSearched}
        setListUsersSearched={setListUsersSearched}
      />

      {stateMessageToClick[0] || stateMessageToClick[1] ? (
        <ChannelManager
          display={stateMessageToClick}
          setStateMessageToClick={setStateMessageToClick}
        />
      ) : (
        channelHeader
          .sort((a, b) => {
            const dateA = new Date(a.dateLastMsg);
            const dateB = new Date(b.dateLastMsg);
            return dateB.getTime() - dateA.getTime();
          })
          .map((channel, index) => {
            if (
              previewLastMessage &&
              channel.channelId === previewLastMessage?.channelId
            )
              channel.lastMsg = previewLastMessage.content;
            return (
              <MessageToClick
                channel={channel}
                key={index}
                isConnected={channel.isConnected}
              />
            );
          })
      )}
    </div>
  );
}

export default MessageSide;
