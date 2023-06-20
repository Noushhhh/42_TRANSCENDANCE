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
  socket: any;
  channelId: number;
  simulatedUserId: number;
  setChannelId: React.Dispatch<React.SetStateAction<number>>;
}

function MessageSide( { setChannelId, simulatedUserId, channelId, socket }: MessageSideProps ) {

  const [channelHeader, setChannelHeader] = useState<Channel[]>([]);
  const fetchBoolean = useRef(false);

  useEffect(() => {
    if (fetchBoolean.current === false)
    {
      socket.on('message', function (id: any, data: Message) {
        setChannelHeader([]);
        fetchUser();
        console.log("booleaned");
      })
      const fetchUser = async () => {
        console.log("fetching data...");

      const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId/${simulatedUserId}`);
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
                channel={channel} 
                setChannelId={setChannelId}
                key={index}
                channelId={channelId}/>)
      })}
    </div>
  );
}

export default MessageSide;
