import React, { useState } from "react";
import "../styles/HeaderChatBox.css"
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import IsConnected from "./isConnected";
import "../types/channel.type";

interface HeaderChatBoxProps {
    channelHeader: Channel[];
    channelId: number;
}

function HeaderChatBox({ channelHeader, channelId }: HeaderChatBoxProps) {

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
                    <DeleteOutlineIcon />
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
                    <DeleteOutlineIcon />
                </div>
            </div>
        )
    }
}

export default HeaderChatBox;