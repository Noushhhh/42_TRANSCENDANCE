import React, { useState, useEffect } from "react";
import "../styles/ChatView.css";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "../styles/ChannelInfo.css";
import ChannelSettings from "./ChannelSettings";
import ConfirmationPopup from "./ConfirmationPopup";
import HeaderChannelInfo from "./HeaderChannelInfo";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { getChannelName, getNumberUsersInChannel } from "./ChannelUtils";
import { useUserIdContext } from "../contexts/userIdContext";
import { useToggleMenu, useSetToggleMenu } from "../contexts/toggleMenuMobile";

interface MonComposantProps {
  isChannelInfoDisplay: boolean;
  setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChannelInfo({
  isChannelInfoDisplay,
  setChannelInfo,
}: MonComposantProps): JSX.Element | null {
  const [settingsChannel, setSettingsChannel] = useState<boolean>(false);
  const [displayMenu, setdisplayMenu] = useState<boolean>(true);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [numberUsersInChannel, setnumberUsersInChannel] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [settingsClicked, setSettingsClicked] = useState<boolean>(false);

  const channelId: number = useChannelIdContext();
  const userId: number = useUserIdContext();

  const toggleMenu = useToggleMenu();
  const setToggleMenu = useSetToggleMenu();

  let widthChatView: string | null = isChannelInfoDisplay
    ? "isDisplay"
    : "isReduce";
  let isContainerDisplay: string | null = displayMenu
    ? "IsDisplay"
    : "IsReduce";

  useEffect(() => {
    setError(null);
    setChannelInfo(false);
    const fetchChannelName = async () => {
      try {
        if (channelId !== -1) {
          const numberUsersInChannel: number = await getNumberUsersInChannel(
            channelId
          );
          setnumberUsersInChannel(numberUsersInChannel);
          const channelName: string = await getChannelName(channelId, userId);
          setChannelName(channelName);
        }
      } catch (error) {
        setError("fetching error");
      }
    };
    fetchChannelName();
  }, [channelId]);

  useEffect(() => {
    if (window.innerWidth < 800) {
      setdisplayMenu(toggleMenu);
    }
  }, [toggleMenu]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  // Use effect pour reparer le bug du mobile to desktop setting menu qui se display pas
  useEffect(() => {
    if (isChannelInfoDisplay && window.innerWidth > 799 && !settingsClicked) {
      setdisplayMenu(true);
    }
  });

  const handleResize = () => {
    if (window.innerWidth > 799) {
      setToggleMenu(false);
      if (isChannelInfoDisplay && !settingsClicked) {
        setdisplayMenu(true);
      }
    }
    if (displayMenu && settingsClicked === false && window.innerWidth < 800) {
      setToggleMenu(true);
    } else if (
      displayMenu &&
      settingsClicked === true &&
      window.innerWidth < 800
    ) {
      setToggleMenu(true);
      setdisplayMenu(false);
    }
  };

  const handleSettings = () => {
    setError(null);
    settingsChannel ? setSettingsChannel(false) : setSettingsChannel(true);
    setdisplayMenu(!displayMenu);
    setSettingsClicked(true);
  };

  const handleClick = () => {
    if (window.innerWidth < 800) {
      setToggleMenu(!toggleMenu);
      setChannelInfo(!toggleMenu);
    }
  };

  return channelId !== -1 ? (
    <div className={`ChannelInfo ${"ContainerChannelInfo" + widthChatView}`}>
      {error ? error : null}
      <div className={`${"Container" + isContainerDisplay}`}>
        <HeaderChannelInfo
          handleClick={() => {
            handleClick();
          }}
          title={"Groups information"}
        />
        <div className="ChannelInfoCard ChannelName">
          <h4>{channelName ? channelName : "Loading..."}</h4>
          <h5>{numberUsersInChannel ? numberUsersInChannel : null} membres</h5>
        </div>
        <div className="ChannelInfoCard SettingsButton">
          <h4 className="clickable" onClick={handleSettings}>
            Parametres du groupe <ArrowForwardIosIcon className="icon" />
          </h4>
        </div>
        <div className="ChannelInfoCard SettingsButton leaveChannel">
          <ConfirmationPopup setError={setError} />
        </div>
      </div>
      <ChannelSettings
        settingsChannel={settingsChannel}
        setSettingsChannel={setSettingsChannel}
        setdisplayMenu={setdisplayMenu}
        setChannelInfo={setChannelInfo}
        setSettingsClicked={setSettingsClicked}
      />
    </div>
  ) : null;
}
export default ChannelInfo;
