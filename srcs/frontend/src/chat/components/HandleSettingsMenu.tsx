import React, { useState, useEffect } from "react";
import HeaderChannelInfo from "./HeaderChannelInfo";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import PreviewUser from "./PreviewUser";
import "../styles/SettingsMenu.css";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useUserIdContext } from "../contexts/userIdContext";
import { banUserList, fetchUser, kickUserList, fetchUserAdminTable, manageAdminsToChannel, addUserListToChannel, mute } from "./ChannelUtils";
import { useSocketContext } from "../contexts/socketContext";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { Socket } from "socket.io-client";
import ValidationButton from "./ValidationButton";
import ManagePassword from "./ManagePassword";

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
    const [listUserAdmin, setListUserAdmin] = useState<{ user: User, isAdmin: boolean, updated: boolean }[]>([]);
    const [mutedUser, setMutedUser] = useState<User>();
    const [listUsersSearched, setListUsersSearched] = useState<User[] | null>([]);
    const [error, setError] = useState<string | null>(null);
    const [mutedUntil, setMutedUntil] = useState<string>("");

    const channelId: number = useChannelIdContext();
    const userId: number = useUserIdContext();
    const socket: Socket = useSocketContext();
    const setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>> = useSetChannelHeaderContext();

    let isItDisplay: string = isSettingsMenuDisplay ? "isDisplay" : "isNotDisplay";

    const updateUserAdminList = (user: User): void => {
        const updatedList: { user: User, isAdmin: boolean, updated: boolean }[] = listUserAdmin.map(userAdmin => {
            if (userAdmin.user.id === user.id) {
                return { ...userAdmin, isAdmin: !userAdmin.isAdmin, updated: !userAdmin.updated };
            }
            return userAdmin;
        });
        setListUserAdmin(updatedList);
    }

    const backMenu = () => {
        setInputValue("");
        setSearchBarResults(false);
        setisSettingsMenuDisplay(false);
        setSettingsChannel(true);
        setUserList([]);
        setListUsersSearched([])
        setError(null);
    }

    const fetchDataAdmins = async () => {
        if (action === "admin") {
            try {
                const userAdminTable: { user: User, isAdmin: boolean, updated: boolean }[] = await fetchUserAdminTable(channelId);
                setListUserAdmin(userAdminTable);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    }

    useEffect(() => {
        fetchDataAdmins();
    }, []);

    const callAction = async () => {
        try {
            if (action === "ban") {
                // lorsque le channel fait 2 users et qu'on ban l'un des 2
                // le client essaie de ban les 2 users mais le channel a deja
                // ete detruit car il ne comportait plus que 1 user a la fin du 1er ban
                await banUserList(userList, channelId, userId, socket);
            } else if (action === "kick") {
                await kickUserList(userList, channelId, userId, socket);
            } else if (action === "admin") {
                await manageAdminsToChannel(listUserAdmin.filter(user => user.updated === true), channelId, userId);
            } else if (action === "add") {
                await addUserListToChannel(userList, channelId, socket);
            } else if (action === "mute") {
                if (mutedUntil === ""){
                    setError("Invalid date/time");
                    return ;
                }
                if (userList[0])
                    await mute(userList[0].id, userId, mutedUntil, channelId);
            }
            setSearchBarResults(false);
            setInputValue("");
            setUserList([]);
            await fetchUser(setChannelHeader, userId, socket);
        }
        catch (error: any) {
            console.log(error);
            setError(error.message);
        }
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
        if (action === "mute") {
            console.log("set muted user called");
            setUserList([user]);
            return;
        }
        if (action === "admin")
            return;
        if (checkIfAlreadyInList(user.username)) {
            removeUserFromList(user);
            return;
        }
        setUserList(prevState => [...prevState, user]);
    }

    const removeUserFromList = (input: User) => {
        if (action === "admin") {
            updateUserAdminList(input);
            return;
        }
        setUserList((prevUserList) =>
            prevUserList.filter((username) => username !== input)
        );
    }

    if (action === "password")
        return (
            <div className={`${isItDisplay}`}>
                <HeaderChannelInfo handleClick={backMenu} title={title} />
                <ManagePassword needReload={isSettingsMenuDisplay} />
            </div>
        )
    else if (isSearchBarNeeded === false) {
        return (
            <div className={`${isItDisplay}`}>
                <HeaderChannelInfo handleClick={backMenu} title={title} />
            </div>
        )
    }
    else {
        return (
            <div className={`${isItDisplay}`}>
                {error}
                <HeaderChannelInfo handleClick={backMenu} title={title} />
                <SearchBar setDisplayResults={setSearchBarResults} inputValue={inputValue} setInputValue={setInputValue} action={action} />
                <div className="ContainerPreviewUser">
                    {action === "admin" ? (
                        listUserAdmin.filter(user => user.isAdmin === true).map((user, index) => (
                            <PreviewUser key={index} removeUserFromList={removeUserFromList} user={user.user} />
                        ))
                    ) : action === "ban" || action === "kick" || action === "add" ?(
                        userList.map((user, index) => (
                            <PreviewUser key={index} removeUserFromList={removeUserFromList} user={user} />
                        ))
                    ) : action === "mute" ? (
                        userList.map((user, index) => (
                            <PreviewUser
                                key={index}
                                removeUserFromList={removeUserFromList}
                                user={user}
                                mutedMode={true}
                                mutedUntil={mutedUntil}
                                setMutedUntil={setMutedUntil}
                            />
                        ))
                    ) : null}
                </div>
                {<SearchBarResults
                    inputValue={inputValue}
                    displayResults={searchBarResults}
                    showUserMenu={false}
                    addUserToList={addUserToList}
                    onlySearchInChannel={onlySearchInChannel}
                    listUserAdmin={listUserAdmin}
                    action={action}
                    setSearchBarResults={setSearchBarResults}
                    updateUserAdminList={updateUserAdminList}
                    fetchDataAdmins={fetchDataAdmins}
                    listUsersSearched={listUsersSearched}
                    setListUsersSearched={setListUsersSearched}
                    mutedUser={mutedUser} />}
                <div className="userList">
                </div>
                <div style={{ position: "absolute", top: "45%", left: "60%" }}>
                    <ValidationButton action={callAction}
                        size={{ height: 50, width: 50 }}
                        position={{ top: 0, left: 0 }} />
                </div>
            </div>
        )
    }
}
export default HandleSettingsMenu;