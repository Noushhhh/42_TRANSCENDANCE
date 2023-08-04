import React, { useState } from "react";
import HeaderChannelInfo from "./HeaderChannelInfo";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import PreviewUser from "./PreviewUser";
import DoneIcon from '@mui/icons-material/Done';
import "../styles/SettingsMenu.css";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useUserIdContext } from "../contexts/userIdContext";
import { banUserList, fetchUser } from "./ChannelUtils";
import { useSocketContext } from "../contexts/socketContext";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { Socket } from "socket.io-client";

interface HandleSettingsMenuProps {
    isSettingsMenuDisplay: boolean,
    setisSettingsMenuDisplay: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    setSettingsChannel: React.Dispatch<React.SetStateAction<boolean>>;
    isSearchBarNeeded: boolean;
    onlySearchInChannel: boolean;
    action: string;
}

function HandleSettingsMenu({ isSettingsMenuDisplay, setisSettingsMenuDisplay, title, setSettingsChannel, isSearchBarNeeded, onlySearchInChannel, action }: HandleSettingsMenuProps) {

    const [searchBarResults, setSearchBarResults] = useState<boolean>(false);
    const [userList, setUserList] = useState<User[]>([]);
    const [inputValue, setInputValue] = useState<string>("");

    const channelId: number = useChannelIdContext();
    const userId: number = useUserIdContext();
    const socket: Socket = useSocketContext();
    const setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>> = useSetChannelHeaderContext();

    let isItDisplay: string = isSettingsMenuDisplay ? "isDisplay" : "isNotDisplay";

    const backMenu = () => {
        setInputValue("");
        setSearchBarResults(false);
        setisSettingsMenuDisplay(false);
        setSettingsChannel(true);
    }

    const callAction = async () => {
        if (action === "ban") {
            await banUserList(userList, channelId, userId);
        }
        else {
            console.log("WIP");
        }
        setSearchBarResults(false);
        setInputValue("");
        setUserList([]);
        await fetchUser(setChannelHeader, userId, socket);
    }

    function checkIfAlreadyInList(usernameToCheck: string) {
        for (const user of userList) {
            if (user.username === usernameToCheck) {
                return true;
            }
        }
        return false;
    }

    const addUserToList = (user: User) => {
        if (checkIfAlreadyInList(user.username))
            return;
        setUserList(prevState => [...prevState, user]);
    }

    const removeUserFromList = (input: User) => {
        setUserList((prevUserList) =>
            prevUserList.filter((username) => username !== input)
        );
    }

    if (isSearchBarNeeded === false) {
        return (
            <div className={`${isItDisplay}`}>
                <HeaderChannelInfo handleClick={backMenu} title={title} />
                <h4>hande Settings Menu</h4>
            </div>
        )
    }
    else {
        return (
            <div className={`${isItDisplay}`}>
                <HeaderChannelInfo handleClick={backMenu} title={title} />
                <SearchBar setDisplayResults={setSearchBarResults} inputValue={inputValue} setInputValue={setInputValue} />
                {userList.map((user, index) => {
                    return <PreviewUser key={index} removeUserFromList={removeUserFromList} user={user} />
                })}
                <SearchBarResults inputValue={inputValue} displayResults={searchBarResults} showUserMenu={false} addUserToList={addUserToList} onlySearchInChannel={onlySearchInChannel} />
                <div className="userList">
                </div>
                <h4>hande Settings Menu</h4>
                <div className="validationButton">
                    <DoneIcon onClick={callAction} className="icon" />
                </div>
            </div>
        )
    }
}
export default HandleSettingsMenu;