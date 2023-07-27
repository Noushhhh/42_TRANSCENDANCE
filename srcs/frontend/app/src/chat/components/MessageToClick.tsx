import React, { useState } from "react";
import "../styles/MessageToClick.css";
import TimeElapsed from "./TimeElapsed";
import IsConnected from "./isConnected";
import { useChannelIdContext, useSetChannelIdContext } from "../contexts/channelIdContext";

interface Channel {
    name: string,
    lastMsg : string,
    dateLastMsg: Date,
    channelId: number;
}

interface MessageToClickProps{
    channel: Channel;
    isConnected: boolean;
}

function MessageToClick({channel, isConnected }: MessageToClickProps) {

    const setChannelId = useSetChannelIdContext();

    const dateObject = new Date(channel.dateLastMsg);

    const handleClick = () => {
        setChannelId(channel.channelId);
    }

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