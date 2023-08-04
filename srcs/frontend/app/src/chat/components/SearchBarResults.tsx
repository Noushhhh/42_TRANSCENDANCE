import React, { useEffect } from "react"
import { useState } from "react";
import User from "./User";
import "../styles/SearchBar.css"
import { useUserIdContext } from "../contexts/userIdContext";
import { getUsernamesBySubstring, getUsernamesInChannelFromSubstring } from "./ChannelUtils";
import { useChannelIdContext } from "../contexts/channelIdContext";

interface SearchBarResultsProps {
    inputValue: string;
    displayResults: boolean;
    showUserMenu: boolean;
    addUserToList: (user: User) => void;
    onlySearchInChannel: boolean;
}

function SearchBarResults({ inputValue, displayResults, showUserMenu, addUserToList, onlySearchInChannel }: SearchBarResultsProps) {

    const [listUsersSearched, setListUsersSearched] = useState<User[] | null>([]);
    const [error, setError] = useState<string | null>(null);

    const userId: number = useUserIdContext();
    const channelId: number = useChannelIdContext();

    const displayState = `${displayResults ? "DisplaySearchBarResults" : "HideSearchBarResults"}`;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setListUsersSearched([]);
                let users: User[] | null;
                if (onlySearchInChannel === true)
                    users = await getUsernamesInChannelFromSubstring(channelId, inputValue);
                else
                    users  = await getUsernamesBySubstring(userId, inputValue);
                if (!users)
                    setError("error while fetching data");
                setListUsersSearched(users);
                setError(null);
            } catch (error){
                setError("error fetching data");
            }
        }
        if (inputValue.length > 2)
            fetchUsers();
    }, ([inputValue]))

    return (
        <div className={`SearchBarResults ${displayState}`}>
            <p style={{color:"red"}}>
                {error}
            </p>
            <ul className="userListSearched">
                {listUsersSearched && listUsersSearched.map((user, index) => {
                    return <li key={index}>
                        <User user={user} showUserMenu={showUserMenu} addUserToList={addUserToList} />
                    </li>
                })}
            </ul>
        </div>
    )
}
export default SearchBarResults;