import React, { useState, useEffect } from "react";
import "../styles/ChatView.css";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "../styles/ChannelInfo.css";
import ChannelSettings from "./ChannelSettings";
import LeaveChannel from "./LeaveChannel";
import HeaderChannelInfo from "./HeaderChannelInfo";
import { useChannelIdContext, useSetChannelIdContext } from "../contexts/channelIdContext";
import { getChannelName, getNumberUsersInChannel, isOwner, leaveChannel } from "./ChannelUtils";
import { useUserIdContext } from "../contexts/userIdContext";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import PreviewUser from "./PreviewUser";
import ValidationButton from "./ValidationButton";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useSocketContext } from "../contexts/socketContext";
import { Socket } from "socket.io-client";
import { useToggleMenu, useSetToggleMenu } from "../contexts/toggleMenuMobile";


interface ChannelInfoProps {
  isChannelInfoDisplay: boolean;
  setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChannelInfo({ isChannelInfoDisplay, setChannelInfo }: ChannelInfoProps): JSX.Element | null {

  const [settingsChannel, setSettingsChannel] = useState<boolean>(false);
  const [displayMenu, setdisplayMenu] = useState<boolean>(true);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [numberUsersInChannel, setnumberUsersInChannel] = useState<number | null>(null);
  const [isChannelOwner, setIsChannelOwner] = useState<boolean | undefined>(undefined);
  const [displayNewOwner, setDisplayNewOwner] = useState<boolean>(false);
  const [newOwnerInput, setnewOwnerInput] = useState<string>("");
  const [displayOwnerResults, setdisplayOwnerResults] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newOwner, setNewOwner] = useState<User>();
  const [listUsersSearched, setListUsersSearched] = useState<User[] | null>([]);
  const [settingsClicked, setSettingsClicked] = useState<boolean>(false);

  const channelId: number = useChannelIdContext();
  const userId: number = useUserIdContext();
  const setChannelHeader = useSetChannelHeaderContext();
  const socket: Socket = useSocketContext();
  const setChannelId = useSetChannelIdContext();

  const toggleMenu = useToggleMenu();
  const setToggleMenu = useSetToggleMenu();

  let widthChatView: string | null = isChannelInfoDisplay
    ? "isDisplay"
    : "isReduce";
  let isContainerDisplay: string | null = displayMenu
    ? "IsDisplay"
    : "IsReduce";

  const addUserToList = (user: User) => {
    setNewOwner(user);
  }

  const removeUserFromList = () => {
    setNewOwner(undefined);
  }


  const updateChannelNumberMember = async (channelIdReceived: number) => {
    console.log("updateChannelNumberMember");
    if (channelIdReceived === channelId){
      try {
        const numberUsersInChannel: number = await getNumberUsersInChannel(channelId);
        setnumberUsersInChannel(numberUsersInChannel);
      } catch (errors){
        console.log(errors);
      }
    }
  }

  useEffect(() => {
    socket.on("channelNumberMembersChanged", updateChannelNumberMember);
    return () => {
      socket.off("channelNumberMembersChanged", updateChannelNumberMember);
    };
  });

  useEffect(() => {
    setError(null);
    setChannelInfo(false);
    setdisplayMenu(true);
    const fetchChannelName = async () => {
      try {
        if (channelId !== -1) {
          const isItChannelOwner: boolean = await isOwner(channelId, userId);
          setIsChannelOwner(isItChannelOwner);
          const numberUsersInChannel: number = await getNumberUsersInChannel(channelId);
          setnumberUsersInChannel(numberUsersInChannel);
          const channelName: string | null = await getChannelName(channelId, userId);
          setChannelName(channelName);
        }
      } catch (error) {
        setError("fetching  error");
      }
    }
    fetchChannelName();
    setDisplayNewOwner(false);
  }, [channelId]);

  const setNewOwnerAndLeaveChannel = async () => {
    try {
      if (!newOwner)
        setError("Provide a new owner");
      if (newOwner) {
        const isUserLeaved = await leaveChannel(userId, channelId, setChannelHeader, socket, newOwner.id);
        if (isUserLeaved)
          setChannelId(-1);
        setNewOwner(undefined);
        setDisplayNewOwner(false);
        setChannelInfo(true);
      }
    } catch (error: any) {
      setError(error.message);
    }
  }

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

  const handleClick = () => {
    if (window.innerWidth < 800) {
      setToggleMenu(!toggleMenu);
      setChannelInfo(!toggleMenu);
    }
  };

  const handleSettings = () => {
    setError(null);
    settingsChannel ? setSettingsChannel(false) : setSettingsChannel(true);
    setdisplayMenu(!displayMenu);
    setSettingsClicked(true);
  };

  if (displayNewOwner === true) {
    return (
      <div className={`ChannelInfo ${'ContainerChannelInfo' + widthChatView}`}>
        {displayNewOwner ?
          <div>
            <p>Please provide a new owner/admin</p>
            <div style={{ color: "red" }}>{error}</div>
            <SearchBar setDisplayResults={setdisplayOwnerResults} inputValue={newOwnerInput} setInputValue={setnewOwnerInput} />
            {newOwner ? <PreviewUser user={newOwner} removeUserFromList={removeUserFromList} /> : null}
            <SearchBarResults inputValue={newOwnerInput} displayResults={true} showUserMenu={false} addUserToList={addUserToList} onlySearchInChannel={true} listUsersSearched={listUsersSearched} setListUsersSearched={setListUsersSearched} />
            <ValidationButton action={setNewOwnerAndLeaveChannel}
              size={{ height: 50, width: 50 }}
              position={{ top: 0, left: 0 }} />
          </div> : null}
      </div>
    )
  }

  return channelId !== -1 ? (
    <div className={`ChannelInfo ${'ContainerChannelInfo' + widthChatView}`}>
      {error ? error : null}
      <div className={`${'Container' + isContainerDisplay}`}>
        <HeaderChannelInfo handleClick={() => {handleClick()}} title={"Groups information"} />
        <div className="ChannelInfoCard ChannelName">
          <h4>{channelName ? channelName : 'no-name'}</h4>
          <h5>{numberUsersInChannel ? numberUsersInChannel : null} membres</h5>
        </div>
        <div className="ChannelInfoCard SettingsButton">
          <h4 className="clickable" onClick={handleSettings}>Parametres du groupe <ArrowForwardIosIcon className="icon" /></h4>
        </div>
        <div className="ChannelInfoCard SettingsButton leaveChannel">
          <LeaveChannel setParentError={setError} isOwner={isChannelOwner} setDisplayNewOwner={setDisplayNewOwner} setDisplayMenu={setdisplayMenu} />
        </div>

      </div>
      <ChannelSettings settingsChannel={settingsChannel} setSettingsChannel={setSettingsChannel} setdisplayMenu={setdisplayMenu} setChannelInfo={setChannelInfo} setSettingsClicked={setSettingsClicked} />
    </div>
  )
    : null;
} export default ChannelInfo;
