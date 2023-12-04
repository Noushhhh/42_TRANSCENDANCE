import React, { useEffect, useState } from "react";
import "../styles/MessageToClick.css";
import TimeElapsed from "./TimeElapsed";
import IsConnected from "./isConnected";
import { useChannelIdContext, useSetChannelIdContext } from "../contexts/channelIdContext";
import { getChannelName } from "./ChannelUtils";
import { useUserIdContext } from "../contexts/userIdContext";

interface Channel {
    name: string,
    lastMsg : string,
    dateLastMsg: Date | null,
    channelId: number;
}

interface MessageToClickProps{
    channel: Channel;
    isConnected: boolean;
    setChannelClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

function MessageToClick({channel, isConnected, setChannelClicked }: MessageToClickProps) {

    const [channelName, setChannelName] = useState<string | null>(null);
    
    const setChannelId = useSetChannelIdContext();
    const userId: number = useUserIdContext();

    let dateObject: Date | null;

    if (channel.dateLastMsg)
        dateObject = new Date(channel.dateLastMsg);
    else
        dateObject = null;

    useEffect(() => {
        const fetchChannelName = async () => {
            try {
                let channelName: string | null = await getChannelName(channel.channelId, userId);
                setChannelName(channelName);
            } catch (errors: any) {
                console.log(errors.message);
            }
        }

        fetchChannelName();
    }, []);

    const handleClick = () => {
        setChannelId(channel.channelId);
        setChannelClicked(true);
    }

    if (channel.channelId === -1)
        return null;

    return (
        <div onClick={handleClick} className="MessageToClick">
            <IsConnected isConnected={isConnected} />
            <div className="ContainerPreview">
                <div className="MessageToClickTitle">
                    <p title={channelName ? channelName :  ""} className="senderName">{channelName ? channelName : null}</p>
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