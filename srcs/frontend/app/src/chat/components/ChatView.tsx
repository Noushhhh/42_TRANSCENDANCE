import React, { useEffect, useState } from "react";
import "../styles/ChatView.css";
import Message from "./Message";

interface MonComposantProps {
    messageType: string;
    messages: string[];
}

function ChatView() {

    // const [message, setMessage] = useState([
    //         { ContentMessage:"Ceci est un super message", MessageType:"MessageTo"},
    //         {ContentMessage:"Ceci est un super message", MessageType:"MessageTo"},
    //         {ContentMessage:"Ceci est un super message", MessageType:"MessageFrom"}
    //     ]);

    // const message1: string = "ceci est le contenu de mon message";
    // const date: string = "24/06/2022";

    // const dateType: string = "date";
    // const messageToType: string = "MessageTo";
    // const messageFromType: string = "MessageFrom";

    const [messages, setMessages] = useState<string[]>([]);

    const handleSendMessage = (message: string) => {
      setMessages([...messages, message]);
    };

    return (
        <div className="ChatView">
          {messages.map((message) => {
            console.log('test');
            return <Message contentMessage={message} messageType="MessageTo"/>; // Remplacez "Message" par le contenu souhaité
          })}
        </div>
    );
}

export default ChatView;