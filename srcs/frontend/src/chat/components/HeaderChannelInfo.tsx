import React from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "../styles/HeaderChannelInfo.css";

interface HeaderChannelInfoProps{
    handleClick: () => void;
    title: string;
}

function HeaderChannelInfo( {handleClick, title}: HeaderChannelInfoProps){

    return (
        <div className="HeaderChannelInfo HeaderChannelSettings">
            <ArrowBackIcon className="icon" onClick={handleClick} />
            <h4>{title}</h4>
        </div>
    )
}
export default HeaderChannelInfo;