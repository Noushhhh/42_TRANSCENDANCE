import React, { useEffect, useState } from "react";
import "../styles/ChannelSettings.css";
import "../styles/ChannelInfo.css";
import HandleSettingsMenu from "./HandleSettingsMenu";
import HeaderChannelInfo from "./HeaderChannelInfo";
import { useSocketContext } from "../contexts/socketContext";
import { Socket } from "socket.io-client";
import { useSetChannelIdContext } from "../contexts/channelIdContext";

interface ChannelSettingsProps {
  settingsChannel: boolean;
  setSettingsChannel: React.Dispatch<React.SetStateAction<boolean>>;
  setdisplayMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

interface MenuItem {
  childTitle: string;
  title: string;
  icon: string;
  function: (item: MenuItem) => void;
  isSearchBarNeeded: boolean;
  onlySearchInChannel: boolean;
  action: string;
}

function ChannelSettings({
  settingsChannel,
  setSettingsChannel,
  setdisplayMenu,
}: ChannelSettingsProps): JSX.Element {
  const [isSettingsMenuDisplay, setisSettingsMenuDisplay] =
    useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>();

  const socket: Socket = useSocketContext();
  const setChannelId = useSetChannelIdContext();

  let isDisplay: string = settingsChannel
    ? "isDisplaySettings"
    : "isReduceSettings";

  // useEffect(() => {
  //   socket.on("channelDeleted", channelDeletedEvent);

  //   return () => {
  //     socket.off("channelDeleted", channelDeletedEvent);
  //   };
  // });

  socket.on("channelDeleted", (channelId: number) => {
    console.log(`ping received client-side with id: ${channelId}`);
    setdisplayMenu(true);
    setChannelId(-1);
  });


  const channelDeletedEvent = (channelId: number) => {
    console.log(`ping received client-side with id: ${channelId}`);
    setdisplayMenu(true);
    setChannelId(-1);
  };

  const goToSubmenu = (item: MenuItem) => {
    setSettingsChannel(false);
    setisSettingsMenuDisplay(true);
    setSelectedMenu(item);
  };

  const menuItems: MenuItem[] = [
    {
      childTitle: "Add a member",
      title: "Add member",
      icon: "PersonAddIcon",
      function: goToSubmenu,
      isSearchBarNeeded: true,
      onlySearchInChannel: false,
      action: "add",
    },
    {
      childTitle: "Manage Password",
      title: "Password",
      icon: "LockIcon",
      function: goToSubmenu,
      isSearchBarNeeded: false,
      onlySearchInChannel: false,
      action: "psswd",
    },
    {
      childTitle: "Kick someone",
      title: "Kick someone",
      icon: "BlockIcon",
      function: goToSubmenu,
      isSearchBarNeeded: true,
      onlySearchInChannel: true,
      action: "kick",
    },
    {
      childTitle: "Ban someone",
      title: "Ban someone",
      icon: "BackHandIcon",
      function: goToSubmenu,
      isSearchBarNeeded: true,
      onlySearchInChannel: true,
      action: "ban",
    },
    {
      childTitle: "Manage administrators",
      title: "New admin",
      icon: "AddIcon",
      function: goToSubmenu,
      isSearchBarNeeded: true,
      onlySearchInChannel: true,
      action: "admin",
    },
  ];

  const backInfoMenu = () => {
    if (settingsChannel === true) setSettingsChannel(false);
    setdisplayMenu(true);
  };

  return (
    <div>
      <div className={`ChannelSettings ${isDisplay}`}>
        <HeaderChannelInfo
          handleClick={backInfoMenu}
          title={"Group settings"}
        />
        <div className="ContentChannelSettings">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => item.function(item)}
              className="ChannelInfoCard"
            >
              <h4>{item.title}</h4>
            </div>
          ))}
        </div>
      </div>
      {selectedMenu?.childTitle && (
        <HandleSettingsMenu
          isSettingsMenuDisplay={isSettingsMenuDisplay}
          setisSettingsMenuDisplay={setisSettingsMenuDisplay}
          title={selectedMenu?.childTitle}
          setSettingsChannel={setSettingsChannel}
          isSearchBarNeeded={selectedMenu.isSearchBarNeeded}
          onlySearchInChannel={selectedMenu.onlySearchInChannel}
          action={selectedMenu.action}
        />
      )}
    </div>
  );
}
export default ChannelSettings;
