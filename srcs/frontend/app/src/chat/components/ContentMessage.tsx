import React from "react";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";
import "../styles/ContentMessage.css";


function ContentMessage() {

    const [messages, setMessages] = useState<string[]>([]);

    const addMessage = (newMessage: string): void =>{
        setMessages([...messages, newMessage]);
    }

    return (
        <div className="ContentMessage">
            <HeaderChatBox />
            <ChatView messages={messages}/>
            <ChatPrompt addMessage={addMessage}/>
        </div>
    )   
}

export default ContentMessage;

// declarer un useState dans le composant parent
// declarer un setter dans le composant parent
// passer le setter au composant prompt
// utiliser le setter dans le composant prompt afin de passer la donnée au parents
// renvoyer la donnée du parent au composant qui render les messages