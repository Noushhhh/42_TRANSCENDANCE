import React, { useEffect } from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";
import "../types/type.Message";
import { ChannelIdContext, useChannelIdContext } from "../contexts/channelIdContext";
import { useSocketContext } from "../contexts/socketContext";

interface contentMessageProps{
    channelInfo: boolean;
    setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
    simulatedUserId: number;
    userId: number;
}

function ContentMessage( { channelInfo, setChannelInfo, simulatedUserId, userId } : contentMessageProps) {

    // useState that represent all the messages inside the socket:
    const [messages, setMessages] = useState<Message[]>([]);
    
    const channelId = useChannelIdContext;
    const socket = useSocketContext();

    // const [channelInfo, setChannelInfo] = useState<boolean>(false);
    
    // each time the user change channel (click to a new one), we want to reset
    // all messages from the socket are they are now store in the database.
    useEffect(() => {
        console.log("set to empty array");
        setMessages([]);
    }, ([channelId]));

    const addMessage = (newMessage: Message, messageType: string): void =>{
        newMessage.messageType = messageType;
        setMessages([...messages, newMessage]);
    }

    return (
        <div className="ContentMessage">
            <HeaderChatBox channelInfo={channelInfo} setChannelInfo={setChannelInfo} />
            <ChatView isChannelInfoDisplay={channelInfo} userId={userId} messages={messages} />
            <ChatPrompt simulatedUserId={simulatedUserId} addMessage={addMessage} />
        </div>
    )   
}

export default ContentMessage;
