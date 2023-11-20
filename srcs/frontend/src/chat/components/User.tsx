import React, { useState, useEffect } from "react";
import "../styles/SearchBar.css";
import "../styles/User.css";
import UserProfileMenu from "./UserProfileMenu";
import avatar from "./caf438ea-b608-40a3-8a58-f884190b2e9f.jpg"
import { getUserAvatar } from "../../home/tools/Api";

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

    const [error, setError] = useState<string | null>(null);

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
                    {<img className="avatar_image" src={`http://localhost:4000/${user.avatar}`} alt="" width={49} height={49}/>}
                </div>
                <div className="username">
                    {user.publicName && user.publicName}
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="User User2">
                <div>
                    {<img className="avatar_image" src={`http://localhost:4000/${user.avatar}`} alt="" width={49} height={49}/>}
                </div>
                <div className="username">
                    <UserProfileMenu user={user}/>
                </div>
            </div>
        )
    }
}
export default User;
