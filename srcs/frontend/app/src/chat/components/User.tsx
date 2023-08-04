import React from "react";
import "../styles/SearchBar.css";
import "../styles/User.css";
import FadeMenu from "./FadeMenu";
import { useUserIdContext } from "../contexts/userIdContext";
import avatar from "./avatar_tdeville.jpeg"

interface UserProps {
    user: User;
    showUserMenu: boolean;
    addUserToList: (user: User) => void;
}

function User({ user, showUserMenu, addUserToList }: UserProps) {

    const userId = useUserIdContext();

    const addUser = (user: User) => {
        addUserToList(user);
    }

    if (!showUserMenu) {
        return (
            <div className="User User1" onClick={() => { addUser(user) }}>
                <div className="Container_avatar">
                    <img className="avatar_image" src={avatar} alt="" width={49} height={49}/>
                </div>
                <div className="username">
                    {user.username}
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="User User2">
                <div>
                    <img className="avatar_image" src={avatar} alt="" width={49} height={49}/>
                </div>
                <div className="username">
                    <FadeMenu user={user}/>
                </div>
            </div>
        )
    }
}
export default User;