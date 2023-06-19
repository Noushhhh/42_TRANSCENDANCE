import React from "react";
import "../styles/MessageToClick.css";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TimeElapsed from "./TimeElapsed";

interface Channel {
    name: string,
    lastMsg : string,
    dateLastMsg: Date,
    channelId: number;
}

interface MessageToClickProps{
    channel: Channel;
    onSelectConversation: (number: number) => void;
    setChannelId: React.Dispatch<React.SetStateAction<number>>;
}

function MessageToClick({channel, onSelectConversation, setChannelId}: MessageToClickProps) {

    const dateObject = new Date(channel.dateLastMsg);

    const handleClick = () =>{
        setChannelId(channel.channelId);
    }

    return (
        <div onClick={handleClick} className="MessageToClick">
            <div className="logoIsConnected">
                <RadioButtonUncheckedIcon/>
            </div>
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