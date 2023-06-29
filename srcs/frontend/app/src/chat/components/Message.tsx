import React from "react";
import "../styles/Message.css";

interface MonComposantProps {
    contentMessage: string;
    messageType: string;
    channelId: number;
}

function MessageComponent(props: MonComposantProps) {

    const updatedClassName = `${props.messageType}`;
    const updatedClassNameContainer = props.messageType + "Container";
    
    return (
        <div className={`Message Date ${updatedClassNameContainer}`}>
            <p className={`MessageComposant DateComposant ${updatedClassName}`}>{props.channelId}{props.contentMessage}</p>
        </div>
    )
}

export default MessageComponent;