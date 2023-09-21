import React, { useEffect } from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";
import "../types/type.Message";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";

interface Message {
  id: number
  senderId: number
  channelId: number
  content: string
  createdAt: Date
  messageType: string
}

interface contentMessageProps{
    channelInfo: boolean;
    setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

function ContentMessage( { channelInfo, setChannelInfo } : contentMessageProps) {

    // useState that represent all the messages inside the socket:
    const [messages, setMessages] = useState<Message[]>([]);
    
    const userId: number = useUserIdContext();

    const contentMessageWidth: string = channelInfo ? 'reduce' : 'wide';

    const addMessage = (newMessage: Message, messageType: string): void =>{
        console.log(newMessage);
        newMessage.messageType = messageType;
        setMessages([...messages, newMessage]);
    }

    return (
        <div className={`ContentMessage ${contentMessageWidth}`}>
            <HeaderChatBox channelInfo={channelInfo} setChannelInfo={setChannelInfo}/>
            <ChatView isChannelInfoDisplay={channelInfo} userId={userId} messages={messages} setMessages={setMessages}/>
            <ChatPrompt simulatedUserId={userId} addMessage={addMessage} />
        </div>
    )   
}

export default ContentMessage;
