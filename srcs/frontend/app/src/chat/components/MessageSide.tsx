import React, { useEffect, useState, useRef } from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";

interface Channel {
  name: string;
  lastMsg: string;
  dateLastMsg: Date;
  channelId: number;
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
  const fetchBoolean = useRef(false);

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

  const setHeaderNameWhenTwoUsers = async (channelId: string): Promise<string> => {
    const response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId/${channelId}`);
    const users: User[] = await response.json();
    if (!users)
      return "fetch error";
    if (simulatedUserId === users[0].id)
      return users[1].username
    return users[0].username;
  }

  useEffect(() => {
    if (fetchBoolean.current === false) {
      const fetchUser = async () => {

        const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId/${simulatedUserId}`);
        const listChannelId = await response.json();

        listChannelId.map(async (id: string) => {
          const response = await fetch(`http://localhost:4000/api/chat/getChannelHeader/${id}`);
          const header: Channel = await response.json();
          if (header.name === "")
            header.name = await setHeaderNameWhenTwoUsers(id);
          setChannelHeader(prevState => [...prevState, header]);
        })
      }
      fetchUser();

      return () => {
        fetchBoolean.current = true;
      }
    }
  }, []);

  return (
    <div className="MessageSide">
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
            />
          );
        })}
    </div>
  );
}

export default MessageSide;
