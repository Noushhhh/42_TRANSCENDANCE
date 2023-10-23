import React from "react";
import "../styles/Message.css";



interface MonComposantProps {
    contentMessage: string;
    messageType: string;
    channelId: number;
    isChannelInfo: boolean;
}

function MessageComponent(props: MonComposantProps) {

    const updatedClassName = `${props.messageType}`;
    const updatedClassNameContainer = props.messageType + "Container";
    const messageWidth: string = props.isChannelInfo ? 'reduceMsgWidth' : 'wideMsgWidth';

    return (
        <div className={`Message Date ${updatedClassNameContainer}`}>
            <p className={`MessageComposant DateComposant ${updatedClassName} ${messageWidth}`}>
                {props.contentMessage}
            </p>
        </div>
    )
}

export default MessageComponent;