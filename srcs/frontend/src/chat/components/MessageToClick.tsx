import React from "react";
import "../styles/MessageToClick.css";
import TimeElapsed from "./TimeElapsed";
import IsConnected from "./isConnected";
import { useSetChannelIdContext } from "../contexts/channelIdContext";

interface Channel {
    name: string,
    lastMsg : string,
    dateLastMsg: Date | null,
    channelId: number;
}

interface MessageToClickProps{
    channel: Channel;
    isConnected: boolean;
}

function MessageToClick({channel, isConnected }: MessageToClickProps) {

    const setChannelId = useSetChannelIdContext();

    let dateObject: Date | null;

    if (channel.dateLastMsg)
        dateObject = new Date(channel.dateLastMsg);
    else
        dateObject = null;

    const handleClick = () => {
        setChannelId(channel.channelId);
    }

    if (channel.channelId === -1)
        return null;

    return (
        <div onClick={handleClick} className="MessageToClick">
            <IsConnected isConnected={isConnected} />
            <div className="ContainerPreview">
                <div className="MessageToClickTitle">
                    <p className="senderName">{channel.name}</p>
                    <p className="dateMessage">{<TimeElapsed date={dateObject} />}</p>
                </div>
                <div className="ContentMessageTitle">
                    <p className="PreviewMessage">{channel.lastMsg}</p>
                </div>
            </div>
        </div>
    )   
}

export default MessageToClick;