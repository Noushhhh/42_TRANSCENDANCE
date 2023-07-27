import React, { useEffect, useState, useRef } from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import "../styles/SearchBar.css";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateChannelPopup from "./CreateChannelPopup";
import "../types/channel.type";
import { useChannelHeaderContext, useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { fetchUser } from "./ChannelUtils"
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useSocketContext } from "../contexts/socketContext";

interface MessageSideProps {
  simulatedUserId: number;
}

function MessageSide({ simulatedUserId }: MessageSideProps) {

  const [previewLastMessage, setPreviewLastMessage] = useState<Message>();
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [displayResults, setDisplayResults] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [displayPopupChannelCreation, setdisplayPopupChannelCreation] = useState<boolean>(false);
  const fetchBoolean = useRef(false);

  const socket = useSocketContext();

  const channelId = useChannelIdContext();

  const channelHeader = useChannelHeaderContext();
  const setChannelHeader = useSetChannelHeaderContext();

  const displayState = `${displayPopupChannelCreation ? "showPopup" : "hidePopup"}`;

  const handleClick = () => {
    displayPopupChannelCreation === false ? setdisplayPopupChannelCreation(true) : setdisplayPopupChannelCreation(false);
  }

  function findChannelById(channelId: number): Channel | undefined {
    return channelHeader.find((channel) => channel.channelId === channelId);
  }

  socket.on('message', function (id: any, data: Message) {
    if (!data)
      return;
    setPreviewLastMessage(data);
    const foundChannel = findChannelById(data.channelId);
    if (!foundChannel)
      return;
    foundChannel.dateLastMsg = data.createdAt;
  })

  socket.on("changeConnexionState", () => {
    needReload == false ? setNeedReload(true) : setNeedReload(false);
  })

  const dummyFunction = () => { };

  useEffect(() => {
    fetchUser(setChannelHeader, simulatedUserId, socket);
    return () => {
      fetchBoolean.current = true;
    };
  }, [needReload]);

  return (
    <div className="MessageSide">
      <div className="containerSearchBar">
        <AddCircleOutlineIcon onClick={handleClick} className="createChannel" />
        <CreateChannelPopup simulatedUserId={simulatedUserId} displayState={displayState} />
        <SearchBar setDisplayResults={setDisplayResults} setInputValue={setInputValue} inputValue={inputValue} />
      </div>
      <SearchBarResults inputValue={inputValue} displayResults={displayResults} showUserMenu={true} addUserToList={dummyFunction} simulatedUserId={simulatedUserId} />
      {channelHeader
        .sort((a, b) => {
          const dateA = new Date(a.dateLastMsg);
          const dateB = new Date(b.dateLastMsg);
          return dateB.getTime() - dateA.getTime();
        })
        .map((channel, index) => {
          if (channel.channelId === previewLastMessage?.channelId)
            channel.lastMsg = previewLastMessage.content;
          return (
            <MessageToClick
              channel={channel}
              key={index}
              isConnected={channel.isConnected}
            />
          );
        })}
    </div>
  );
}

export default MessageSide;
