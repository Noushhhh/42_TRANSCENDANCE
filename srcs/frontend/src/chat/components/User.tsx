import React, { useState } from "react";
import "../styles/SearchBar.css";
import "../styles/User.css";
import UserProfileMenu from "./UserProfileMenu";
import { useUserIdContext } from "../contexts/userIdContext";
import avatar from "./avatar_tdeville.jpeg"
import { useChannelIdContext } from "../contexts/channelIdContext";

interface UserProps {
    user: User;
    showUserMenu: boolean;
    addUserToList: (user: User) => void;
    showAdmin?: {
        show: boolean,
        isAdmin: boolean,
    }
    updateUserAdminList?: (user: User) => void;
}

function User({ user, showUserMenu, addUserToList, showAdmin, updateUserAdminList }: UserProps) {

    const userId: number = useUserIdContext();
    const channelId: number = useChannelIdContext();

    const handleDivClick = () => {
        console.log("run here ?");
    };

    const addUser = (user: User) => {
        if (updateUserAdminList && showAdmin){
            updateUserAdminList(user);
            return;
        }
        addUserToList(user);
    }

    if (!showUserMenu) {
        return (
            <div className={`User User1 ${showAdmin?.isAdmin ? "clickable-div" : ""}`} onClick={() => {
                    addUser(user);
            }}>
                <div className="Container_avatar">
                    {showAdmin?.show ? ( 
                        <div>
                            <input type="checkbox" id={`myCheckbox-${user.id}`} className="checkboxSearchBar" checked={showAdmin?.isAdmin} onChange={handleDivClick} />
                            <label htmlFor={`myCheckbox-${user.id}`}></label>
                        </div>
                    ) : null}
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
                    <UserProfileMenu user={user}/>
                </div>
            </div>
        )
    }
}
export default User;
