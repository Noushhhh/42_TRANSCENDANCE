import React from "react";
import "../styles/HeaderChatBox.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import IsConnected from "./isConnected";
import "../types/channel.type";
import SettingsIcon from "@mui/icons-material/Settings";
import { useChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useToggleMenu, useSetToggleMenu } from "../contexts/toggleMenuMobile";

interface HeaderChatBoxProps {
  channelInfo: boolean;
  setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
  backToChannels: () => void;
}

function HeaderChatBox({ channelInfo, setChannelInfo, backToChannels }: HeaderChatBoxProps) {

  const channelHeader = useChannelHeaderContext();
  const toggleMenu = useToggleMenu();
  const setToggleMenu = useSetToggleMenu();

  const channelId: number = useChannelIdContext();

  const handleSettingsClick = () => {
    setChannelInfo(!channelInfo);
    if (window.innerWidth < 800) {
      setToggleMenu(!toggleMenu);
    }
  };

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
          <span className="ArrowBackPhone">
            <ArrowBackIosIcon />
          </span>
          <p>Select a channel...</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="HeaderChatBox">
        <div className="ContactName">
          <span className="ArrowBackPhone" onClick={backToChannels}>
            <ArrowBackIosIcon />
          </span>
          <IsConnected />
          <p title={channelHeader[i].name ? channelHeader[i].name  :  ""}>{channelHeader[i].name  ? channelHeader[i].name  :  null}</p>
        </div>
        <div className="HeaderChatBoxLogo">
          <button className="showSettingsMenu" onClick={handleSettingsClick}>
            <SettingsIcon />
          </button>
        </div>
      </div>
    );
  }
}

export default HeaderChatBox;
