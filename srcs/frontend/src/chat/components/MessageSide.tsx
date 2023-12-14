import React, { useEffect, useState, useRef } from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import "../styles/SearchBar.css";
import "../types/channel.type";
import { useChannelHeaderContext, useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { fetchUser, leaveChannel } from "./ChannelUtils";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";
import ChannelManagerMenu from "./ChannelManagerMenu";
import ChannelManager from "./ChannelManager";
import HeaderChannelInfo from "./HeaderChannelInfo";
import { Socket } from "socket.io-client";
import { useChannelIdContext, useSetChannelIdContext } from "../contexts/channelIdContext";

interface Message {
  id: number;
  senderId: number;
  channelId: number;
  content: string;
  createdAt: Date;
  messageType: string;
}

interface MessageSideProps {
  setChannelClicked: React.Dispatch<React.SetStateAction<boolean>>;
  previewLastMessage: Message | undefined;
  setPreviewLastMessage: React.Dispatch<React.SetStateAction<Message | undefined>>;
}

function MessageSide({ setChannelClicked, previewLastMessage, setPreviewLastMessage }: MessageSideProps) {
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
  const userId: number = useUserIdContext();
  const socket: Socket = useSocketContext();
  const channelHeader = useChannelHeaderContext();
  const setChannelHeader = useSetChannelHeaderContext();
  const setChannelId = useSetChannelIdContext();
  const channelId: number = useChannelIdContext();

  const setStateMessageToFalse = () => {
    setStateMessageToClick([false, false]);
  };

  const kickedOrBannedEvent = async (bannedFromChannelId: number) => {
    try {
      await fetchUser(setChannelHeader, userId, socket);
    } catch (error) {
      console.log(error);
    }
    if (bannedFromChannelId === channelId)
      setChannelId(-1);
  }

  useEffect(() => {
    socket.on("channelDeleted", channelDeletedEvent);
    socket.on("kickedOrBanned", kickedOrBannedEvent);
    return () => {
      socket.off("channelDeleted", channelDeletedEvent);
      socket.off("kickedOrBanned", kickedOrBannedEvent);
    };
  });

  const channelDeletedEvent = async (channelId: number) => {
    // check if need to uncomment this part, I think no
    try {
      console.log("in channelDeletedEvent");
      await fetchUser(setChannelHeader, channelId, socket);
    } catch (errors) {
    }
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
    socket.on("messageBack", messageEvent);
    socket.on("changeConnexionState", changeConnexionStateEvent);
    return () => {
      socket.off("messageBack", messageEvent);
      socket.off("changeConnexionState", changeConnexionStateEvent);
    };
  });

  useEffect(() => {
    socket.on("addedToChannel", addedToChannelEvent);

    return () => {
      socket.off("addedToChannel", addedToChannelEvent);
    };
  }, [])

  const addedToChannelEvent = async () => {
    try {
      await fetchUser(setChannelHeader, userId, socket);
    } catch (error: any) {
      console.log(error);
    }
  }

  const messageEvent = (data: Message) => {
    console.log(data);
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
    const callFetchUser = async () => {
      try {
        await fetchUser(setChannelHeader, userId, socket);
      } catch (error) {
      }
    };
    callFetchUser();
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
        addUserToList={() => { }}
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
            if (previewLastMessage && channel.channelId === previewLastMessage?.channelId)
              channel.lastMsg = previewLastMessage.content;
            return (
              <MessageToClick
                channel={channel}
                key={index}
                isConnected={channel.isConnected}
                setChannelClicked={setChannelClicked}
              />
            );
          })
      )}
    </div>
  );
}
export default MessageSide;
