import React from "react";
import "../styles/PreviewUser.css";

interface PreviewUserProps{
    user: {
        username: string,
        id: number,
    }
    removeUserFromList: (input: {username: string, id: number}) => void;
}

function PreviewUser( { user, removeUserFromList }: PreviewUserProps): JSX.Element{

    const removeUser = (user:{username: string, id: number,}) => {
        removeUserFromList(user);
    }

    console.log(user);

    return (
        <div className="PreviewUser">
            {user.username} <button onClick={()=> removeUser(user)}>X</button>
        </div>
    )
}
export default PreviewUser;