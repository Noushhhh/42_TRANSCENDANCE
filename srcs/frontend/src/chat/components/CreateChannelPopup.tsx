import React, { ChangeEvent, useState, useEffect } from "react";
import "../styles/CreateChannelPopup.css";
import SearchBar from "./SearchBar";
import SearchBarResults from "./SearchBarResults";
import PreviewUser from "./PreviewUser";
import axios from "axios";
import "../types/channel.type";
import SimulateUserId from "./SimulateUserId";

interface CreateChannelPopupProps{
    fetchUser: () => Promise<void>;
    displayState: string;
    simulatedUserId: number;
}

function CreateChannelPopup( { fetchUser, displayState, simulatedUserId }: CreateChannelPopupProps) {

    const [userListChannel, setUserListChannel] = useState<{username: string, id: number}[]>([]);
    const [channelName, setChannelName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [displayResults, setDisplayResults] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [channelType, setChannelType] = useState<string>("PUBLIC"); // État pour la valeur sélectionnée

    const handleChannelName = (event: ChangeEvent<HTMLInputElement>) => {
        setChannelName(event.target.value);
    }

    console.log(channelType);

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

    const addUserToList = (user: {username: string, id: number}) => {
        if (checkIfAlreadyInList(user.username))
            return ;
        setUserListChannel(prevState => [...prevState, user]);
    }

    const removeUserFromList = (input: {username: string, id: number}) => {
        setUserListChannel((prevUserListChannel) =>
        prevUserListChannel.filter((username) => username !== input)
      );
    }

    const createChannel = async () => {

        const channelToAdd  = {
            name: channelName,
            password,
            ownerId: simulatedUserId,
            participants: userListChannel.map(user => user.id),
            type: channelType,
        };

        try {
          const response = await axios.post('http://localhost:4000/api/chat/addChannelToUser', channelToAdd);
          console.log('Channel created successfully');
          fetchUser();
          // Traitez la réponse du backend ici si nécessaire
        } catch (error) {
          console.error('Error creating channel:', error);
          // Gérez l'erreur ici
        }
      };

    return (
        <div className={`popupChannelCreation ${displayState}`}>
            <h2>CREATE CHANNEL</h2>
            <div className="flex">
                <label>Type de channel:</label>
                <select value={channelType} onChange={handleChannelTypeChange} name="" id="">
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="PROTECTED">PROTECTED</option>
                    <option value="PRIVATE">PRIVATE</option>
                </select>
            </div>
            {channelType === 'PROTECTED' || channelType === 'PRIVATE' ? (
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
            <SearchBarResults inputValue={inputValue} displayResults={displayResults} showUserMenu={false} addUserToList={addUserToList}/>
            <h3>User List</h3>
            <div className="userList">
                {userListChannel.map((user, index) => {
                    return <PreviewUser key={index} removeUserFromList={removeUserFromList} user={user} />
                })}
            </div>
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
            <button onClick={createChannel}>Create</button>
        </div>
    )   
}

export default CreateChannelPopup;