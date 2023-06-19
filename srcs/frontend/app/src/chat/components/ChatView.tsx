import React from "react";
import "../styles/ChatView.css";
import Message from "./Message";

interface MonComposantProps {
    messages: Array<{
      newMessage: string;
      messageType: string;
    }>;
  }

function ChatView(props: MonComposantProps): JSX.Element {

    const { messages } = props;

    return (
        <div className="ChatView">
            {messages.map((message, index) => (
                <Message key={index} contentMessage={message.newMessage} messageType={message.messageType}/>
            ))}
        </div>
    )   
}

export default ChatView;