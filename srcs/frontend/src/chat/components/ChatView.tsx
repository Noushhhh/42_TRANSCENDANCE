import React, { useEffect, useState } from "react";
import "../styles/ChatView.css";
import MessageComponent from "./Message";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { fetchConversation } from "./ChannelUtils";
import { dividerClasses } from "@mui/material";

interface Message {
  id: number // id: 0
  senderId: number
  channelId: number
  content: string
  createdAt: Date
  messageType: string
}

interface ChatViewProps {
  isChannelInfoDisplay: boolean;
  messages: Message[];
  userId: number;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

function ChatView({ isChannelInfoDisplay, messages, userId, setMessages }: ChatViewProps): JSX.Element {

  const [conversationFetched, setConversationFetched] = useState<Message[]>([]);
  const channelId = useChannelIdContext();

  let widthChatView: string | null = isChannelInfoDisplay ? 'isDisplay' : 'isReduce';

  const addMsgToFetchedConversation = (message: Message) => {
    setConversationFetched(prevState => [...prevState, message]);
  }

  useEffect(() => {
    const callFetchConversation = async () => {  
      setConversationFetched([]);
      setMessages([]);
      if (channelId !== -1)
        await fetchConversation(userId, channelId, addMsgToFetchedConversation);
    }
    callFetchConversation();
  }, ([channelId]));

  if (channelId === -1)
    return (<div className="ChatViewContainer"></div>)

  return (
    <div className="ChatViewContainer">
      <div className={`ChatView ${widthChatView}`}>
        {conversationFetched.map((message: Message, index: number) => {
          return (
            <MessageComponent
              key={index}
              contentMessage={message.content}
              messageType={message.messageType}
              channelId={channelId}
              isChannelInfo={isChannelInfoDisplay}
            />
          );
        })}
        {messages.map((message, index) => {
          return (
            <MessageComponent
              key={index}
              contentMessage={message.content}
              messageType={message.messageType}
              channelId={channelId}
              isChannelInfo={isChannelInfoDisplay}
            />
          )
        })}
      </div>
      {/* <ChannelInfo isChannelInfoDisplay={isChannelInfoDisplay} /> */}
    </div>
  );
} export default ChatView;