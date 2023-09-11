import React, { ChangeEvent, useEffect, useState } from "react";
import "../styles/CreateChannelPopup.css";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import PreviewUser from "./PreviewUser";
import "../types/channel.type";
import { createChannel } from "./ChannelUtils";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";

interface CreateChannelPopupProps{
    displayState: string;
}

function CreateChannelPopup( { displayState }: CreateChannelPopupProps) {

    const [userListChannel, setUserListChannel] = useState<User[]>([]);
    const [channelName, setChannelName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [displayResults, setDisplayResults] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [channelType, setChannelType] = useState<string>("PUBLIC"); // État pour la valeur sélectionnée
    const [listUsersSearched, setListUsersSearched] = useState<User[] | null>([]);

    const socket = useSocketContext();
    const userId = useUserIdContext();

    useEffect(() => {

        if (displayState === "hidePopup"){
            setListUsersSearched([]);
            setInputValue("");
        }
    }, [displayState])

    const setChannelHeader = useSetChannelHeaderContext();

    const handleChannelName = (event: ChangeEvent<HTMLInputElement>) => {
        setChannelName(event.target.value);
    }

    const handleChannelTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setChannelType(event.target.value);
    };

    const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    const handleConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(event.target.value);
    }

    function checkIfAlreadyInList(usernameToCheck: string) {
        for (const user of userListChannel) {
          if (user.username === usernameToCheck) {
            return true;
          }
        }
        return false;
      }

    const addUserToList = (user: User) => {
        if (checkIfAlreadyInList(user.username))
            return ;
        setUserListChannel(prevState => [...prevState, user]);
    }

    const removeUserFromList = (input: User) => {
        setUserListChannel((prevUserListChannel) =>
        prevUserListChannel.filter((username) => username !== input)
      );
    }

    const callCreateChannel = async () => {
        createChannel(channelName, password, userListChannel, channelType, setChannelHeader, userId, socket);
      };

    return (
        <div className={`popupChannelCreation ${displayState}`}>
            <h2>CREATE CHANNEL</h2>
            <div className="flex">
                <label>Type de channel:</label>
                <select value={channelType} onChange={handleChannelTypeChange} name="" id="">
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="PASSWORD_PROTECTED">PASSWORD_PROTECTED</option>
                    <option value="PRIVATE">PRIVATE</option>
                </select>
            </div>
            {channelType === 'PASSWORD_PROTECTED' || channelType === 'PRIVATE' ? (
            <div>
                <div className="flex">
                    <h5>Password</h5>
                    <input value={password} onChange={handlePassword} type="password" />
                </div>
                <div className="flex">
                    <h5>Confirm Password</h5>
                    <input value={confirmPassword} onChange={handleConfirmPassword} type="password" />
                </div>
            </div>
        ) : null}
            <SearchBar setDisplayResults={setDisplayResults} setInputValue={setInputValue} inputValue={inputValue} />
            <h3>User List</h3>
            <div className="userList">
                {userListChannel.map((user, index) => {
                    return <PreviewUser key={index} removeUserFromList={removeUserFromList} user={user} />
                })}
            </div>
            <SearchBarResults
                inputValue={inputValue}
                displayResults={displayResults}
                showUserMenu={false}
                addUserToList={addUserToList}
                onlySearchInChannel={false}
                listUsersSearched={listUsersSearched}
                setListUsersSearched={setListUsersSearched}/>
            {
                password !== confirmPassword ? (
                    <p>Passwords doesn't match</p>
                ) : null
            }
            {
            userListChannel.length > 1 ? (
                <div className="flex">
                <h5>Channel Name</h5>
                <input value={channelName} onChange={handleChannelName} type="text" />
            </div>
            ) : null
        }
            <button onClick={callCreateChannel}>Create</button>
        </div>
    )   
}
export default CreateChannelPopup;