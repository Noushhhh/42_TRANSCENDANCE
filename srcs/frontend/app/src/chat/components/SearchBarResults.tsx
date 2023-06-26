import React, { useEffect } from "react"
import { useState } from "react";
import User from "./User";
import "../styles/SearchBar.css"

interface SearchBarResultsProps {
    inputValue: string;
    displayResults: boolean;
}

function SearchBarResults({ inputValue, displayResults }: SearchBarResultsProps) {

    const [listUsersSearched, setListUsersSearched] = useState<string[]>([]);

    const displayState = `${displayResults ? "DisplaySearchBarResults" : "HideSearchBarResults"}`;

    useEffect(() => {
        const fetchUsers = async () => {
            console.log("fetching...");
            setListUsersSearched([]);
            const response = await fetch(`http://localhost:4000/api/chat/getLoginsFromSubstring/${inputValue}`);
            const listUsers = await response.json();
            console.log(listUsers);
            setListUsersSearched(listUsers);
        }
        if (inputValue.length > 2)
            fetchUsers();
    }, ([inputValue]))

    console.log(inputValue);

    return (
        <div className={`SearchBarResults ${displayState}`}>
            <ul className="userListSearched">
                {listUsersSearched.map((user, index) => {
                    return <li key={index}>
                        <User username={user}/>
                    </li>
                })}
            </ul>
        </div>
    )
}
export default SearchBarResults;