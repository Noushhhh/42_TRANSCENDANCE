import React, { useState, useEffect } from "react";
import "../styles/ChatView.css";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "../styles/ChannelInfo.css"
import ChannelSettings from "./ChannelSettings";
import ConfirmationPopup from "./ConfirmationPopup";
import { leaveChannel } from "./ChannelUtils";
import HeaderChannelInfo from "./HeaderChannelInfo";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useSocketContext } from "../contexts/socketContext";
import { Socket } from "socket.io-client";

interface MonComposantProps {
    isChannelInfoDisplay: boolean;
    setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChannelInfo({ isChannelInfoDisplay, setChannelInfo }: MonComposantProps): JSX.Element | null {

    const [settingsChannel, setSettingsChannel] = useState<boolean>(false);
    const [displayMenu, setdisplayMenu] = useState<boolean>(true);

    const channelId: number = useChannelIdContext();
    const socket: Socket = useSocketContext();

    let widthChatView: string | null = isChannelInfoDisplay ? 'isDisplay' : 'isReduce';
    let isContainerDisplay: string | null = displayMenu ? 'IsDisplay' : 'IsReduce';

    useEffect(()=>{
        setChannelInfo(false);
    }, [channelId]);

    const handleSettings = () => {
        settingsChannel ? setSettingsChannel(false) : setSettingsChannel(true);
        setdisplayMenu(!displayMenu);
    }
        return channelId !== -1 ? (
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
    ) 
        : null;

} export default ChannelInfo;