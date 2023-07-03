import React, { useEffect, useRef, useState } from "react";
import "../styles/ChatView.css";
import MessageComponent from "./Message";
import ChannelInfo from "./ChannelInfo";

interface Message {
  id: number
  senderId: number
  channelId: number
  content: string
  createdAt: Date
  messageType: string
}

interface MonComposantProps {
  isChannelInfoDisplay: boolean;
  messages: Message[];
  conversation: number;
  channelId: number;
  userId: number;
}

function ChatView({ isChannelInfoDisplay, messages, conversation, channelId, userId }: MonComposantProps): JSX.Element {

  const [conversationFetched, setConversationFetched] = useState<Message[]>([]);
  let widthChatView: string | null = isChannelInfoDisplay ? 'isDisplay' : 'isReduce';

  const addMsgToFetchedConversation = (message: Message) => {
    setConversationFetched(prevState => [...prevState, message]);
  }

  useEffect(() => {
    setConversationFetched([]);
    const fetchConversation = async () => {
      const response = await fetch(`http://localhost:4000/api/chat/getAllMessagesByChannelId/${channelId}`);
      const messageList = await response.json();
      console.log("messagelist === ");
      console.log(messageList);
      messageList.map((message: Message) => {
        userId === message.senderId ? message.messageType = "MessageTo" : message.messageType = "MessageFrom";
        addMsgToFetchedConversation(message)
      })
    }
    fetchConversation();
  }, ([channelId]));

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
            />
          )
        })}
      </div>
      <ChannelInfo isChannelInfoDisplay={isChannelInfoDisplay} />
    </div>
  );
} export default ChatView;