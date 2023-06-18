import React, { useEffect, useState } from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";

interface Channel{
  name: string,
  lastMsg : string,
  dateLastMsg: Date,
}

function MessageSide() {
  const [channelId, setChannelsIds] = useState<string[]>([]);
  const [channelHeader, setChannelHeader] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = '123'; // Remplacez par l'ID de l'utilisateur que vous souhaitez récupérer

      const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId/1`);
      const listChannelIdHeader = await response.json();

      setChannelsIds(prevState => [...prevState, ...listChannelIdHeader]);      // console.log(channelId);

      listChannelIdHeader.map(async (id: string) => {
        const response = await fetch(`http://localhost:4000/api/chat/getChannelHeader/${id}`);
        const header = await response.json();
        typeof(header.dateLastMsg);
        setChannelHeader(prevState => [...prevState, header]);})
    };

    fetchUser();
  }, []);

  return (
    <div className="MessageSide">
      {channelHeader.map((channel, index) => {
        return (<MessageToClick channel={channel} key={index}/>)
      })}
    </div>
  );
}

export default MessageSide;
