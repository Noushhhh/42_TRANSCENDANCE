import React, { useEffect } from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";
import "../types/type.Message";
import { useUserIdContext } from "../contexts/userIdContext";
import { useChannelIdContext } from "../contexts/channelIdContext";

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
  const channelId: number = useChannelIdContext();

  const contentMessageWidth: string = channelInfo ? "reduce" : "wide";

  const addMessage = async (newMessage: Message, messageType: string) => {
    newMessage.messageType = messageType;
    console.log(channelId);
    console.log(newMessage.channelId);
    setMessages((prevMessage) => [...prevMessage, newMessage]);
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
