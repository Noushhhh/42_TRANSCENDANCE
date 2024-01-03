import React from "react";
import "../styles/SearchBar.css";
import "../styles/User.css";
import UserProfileMenu from "./UserProfileMenu";

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
                            <input type="checkbox" id={`myCheckbox-${user.id}`} className="checkboxSearchBar" checked={showAdmin?.isAdmin} />
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
