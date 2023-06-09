import React, { useEffect, useRef, useState } from "react";
import "../styles/ChatView.css";
import MessageComponent from "./Message";
//import Message from "../../../../../backend/node_modules/prisma/prisma-client";

interface Message {
  id: number
  senderId: number
  channelId: number
  content: string
  createdAt: Date
  messageType: string
}

interface MonComposantProps {
  messages: Message[];
  conversation: number;
  channelId: number;
  userId: number;
}

function ChatView({ messages, conversation, channelId, userId }: MonComposantProps): JSX.Element {

  const [conversationFetched, setConversationFetched] = useState<Message[]>([]);
  const fetchBoolean = useRef(false);
  const chatView = useRef<HTMLDivElement>(null);

  const addMsgToFetchedConversation = (message: Message) => {
    setConversationFetched(prevState => [...prevState, message]);
  }

  if (chatView.current) {
    chatView.current.scrollTop = chatView.current.scrollHeight;
  }

  useEffect(() => {
    setConversationFetched([]);
    const fetchConversation = async () => {
      const response = await fetch(`http://localhost:4000/api/chat/getAllMessagesByChannelId/${channelId}`);
      const messageList = await response.json();
      messageList.map((message: Message) => {
        userId === message.senderId ? message.messageType = "MessageTo" : message.messageType = "MessageFrom";
        addMsgToFetchedConversation(message)
      })
    }
    fetchConversation();
  }, ([channelId]));

  return (
    <div className="ChatView" ref={chatView}>
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
  );
} export default ChatView;