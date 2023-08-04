import React from "react";
import "../styles/PreviewUser.css";
import avatar from "./avatar_tdeville.jpeg"
import CloseIcon from '@mui/icons-material/Close';

interface PreviewUserProps {
    user: User;
    removeUserFromList: (input: User) => void;
}

function PreviewUser({ user, removeUserFromList }: PreviewUserProps): JSX.Element {

    const removeUser = (user: User) => {
        removeUserFromList(user);
    }

    return (
        <div className="PreviewUser">
            <span>
                <img className="previewUserAvatar" src={avatar} alt="" width={29} height={29} />
                {user.username} <CloseIcon className="icon" style={{ width: "14px" }} onClick={() => removeUser(user)} />
            </span>
        </div>
    )
}
export default PreviewUser;