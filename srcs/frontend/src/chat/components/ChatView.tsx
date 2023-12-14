import React, { useEffect, useState, useRef } from "react";
import "../styles/ChatView.css";
import MessageComponent from "./Message";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { fetchConversation } from "./ChannelUtils";
import { dividerClasses } from "@mui/material";
import "../types/type.Message";

interface ChatViewProps {
  isChannelInfoDisplay: boolean;
  messages: Message[];
  userId: number;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

function ChatView({ isChannelInfoDisplay, messages, userId, setMessages }: ChatViewProps): JSX.Element {

  const [conversationFetched, setConversationFetched] = useState<Message[]>([]);
  const anchorRef = useRef<HTMLDivElement>(null);
  const channelId = useChannelIdContext();

  let widthChatView: string | null = isChannelInfoDisplay ? 'isDisplay' : 'isReduce';
  
  const addMsgToFetchedConversation = (message: Message) => {
    setConversationFetched(prevState => [...prevState, message]);
  }
  
  const scrollToBottom = () => {
    if (anchorRef.current) {
      anchorRef.current.scrollIntoView({ behavior: 'smooth', block:'end' });
    }
  };

  useEffect(() => {
    const callFetchConversation = async () => {
      setConversationFetched([]);
      setMessages([]);
      try {
        if (channelId !== -1){
          await fetchConversation(userId, channelId, addMsgToFetchedConversation);
          setTimeout(() => {
            scrollToBottom();
          }, 950);
        }
      } catch (error) {
        console.log('error while fetching conv');
      }
    }
    callFetchConversation();
  }, ([channelId]));


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
              senderId={message.senderId}
              isChannelInfo={isChannelInfoDisplay}
            />
          );
        })}
        {messages
          .filter(message => message.channelId === channelId)
          .map((message, index) => (
            <MessageComponent
              key={index}
              contentMessage={message.content}
              messageType={message.messageType}
              channelId={channelId}
              senderId={message.senderId}
              isChannelInfo={isChannelInfoDisplay}
            />
  ))}
      <div className="anchor-autoscroll" style={{height:'1px'}} ref={anchorRef}></div>
      </div>
    </div>
  );
} export default ChatView;
