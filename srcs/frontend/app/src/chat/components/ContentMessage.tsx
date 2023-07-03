import React, { useEffect } from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";
import "../types/type.Message";

interface contentMessageProps{
    channelHeader: Channel[];
    socket: any;
    simulatedUserId: number;
    conversation: number;
    channelId: number;
    userId: number;
}

function ContentMessage( { channelHeader, conversation, channelId, simulatedUserId, socket, userId } : contentMessageProps) {

    // useState that represent all the messages inside the socket:
    const [messages, setMessages] = useState<Message[]>([]);

    const [channelInfo, setChannelInfo] = useState<boolean>(false);
    
    // each time the user change channel (click to a new one), we want to reset
    // all messages from the socket are they are now store in the database.
    useEffect(() => {
        setMessages([]);
    }, ([channelId]));

    const addMessage = (newMessage: Message, messageType: string): void =>{
        newMessage.messageType = messageType;
        setMessages([...messages, newMessage]);
    }

    return (
        <div className="ContentMessage">
            <HeaderChatBox channelInfo={channelInfo} setChannelInfo={setChannelInfo} channelHeader={channelHeader} channelId={channelId} />
            <ChatView isChannelInfoDisplay={channelInfo} userId={userId} conversation={conversation}  messages={messages} channelId={channelId}/>
            <ChatPrompt socket={socket} simulatedUserId={simulatedUserId} channelId={channelId} addMessage={addMessage} />
        </div>
    )   
}

export default ContentMessage;
