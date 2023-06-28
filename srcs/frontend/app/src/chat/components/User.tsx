import React, { useState } from "react";
import "../styles/SearchBar.css";
import "../styles/User.css";
import FadeMenu from "./FadeMenu";

interface UserProps {
    user: {
        username: string,
        id: number,
    }
    showUserMenu: boolean;
    addUserToList: (user: { username: string, id: number }) => void;
}

function User({ user, showUserMenu, addUserToList }: UserProps) {

    const addUser = (user: { username: string, id: number }) => {
        addUserToList(user);
    }

    if (!showUserMenu) {
        return (
            <p className="User" onClick={() => { addUser(user) }}>
                {user.username}
            </p>
        )
    }
    else {
        return (
            <FadeMenu user={user} />
        )
    }
}
export default User;