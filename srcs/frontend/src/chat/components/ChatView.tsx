import React, { useEffect, useState, useRef } from "react";
import "../styles/ChatView.css";
import MessageComponent from "./Message";
import { useChannelIdContext, useSetChannelIdContext } from "../contexts/channelIdContext";
import { fetchConversation } from "./ChannelUtils";
import "../types/type.Message";
import { useSocketContext } from "../contexts/socketContext";
import { Socket } from "socket.io-client";
import { fetchUser } from "./ChannelUtils";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";

interface ChatViewProps {
  isChannelInfoDisplay: boolean;
  messages: Message[];
  userId: number;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

function ChatView({ isChannelInfoDisplay, messages, userId, setMessages }: ChatViewProps): JSX.Element {

  const [conversationFetched, setConversationFetched] = useState<Message[]>([]);
  const anchorRef = useRef<HTMLDivElement>(null);

  let widthChatView: string | null = isChannelInfoDisplay ? 'isDisplay' : 'isReduce';

  const socket: Socket = useSocketContext();
  const setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>> = useSetChannelHeaderContext();
  const setChannelId = useSetChannelIdContext();
  const channelId: number = useChannelIdContext();

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

  const kickedOrBannedEvent = async (bannedFromChannelId: number) => {
    console.log("here before");
    console.log(channelId);
    console.log(bannedFromChannelId);
    try {
      await fetchUser(setChannelHeader, userId, socket);
      console.log("after fetch");
    } catch (error) {
      console.log(error);
    }
    console.log(channelId);
    console.log(bannedFromChannelId);
    if (bannedFromChannelId === channelId){
      console.log("set channelId to -1 !!!!");
      setChannelId(-1);
    }
  }

  useEffect(() => {
    socket.on("kickedOrBanned", kickedOrBannedEvent);
    return () => {
      socket.off("kickedOrBanned", kickedOrBannedEvent);
    };
  });

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
