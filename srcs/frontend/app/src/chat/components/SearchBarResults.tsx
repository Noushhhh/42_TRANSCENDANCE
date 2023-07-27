import React, { useEffect } from "react"
import { useState } from "react";
import User from "./User";
import "../styles/SearchBar.css"

interface SearchBarResultsProps {
    inputValue: string;
    displayResults: boolean;
    showUserMenu: boolean;
    addUserToList: (user: {username: string, id: number}) => void;
    simulatedUserId: number;
}

function SearchBarResults({ inputValue, displayResults, showUserMenu, addUserToList, simulatedUserId }: SearchBarResultsProps) {

    const [listUsersSearched, setListUsersSearched] = useState<{username: string, id: number}[]>([]);

    const displayState = `${displayResults ? "DisplaySearchBarResults" : "HideSearchBarResults"}`;

    useEffect(() => {
        const fetchUsers = async () => {
            setListUsersSearched([]);
            const response = await fetch(`http://localhost:4000/api/chat/getLoginsFromSubstring/${inputValue}`);
            const listUsers: {username: string, id:number}[] = await response.json();
            const filteredListUsers = listUsers.filter((user:{username: string, id:number}) => user.id !== simulatedUserId);
            setListUsersSearched(filteredListUsers);
        }
        if (inputValue.length > 2)
            fetchUsers();
    }, ([inputValue]))

    return (
        <div className={`SearchBarResults ${displayState}`}>
            <ul className="userListSearched">
                {listUsersSearched.map((user, index) => {
                    return <li key={index}>
                        <User user={user} showUserMenu={showUserMenu} addUserToList={addUserToList} simulatedUserId={simulatedUserId}/>
                    </li>
                })}
            </ul>
        </div>
    )
}
export default SearchBarResults;