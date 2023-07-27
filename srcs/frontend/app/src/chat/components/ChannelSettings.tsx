import React, { useState } from "react";
import "../styles/ChannelSettings.css"
import "../styles/ChannelInfo.css"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockIcon from '@mui/icons-material/Lock';
import BlockIcon from '@mui/icons-material/Block';
import BackHandIcon from '@mui/icons-material/BackHand';
import AddIcon from '@mui/icons-material/Add';

interface ChannelSettingsProps {
    settingsChannel: boolean;
    setSettingsChannel: React.Dispatch<React.SetStateAction<boolean>>;
    setdisplayMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChannelSettings({ settingsChannel, setSettingsChannel, setdisplayMenu }: ChannelSettingsProps): JSX.Element {

    interface MenuItem {
        title: string;
        icon: string;
      }
      
    const menuItems: MenuItem[] = [
        { title: "Add member", icon: "PersonAddIcon" },
        { title: "Password", icon: "LockIcon" },
        { title: "Kick someone", icon: "BlockIcon" },
        { title: "Ban someone", icon: "BackHandIcon" },
        { title: "New admin", icon: "AddIcon" },
      ];

    let isDisplay: string = settingsChannel ? 'isDisplaySettings' : 'isReduceSettings';

    const backInfoMenu = () => {
        if (settingsChannel === true)
            setSettingsChannel(false);
        setdisplayMenu(true);
    }

    return (
        <div className={`ChannelSettings ${isDisplay}`}>
            <div className="HeaderChannelInfo HeaderChannelSettings">
                <ArrowBackIcon className="icon" onClick={backInfoMenu} />
                <h4>Parametres du groupe</h4>
            </div>
            <div className="ContentChannelSettings">
                {
                    menuItems.map((item, index) => (
                        <div key={index} className="ChannelInfoCard">
                            <h4>{item.title}</h4>
                        </div>
                    ))
                }
            </div>
        </div>
    );
} export default ChannelSettings;