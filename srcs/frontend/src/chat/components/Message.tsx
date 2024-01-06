import React, { useState, useEffect } from "react";
import "../styles/Message.css";
import { getUsername } from "./ChannelUtils";

interface MessageComponentProps {
    contentMessage: string;
    messageType: string;
    channelId: number;
    senderId: number;
    isChannelInfo: boolean;
}

function MessageComponent(props: MessageComponentProps) {

    const [senderUsername, setSenderUsername] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const username: string = await getUsername(props.senderId);
                setSenderUsername(username);
            } catch (errors: any){
                setError(errors.message); // notify user of this error ? display something ?
                console.log(error)
            }
        }
        fetchUsername();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const updatedClassName = `${props.messageType}`;
    const updatedClassNameContainer = props.messageType + "Container";
    const messageWidth: string = props.isChannelInfo ? 'reduceMsgWidth' : 'wideMsgWidth';

    return (
        <div className={`Message Date ${updatedClassNameContainer}`}>
            <p className={`MessageComposant DateComposant ${updatedClassName} ${messageWidth}`}>
                <span className="usernameSentMessage">{senderUsername ? senderUsername : null}</span>
                {props.contentMessage}
            </p>
        </div>
    )
}

export default MessageComponent;