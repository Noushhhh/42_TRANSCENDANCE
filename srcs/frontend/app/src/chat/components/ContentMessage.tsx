import React, { useEffect } from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";
import "../types/type.Message";

interface contentMessageProps{
    socket: any;
    simulatedUserId: number;
    conversation: number;
    channelId: number;
    userId: number;
}

function ContentMessage({conversation, channelId, simulatedUserId, socket, userId }: contentMessageProps) {

    const [messages, setMessages] = useState<Message[]>([]);

    // each time the user change channel, we want to reset
    // all messages are they are now store in the database
    useEffect(() => {
        setMessages([]);
    }, ([channelId]));
    
    const addMessage = (newMessage: Message, messageType: string): void =>{
        newMessage.messageType = messageType;
        setMessages([...messages, newMessage]);
    }

    return (
        <div className="ContentMessage">
            <HeaderChatBox />
            <ChatView userId={userId} conversation={conversation}  messages={messages} channelId={channelId}/>
            <ChatPrompt socket={socket} simulatedUserId={simulatedUserId} channelId={channelId} addMessage={addMessage} />
        </div>
    )   
}

export default ContentMessage;
