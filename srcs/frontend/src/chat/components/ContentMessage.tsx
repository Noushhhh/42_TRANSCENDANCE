import React, { useEffect } from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";
import "../types/type.Message";
import { useUserIdContext } from "../contexts/userIdContext";
import { getBlockedUsersById } from "./ChannelUtils";

interface Message {
  id: number;
  senderId: number;
  channelId: number;
  content: string;
  createdAt: Date;
  messageType: string;
}

interface contentMessageProps {
  channelInfo: boolean;
  setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
  backToChannels: () => void;
}

function ContentMessage({
  channelInfo,
  setChannelInfo,
  backToChannels,
}: contentMessageProps) {
  // useState that represent all the messages inside the socket:
  const [messages, setMessages] = useState<Message[]>([]);

  const userId: number = useUserIdContext();

  const contentMessageWidth: string = channelInfo ? "reduce" : "wide";

  const addMessage = async (newMessage: Message, messageType: string) => {
    console.log(newMessage);
    newMessage.messageType = messageType;
    // const blockedUsers: number[] = await getBlockedUsersById(userId);
    // if (blockedUsers.some(id => id === newMessage.senderId)){
    //     return ;
    // }
    setMessages([...messages, newMessage]);
  };

  return (
    <div className={`ContentMessage ${contentMessageWidth}`}>
      <HeaderChatBox
        channelInfo={channelInfo}
        setChannelInfo={setChannelInfo}
        backToChannels={backToChannels}
      />
      <ChatView
        isChannelInfoDisplay={channelInfo}
        userId={userId}
        messages={messages}
        setMessages={setMessages}
      />
      <ChatPrompt addMessage={addMessage} />
    </div>
  );
}

export default ContentMessage;
