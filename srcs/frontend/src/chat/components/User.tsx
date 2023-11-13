import React, { useState, useEffect } from "react";
import "../styles/SearchBar.css";
import "../styles/User.css";
import UserProfileMenu from "./UserProfileMenu";
import avatar from "./avatar_tdeville.jpeg"
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
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const fetchUserAvatar = async (): Promise<void> => {
      const userAvatarResultFromBack = await getUserAvatar();
      if (userAvatarResultFromBack) {
        setAvatarUrl(userAvatarResultFromBack);
      } else {
        setError('There was an error fetching the avatar, please contact the system administrator');
      }
    }

    useEffect(() => {
    
        Promise.all([fetchUserAvatar()])
          .catch(() => setError("error fetching avatar")); // Also set showLoading to false if there's an error
      }, []);

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
                    {avatarUrl && <img className="avatar_image" src={avatarUrl} alt="" width={49} height={49}/>}
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
                    {avatarUrl && <img className="avatar_image" src={avatarUrl} alt="" width={49} height={49}/>}
                </div>
                <div className="username">
                    <UserProfileMenu user={user}/>
                </div>
            </div>
        )
    }
}
export default User;
