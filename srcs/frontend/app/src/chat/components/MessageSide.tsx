import React, { useEffect, useState, useRef } from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";

interface Channel {
  name: string;
  lastMsg: string;
  dateLastMsg: Date;
  channelId: number;
  isConnected: boolean;
}

interface isChannelNameConnected{
  isConnected: boolean;
  name: string;
}

interface MessageSideProps {
  socket: any;
  channelId: number;
  simulatedUserId: number;
  setChannelId: React.Dispatch<React.SetStateAction<number>>;
}

function MessageSide({ setChannelId, simulatedUserId, channelId, socket }: MessageSideProps) {

  const [channelHeader, setChannelHeader] = useState<Channel[]>([]);
  const [previewLastMessage, setPreviewLastMessage] = useState<Message>();
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [displayResults, setDisplayResults] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const fetchBoolean = useRef(false);

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

  const setHeaderNameWhenTwoUsers = async (channelId: string, channel: Channel): Promise<isChannelNameConnected> => {
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

  useEffect(() => {
  
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
          channelInfo = await setHeaderNameWhenTwoUsers(id, header);
          header.name = channelInfo.name;
        }
        header.isConnected = channelInfo.isConnected;
  
        return header;
      });
      const channelHeaders = await Promise.all(fetchChannelHeaders);
      setChannelHeader(channelHeaders);
    };
    fetchUser();
  
    return () => {
      fetchBoolean.current = true;
    };
  }, [needReload]);

  return (
    <div className="MessageSide">
      <SearchBar setDisplayResults={setDisplayResults} setInputValue={setInputValue} inputValue={inputValue} />
      <SearchBarResults inputValue={inputValue} displayResults={displayResults}/>
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
