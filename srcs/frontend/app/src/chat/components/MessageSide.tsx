import React, { useEffect, useState, useRef } from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";

interface Channel{
  name: string,
  lastMsg : string,
  dateLastMsg: Date,
  channelId: number,
}

interface MessageSideProps {
  onSelectConversation: React.Dispatch<React.SetStateAction<number>>;
  setChannelId: React.Dispatch<React.SetStateAction<number>>;
}

function MessageSide( {onSelectConversation, setChannelId}: MessageSideProps ) {

  const [channelHeader, setChannelHeader] = useState<Channel[]>([]);
  const fetchBoolean = useRef(false);

  useEffect(() => {
    if (fetchBoolean.current === false)
    {
      const fetchUser = async () => {
      const userId = '123'; // Remplacez par l'ID de l'utilisateur que vous souhaitez récupérer
        
      const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId/1`);
      const listChannelId = await response.json();

      listChannelId.map(async (id: string) => {
        const response = await fetch(`http://localhost:4000/api/chat/getChannelHeader/${id}`);
        const header: Channel = await response.json();
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
      {channelHeader.map((channel, index) => {
        return (<MessageToClick 
                onSelectConversation={onSelectConversation} 
                channel={channel} 
                setChannelId={setChannelId} 
                key={index}/>)
      })}
    </div>
  );
}

export default MessageSide;
