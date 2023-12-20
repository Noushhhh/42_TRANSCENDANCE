import React, { useState, useEffect } from "react";
import "../styles/HeaderChatBox.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import IsConnected from "./isConnected";
import "../types/channel.type";
import SettingsIcon from "@mui/icons-material/Settings";
import { useChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useToggleMenu, useSetToggleMenu } from "../contexts/toggleMenuMobile";
import { useUserIdContext } from "../contexts/userIdContext";
import { getChannelName } from "./ChannelUtils";

interface HeaderChatBoxProps {
  channelInfo: boolean;
  setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
  backToChannels: () => void;
}

function HeaderChatBox({ channelInfo, setChannelInfo, backToChannels }: HeaderChatBoxProps) {

  const [channelName, setChannelName] = useState<string | null>(null);

  const channelHeader = useChannelHeaderContext();
  const toggleMenu = useToggleMenu();
  const setToggleMenu = useSetToggleMenu();

  const channelId: number = useChannelIdContext();
  const userId: number = useUserIdContext();

  useEffect(() => {
      const fetchChannelName = async () => {
          try {
            if (channelId === -1)
              return;
            const channelName: string | null = await getChannelName(channelId, userId);
            setChannelName(channelName);
          } catch (errors: any) {
              console.log(errors.message);
          }
      }

      fetchChannelName();
  }, [channelId]);

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
          <p title={channelName ? channelName :  ""}>{channelName ? channelName :  null}</p>
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
