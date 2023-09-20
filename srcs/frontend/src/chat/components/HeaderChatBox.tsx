import React from "react";
import "../styles/HeaderChatBox.css"
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import IsConnected from "./isConnected";
import "../types/channel.type";
import SettingsIcon from '@mui/icons-material/Settings';
import { useChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useChannelIdContext } from "../contexts/channelIdContext";

interface HeaderChatBoxProps {
    channelInfo: boolean;
    setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

function HeaderChatBox({ channelInfo, setChannelInfo }: HeaderChatBoxProps) {

    const channelHeader = useChannelHeaderContext();

    const channelId = useChannelIdContext();

    const handleSettingsClick = () => {
        setChannelInfo(!channelInfo);
    }

    var i: number = 0;
    for (; i < channelHeader.length; i++) {
        if (channelHeader[i].channelId === channelId) {
            break;
        }
    }

    if (channelHeader[i] === undefined) {
        return (
            <div className="HeaderChatBox">
                <div className="ContactName">
                    <span className="ArrowBackPhone"><ArrowBackIosIcon /></span>
                    <p>Select a channel...</p>
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="HeaderChatBox">
                <div className="ContactName">
                    <span className="ArrowBackPhone"><ArrowBackIosIcon /></span>
                    <IsConnected isConnected={channelHeader[i].isConnected}/>
                    <p>{channelHeader[i].name}</p>
                </div>
                <div className="HeaderChatBoxLogo">
                    <button className="showSettingsMenu" onClick={handleSettingsClick}><SettingsIcon/></button>
                </div>
            </div>
        )
    }
}

export default HeaderChatBox;