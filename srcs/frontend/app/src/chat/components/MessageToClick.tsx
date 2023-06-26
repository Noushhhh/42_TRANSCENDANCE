import React, { useState } from "react";
import "../styles/MessageToClick.css";
import TimeElapsed from "./TimeElapsed";
import IsConnected from "./isConnected";

interface Channel {
    name: string,
    lastMsg : string,
    dateLastMsg: Date,
    channelId: number;
}

interface MessageToClickProps{
    socket: any;
    channelId: number;
    channel: Channel;
    setChannelId: React.Dispatch<React.SetStateAction<number>>;
    isConnected: boolean;
}

function MessageToClick({channel, setChannelId, channelId, socket, isConnected }: MessageToClickProps) {

    const dateObject = new Date(channel.dateLastMsg);

    const handleClick = () =>{
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