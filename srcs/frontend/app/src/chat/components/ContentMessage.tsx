import React from "react";
import "../styles/ContentMessage.css";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";
import { useState } from "react";

function ContentMessage() {

    const [messages, setMessages] = useState<string[]>([]);

    const sendMessage = (message: string) => {
      setMessages([...messages, message]);
      console.log(`Nouveau message : ${message}`);
    };
  
    return (
        <div className="ContentMessage">
            <HeaderChatBox />
            <ChatView />
            <ChatPrompt sendMessage={sendMessage}/>
        </div>
    )   
}

export default ContentMessage;