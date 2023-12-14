import React, { useEffect } from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";
import "../types/type.Message";
import { useUserIdContext } from "../contexts/userIdContext";
import "../types/type.Message";


interface contentMessageProps {
  channelInfo: boolean;
  setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
  backToChannels: () => void;
  setPreviewLastMessage: React.Dispatch<React.SetStateAction<Message | undefined>>;
}

function ContentMessage({
  channelInfo,
  setChannelInfo,
  backToChannels,
  setPreviewLastMessage
}: contentMessageProps) {
  // useState that represent all the messages inside the socket:
  const [messages, setMessages] = useState<Message[]>([]);

  const userId: number = useUserIdContext();

  const contentMessageWidth: string = channelInfo ? "reduce" : "wide";

  const addMessage = async (newMessage: Message, messageType: string) => {
    newMessage.messageType = messageType;
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
      <ChatPrompt addMessage={addMessage} setPreviewLastMessage={setPreviewLastMessage}/>
    </div>
  );
}

export default ContentMessage;
