import React from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";

interface Message {
    newMessage: string;
    messageType: string;
}

function ContentMessage() {

    const [messages, setMessages] = useState<Message[]>([]);
    
    const addMessage = (newMessage: string, messageType: string): void =>{
        const message: Message = {
            newMessage,
            messageType,
        }
        setMessages([...messages, message]);
    }

    return (
        <div className="ContentMessage">
            <HeaderChatBox />
            <ChatView messages={messages} />
            <ChatPrompt addMessage={addMessage} />
        </div>
    )   
}

export default ContentMessage;
