import React, { useEffect, useState } from "react";
import "../styles/ChatView.css";
import MessageComponent from "./Message";
import { useChannelIdContext } from "../contexts/channelIdContext";

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
    setConversationFetched([]);
    setMessages([]);
    const fetchConversation = async () => {
      if (channelId !== -1){
        const response = await fetch(`http://localhost:4000/api/chat/getAllMessagesByChannelId/${channelId}`);
        const messageList = await response.json();
        messageList.map((message: Message) => {
          userId === message.senderId ? message.messageType = "MessageTo" : message.messageType = "MessageFrom";
          addMsgToFetchedConversation(message)
        })
      }
    }
    fetchConversation();
  }, ([channelId]));

  // console.log("fetched=");
  // console.log(conversationFetched);
  // console.log('socket =');
  // console.log(messages);

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