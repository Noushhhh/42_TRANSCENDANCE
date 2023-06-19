import React from "react";
import "../styles/ChatView.css";
import Message from "./Message";

interface MonComposantProps {
    messages: Array<{
      newMessage: string;
      messageType: string;
    }>;
    conversation: number;
    channelId: number;
  }

function ChatView({messages, conversation, channelId}: MonComposantProps): JSX.Element {

    return (
        <div className="ChatView">
            {messages.map((message, index) => (
                <Message 
                key={index} 
                contentMessage={message.newMessage} 
                messageType={message.messageType}
                conversation={conversation}
                channelId={channelId}/>
            ))}
        </div>
    )   
}

export default ChatView;