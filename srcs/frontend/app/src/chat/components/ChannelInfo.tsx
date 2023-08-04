import React, { useState } from "react";
import "../styles/ChatView.css";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "../styles/ChannelInfo.css"
import ChannelSettings from "./ChannelSettings";
import ConfirmationPopup from "./ConfirmationPopup";
import { leaveChannel } from "./ChannelUtils";
import HeaderChannelInfo from "./HeaderChannelInfo";
//import Message from "../../../../../backend/node_modules/prisma/prisma-client";

interface MonComposantProps {
    isChannelInfoDisplay: boolean;
}

function ChannelInfo({ isChannelInfoDisplay }: MonComposantProps): JSX.Element {

    const [settingsChannel, setSettingsChannel] = useState<boolean>(false);
    const [displayMenu, setdisplayMenu] = useState<boolean>(true);

    let widthChatView: string | null = isChannelInfoDisplay ? 'isDisplay' : 'isReduce';
    let isContainerDisplay: string | null = displayMenu ? 'IsDisplay' : 'IsReduce';

    const handleSettings = () => {
        settingsChannel ? setSettingsChannel(false) : setSettingsChannel(true);
        displayMenu ? setdisplayMenu(false) : setdisplayMenu(true);
    }

    return (
        <div className={`ChannelInfo ${'ContainerChannelInfo' + widthChatView}`}>
            <div className={`${'Container' + isContainerDisplay}`}>
               <HeaderChannelInfo handleClick={()=>{}} title={"Groups information"}/>
                <div className="ChannelInfoCard ChannelName">
                    <h4>Channel Name</h4>
                    <h5>3 membres</h5>
                </div>
                <div className="ChannelInfoCard SettingsButton">
                    <h4 className="clickable" onClick={handleSettings}>Parametres du groupe <ArrowForwardIosIcon className="icon" /></h4>
                </div>
                <div className="ChannelInfoCard SettingsButton leaveChannel">
                    <ConfirmationPopup Action={leaveChannel}/>
                </div>
            </div>
            <ChannelSettings settingsChannel={settingsChannel} setSettingsChannel={setSettingsChannel} setdisplayMenu={setdisplayMenu} />
        </div>
    );
} export default ChannelInfo;