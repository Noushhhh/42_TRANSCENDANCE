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

interface MessageSideProps {
  setChannelClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

function MessageSide({ setChannelClicked }: MessageSideProps) {
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
  const userId: number = useUserIdContext();
  const socket: Socket = useSocketContext();
  const channelHeader = useChannelHeaderContext();
  const setChannelHeader = useSetChannelHeaderContext();

  const setStateMessageToFalse = () => {
    setStateMessageToClick([false, false]);
  };

/*  useEffect(() => {
    socket.on("channelDeleted", channelDeletedEvent);
    return () => {
      socket.off("channelDeleted", channelDeletedEvent);
    };
  });*/

 const channelDeletedEvent = async (channelId: number) => {
  // check if need to uncomment this part, I think no
  /*try {
    await leaveChannel(userId, channelId, setChannelHeader, socket);
  } catch (errors) {

  }*/
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

  const messageEvent = (data: Message) => {
    if (!data) return;
    setPreviewLastMessage(data);
    const foundChannel = findChannelById(data.channelId);
    if (!foundChannel) return;
    foundChannel.dateLastMsg = data.createdAt;
  };

  const changeConnexionStateEvent = () => {
    needReload === false ? setNeedReload(true) : setNeedReload(false);
  };

  useEffect( () => {
    const callFetchUser = async () => {
      try {
        console.log("begining fetching users");
        await fetchUser(setChannelHeader, userId, socket);
        console.log("end fetching users");
      } catch (error) {
        console.log("error fetching users");
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
                setChannelClicked={setChannelClicked}
              />
            );
          })
      )}
    </div>
  );
}

export default MessageSide;
