import React, { useState, ChangeEvent } from "react";
import "../styles/PreviewUser.css";
import avatar from "./avatar_tdeville.jpeg"
import CloseIcon from '@mui/icons-material/Close';
import ValidationButton from "./ValidationButton";

interface PreviewUserProps {
    user: User;
    removeUserFromList: (input: User) => void;
    mutedMode?: boolean;
    mutedUntil?: string;
    setMutedUntil?: React.Dispatch<React.SetStateAction<string>>;
}

function PreviewUser({ user, removeUserFromList, mutedMode, mutedUntil, setMutedUntil }: PreviewUserProps): JSX.Element {

    // const [mutedUntilDate, setMutedUntilDate] = useState('');

    const removeUser = (user: User) => {
        removeUserFromList(user);
    }

    const handleDatetimeChange = (event: ChangeEvent<HTMLInputElement>) => {
        console.log(mutedUntil);
        if (setMutedUntil)
            setMutedUntil(event.target.value);
    };

    const callSetMutedUntil = async () => {

    }

    if (mutedMode) {
        return (
            <div className="PreviewUser MutedMode fadeIn">
                <span className="SpanMutedMode">
                    <img className="previewUserAvatar previewMutedMode" src={avatar} alt="" width={29} height={29} />
                    {user.username} <CloseIcon className="icon" style={{ width: "14px" }} onClick={() => removeUser(user)} />
                </span>
                <div style={{display:"flex", flexDirection:"column"}}>
                    <p>Muted until:</p>
                    <input onChange={handleDatetimeChange} value={mutedUntil} className="form-control" type="datetime-local" />
                </div>
            </div>
        )
    }

    return (
        <div className="PreviewUser fadeIn">
            <span>
                <img className="previewUserAvatar" src={avatar} alt="" width={29} height={29} />
                {user.username} <CloseIcon className="icon" style={{ width: "14px" }} onClick={() => removeUser(user)} />
            </span>
        </div>
    )
}
export default PreviewUser;