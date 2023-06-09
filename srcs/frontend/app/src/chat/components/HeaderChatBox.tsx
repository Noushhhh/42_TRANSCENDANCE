import React, { useState } from "react";
import "../styles/HeaderChatBox.css"
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import IsConnected from "./isConnected";
import "../types/channel.type";
import SettingsIcon from '@mui/icons-material/Settings';

interface HeaderChatBoxProps {
    channelHeader: Channel[];
    channelId: number;
}

function HeaderChatBox({ channelHeader, channelId }: HeaderChatBoxProps) {

    const handleSettingsClick = () => {
        console.log("clicked");
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