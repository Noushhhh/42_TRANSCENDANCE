import React from "react";
import "../styles/SearchBar.css";
import "../styles/User.css";
import UserProfileMenu from "./UserProfileMenu";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

    const onChange = () => {
    }

    if (!user.publicName)
        return <div></div>

    if (!showUserMenu) {
        return (
            <div className={`User User1 ${showAdmin?.isAdmin ? "clickable-div" : ""}`} onClick={() => {
                    addUser(user);
            }}>
                <div className="Container_avatar">
                    {showAdmin?.show ? ( 
                        <div>
                            <input type="checkbox" id={`myCheckbox-${user.id}`} className="checkboxSearchBar"onChange={onChange} checked={showAdmin?.isAdmin} />
                            <label htmlFor={`myCheckbox-${user.id}`}></label>
                        </div>
                    ) : null}
                    {<img className="avatar_image" src={`${API_BASE_URL}/${user.avatar}`} alt="" width={49} height={49}/>}
                </div>
                <div className="username" style={{overflow:"hidden"}} title={user.publicName}>
                    {user.publicName ? user.publicName && user.publicName : null}
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="User User2">
                <div>
                    {<img className="avatar_image" src={`${API_BASE_URL}/${user.avatar}`} alt="" width={49} height={49}/>}
                </div>
                <div className="username" style={{overflow:"hidden"}} title={user.publicName}>
                    <UserProfileMenu user={user}/>
                </div>
            </div>
        )
    }
}
export default User;
