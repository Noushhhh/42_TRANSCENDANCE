import React from "react";
import "../styles/Message.css";

interface MonComposantProps {
    contentMessage: string;
    messageType: string;
}

function Message(props: MonComposantProps) {
    
    const updatedClassName = `${props.messageType}`;
    const updatedClassNameContainer = props.messageType + "Container";    
    
    return (
        <div className={`Message Date ${updatedClassNameContainer}`}>
            <p className={`MessageComposant DateComposant ${updatedClassName}`}>{props.contentMessage}</p>
        </div>
    )
}

export default Message;