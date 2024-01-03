import React from "react";
import "../styles/MessageToClick.css";
import TimeElapsed from "./TimeElapsed";
import { useSetChannelIdContext } from "../contexts/channelIdContext";

interface Channel {
    name: string;
    lastMsg: string;
    dateLastMsg: Date;
    channelId: number;
    isConnected: boolean;
}

interface MessageToClickProps{
    channel: Channel;
    setChannelClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

function MessageToClick({channel, setChannelClicked }: MessageToClickProps) {
    
    const setChannelId = useSetChannelIdContext();

    let dateObject: Date | null;

    if (channel.dateLastMsg)
        dateObject = new Date(channel.dateLastMsg);
    else
        dateObject = null;

    const handleClick = () => {
        setChannelId(channel.channelId);
        setChannelClicked(true);
    }

    if (channel.channelId === -1)
        return null;

    return (
        <div onClick={handleClick} className="MessageToClick">
            <div className="ContainerPreview">
                <div className="MessageToClickTitle">
                    <p title={channel.name ? channel.name :  ""} className="senderName">{channel.name ? channel.name : null}</p>
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