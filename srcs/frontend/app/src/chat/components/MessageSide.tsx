import React, { useEffect, useState, useRef } from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import "../styles/SearchBar.css";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateChannelPopup from "./CreateChannelPopup";
import "../types/channel.type";

interface isChannelNameConnected{
  isConnected: boolean;
  name: string;
}

interface MessageSideProps {
  channelHeader: Channel[];
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>;
  socket: any;
  channelId: number;
  simulatedUserId: number;
  setChannelId: React.Dispatch<React.SetStateAction<number>>;
}

function MessageSide({ channelHeader, setChannelHeader, setChannelId, simulatedUserId, channelId, socket }: MessageSideProps) {

  const [previewLastMessage, setPreviewLastMessage] = useState<Message>();
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [displayResults, setDisplayResults] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [displayPopupChannelCreation, setdisplayPopupChannelCreation] = useState<boolean>(false);
  const fetchBoolean = useRef(false);

  const displayState = `${displayPopupChannelCreation ? "showPopup" : "hidePopup"}`;

  const handleClick = () => {
      displayPopupChannelCreation === false ? setdisplayPopupChannelCreation(true) : setdisplayPopupChannelCreation(false);
  }

  function findChannelById(channelId: number): Channel | undefined {
    return channelHeader.find((channel) => channel.channelId === channelId);
  }

  function isUserConnected(userId: number): Promise<boolean> {
    return new Promise((resolve) => {
      socket.emit('isUserConnected', userId, (response: boolean) => {
        resolve(response);
      });
    });
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

  const setHeaderNameWhenTwoUsers = async (channelId: string): Promise<isChannelNameConnected> => {
    const channelInfo: isChannelNameConnected = {
      name: '',
      isConnected: false,
    };
  
    const response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId/${channelId}`);
    const users: User[] = await response.json();
    //if (!users)
    //  return "fetch error";
    var userIndex: number = -1;
  
    simulatedUserId === users[0].id ? userIndex = 1 : userIndex = 0;

    console.log(userIndex);
  
    await isUserConnected(users[userIndex].id)
    .then((response: boolean) => {
      channelInfo.isConnected = response;
    })
    .catch((error) => {
      // Gérer les erreurs, si nécessaire
    });
    channelInfo.name = users[userIndex].username;
    return channelInfo;
  }

  socket.on("changeConnexionState", () => {
    needReload == false ? setNeedReload(true) : setNeedReload(false);
  })

  const dummyFunction = () => {};

  const fetchUser = async () => {
    setChannelHeader([]);

    const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId/${simulatedUserId}`);
    const listChannelId = await response.json();

    const fetchChannelHeaders = listChannelId.map(async (id: string) => {
      const response = await fetch(`http://localhost:4000/api/chat/getChannelHeader/${id}`);
      const header: Channel = await response.json();

      let channelInfo: isChannelNameConnected = {
        name: '',
        isConnected: false,
      };

      if (header.name === '') {
        channelInfo = await setHeaderNameWhenTwoUsers(id);
        header.name = channelInfo.name;
      }
      header.isConnected = channelInfo.isConnected;

      return header;
    });
    const channelHeaders = await Promise.all(fetchChannelHeaders);
    setChannelHeader(channelHeaders);
  };

  useEffect(() => {
    fetchUser();
    return () => {
      fetchBoolean.current = true;
    };
  }, [needReload]);

  return (
    <div className="MessageSide">
      <div className="containerSearchBar">
        <AddCircleOutlineIcon onClick={handleClick} className="createChannel"/>
        <CreateChannelPopup fetchUser={fetchUser} simulatedUserId={simulatedUserId} displayState={displayState} />
        <SearchBar setDisplayResults={setDisplayResults} setInputValue={setInputValue} inputValue={inputValue} />
      </div>
      <SearchBarResults inputValue={inputValue} displayResults={displayResults} showUserMenu={true} addUserToList={dummyFunction}/>
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
              setChannelId={setChannelId}
              key={index}
              channelId={channelId}
              socket={socket}
              isConnected={channel.isConnected}
            />
          );
        })}
    </div>
  );
}

export default MessageSide;
