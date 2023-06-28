import React, { useState } from "react";
import "../styles/SearchBar.css";
import "../styles/User.css";

interface UserProps {
    user:{
        username: string,
        id: number,
    }
    showUserMenu: boolean;
    addUserToList: (user: {username: string, id: number}) => void;
}

function User({ user, showUserMenu, addUserToList }: UserProps) {

    const userMenu = ['Message privé', 'Bloquer', 'Creer channel', 'Jouer', 'Profil'];
    const [settingsMenu, setSettingsMenu] = useState<boolean>(false);

    const displayState = `${settingsMenu ? "displaySettingsMenu" : "hideSettingsMenu"}`;

    const handleClick = () => {
        settingsMenu === false ? setSettingsMenu(true) : setSettingsMenu(false);
        console.log(displayState);
    }

    const addUser = (user: {username: string, id: number}) => {
        addUserToList(user);
    }

    const handleClickList = (item: string) => {
    }

    if (!showUserMenu)
    {
        return (
        <p className="User" onClick={()=> {addUser(user)}}>
            {user.username}
        </p>
        )
    }
    else{
        return (
            <div>
            <p className="User" onClick={handleClick}>
                {user.username}
            </p>
            <div className={`settingsMenu ${displayState}`}>
                <ul>
                    {userMenu.map((element, index) => {
                        return <li onClick={() => {handleClickList(element)}} key={index}>{element}</li>
                    })}
                </ul>
            </div>
        </div>
    )
    }
}
export default User;