import React from "react";
import "../styles/SearchBar.css";
import "../styles/User.css"

interface UserProps{
    username: string;
}

function User( {username}: UserProps ){

    return (
        <p className="User">
            {username}
        </p>
    )
}
export default User;