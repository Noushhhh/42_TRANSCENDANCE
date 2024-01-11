import React, { ChangeEvent, useState } from "react";
import "../styles/CreateChannelPopup.css";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import PreviewUser from "./PreviewUser";
import "../types/channel.type";
import { createChannel } from "./ChannelUtils";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";
import { Socket } from "socket.io-client";

interface CreateChannelPopupProps{
    setIsDisplay: React.Dispatch<React.SetStateAction<boolean[]>>;
}

function CreateChannelPopup( { setIsDisplay }: CreateChannelPopupProps )  {

    const [userListChannel, setUserListChannel] = useState<User[]>([]);
    const [channelName, setChannelName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [displayResults, setDisplayResults] = useState<boolean>(true);
    const [inputValue, setInputValue] = useState<string>("");
    const [channelType, setChannelType] = useState<string>("PUBLIC"); // État pour la valeur sélectionnée
    const [listUsersSearched, setListUsersSearched] = useState<User[] | null>([]);
    const [error, setError] = useState<string | null>(null);
    const [canSendApiCall, setCanSendApiCall] = useState<boolean>(true);

    const socket: Socket = useSocketContext();
    const userId: number = useUserIdContext();

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

    function isWhitespace(str: string): boolean {
        return /^\s*$/.test(str);
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
        try {
            if ((channelType === "PASSWORD_PROTECTED" && password.length < 6) ||
                (channelType === "PASSWORD_PROTECTED" && confirmPassword.length < 6)){
                setError("Channel password must be 6 characters minimum")
                return ;
            } else if ((channelType === "PASSWORD_PROTECTED") && (password.length !== confirmPassword.length || password !== confirmPassword)){
                setError("Password's doesnt match");
                return ;
            } else if (isWhitespace(channelName)){
                setError("Provide valid channel name");
                return ;
            }
            if (channelName.length < 1)
                setError("Channel name can't be empty");
            else{
                if (canSendApiCall === false)
                    return
                setCanSendApiCall(false);
                const participantsId: number [] = userListChannel.map(user => user.id);
                const channelIdCreated: number = await createChannel(channelName, password, participantsId, channelType, setChannelHeader, userId, socket);
                socket.emit("joinChannel", channelIdCreated);
                setIsDisplay([ false, false]);
            }
        } catch (error: any){
            setError(error.message);
        } finally {
            setCanSendApiCall(true);
        }
      };

    return (
        <div className={`popupChannelCreation`}>
            <div style={{ color: "red" }}>{error}</div>
            <div className="flex">
                <label>Type:</label>
                <select value={channelType} onChange={handleChannelTypeChange} name="" id="">
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="PASSWORD_PROTECTED">PASSWORD_PROTECTED</option>
                    <option value="PRIVATE">PRIVATE</option>
                </select>
            </div>
            {channelType === 'PASSWORD_PROTECTED' ? (
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
            <div className="flex">
                <h5>Channel Name</h5>
                <input value={channelName} onChange={handleChannelName} type="text" />
            </div>
            }
            <button onClick={callCreateChannel}>Create</button>
        </div>
    )   
}
export default CreateChannelPopup;