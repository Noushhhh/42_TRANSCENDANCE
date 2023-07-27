import React, { useState } from "react";
import "../styles/HeaderChatBox.css"
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import IsConnected from "./isConnected";
import "../types/channel.type";
import SettingsIcon from '@mui/icons-material/Settings';
import { useChannelHeaderContext, useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useChannelIdContext } from "../contexts/channelIdContext";

interface HeaderChatBoxProps {
    channelInfo: boolean;
    setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

function HeaderChatBox({ channelInfo, setChannelInfo }: HeaderChatBoxProps) {

    const channelHeader = useChannelHeaderContext();

    const channelId = useChannelIdContext();

    const handleSettingsClick = () => {
        channelInfo === true ? setChannelInfo(false) : setChannelInfo(true);
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
                    <RadioButtonUncheckedIcon />
                    <p>loading...</p>
                </div>
                <div className="HeaderChatBoxLogo">
                    <SettingsIcon />
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
                    <button className="settingsButton" onClick={handleSettingsClick}><SettingsIcon/></button>
                </div>
            </div>
        )
    }
}

export default HeaderChatBox;