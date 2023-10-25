import React, { useState, ChangeEvent, useEffect } from "react";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { manageChannelPassword, manageChannelType, getChannelType } from "./ChannelUtils";
import ValidationButton from "./ValidationButton";

function ManagePassword() {

    const [actualPassword, setActualPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [actualChannelType, setActualChannelType] = useState<string>("PUBLIC");
    const [newChannelType, setNewChannelType] = useState<string>("PUBLIC");
    const [error, setError] = useState<string | null>(null);

    const channelId: number = useChannelIdContext();

    useEffect(() => {
        const fetchChannelType = async () => {
            try {
                console.log('fetching...');
                const channelType: string = await getChannelType(channelId);
                setActualChannelType(channelType);
                setNewChannelType(channelType);
            } catch (error) {
                setError("Error fetching channel type");
            }
        }
        fetchChannelType();
    }, []);

    const handleChannelTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        /*setNewPassword("");
        setConfirmNewPassword("");
        setActualPassword("");*/
        setNewChannelType(event.target.value);
    };

    const handleActualPassword = (event: ChangeEvent<HTMLInputElement>) => {
        setActualPassword(event.target.value);
    }

    const handleNewPassword = (event: ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    }

    const handleConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => {
        setConfirmNewPassword(event.target.value);
    }

    const callManageChannelPassword = async () => {
        if ( (newChannelType === "PASSWORD_PROTECTED") && (newPassword !== confirmNewPassword) ) {
            setError("passwords doesn't match");
            return;
        }
        try {
            if (newChannelType === "PASSWORD_PROTECTED") {
                console.log("manage channel password")
                await manageChannelPassword(channelId, newChannelType, actualPassword, newPassword);
            }
            else if (newChannelType === "PUBLIC" || newChannelType === "PRIVATE")
                await manageChannelType(channelId, newChannelType);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className={`ManagePassword`}>
            <div style={{ color: "red" }}>{error}</div>
            <label>Change type:</label>
            <select value={newChannelType} onChange={handleChannelTypeChange} name="" id="">
                <option value="PUBLIC">PUBLIC</option>
                <option value="PASSWORD_PROTECTED">PASSWORD_PROTECTED</option>
                <option value="PRIVATE">PRIVATE</option>
            </select>
            {actualChannelType === "PASSWORD_PROTECTED" ?
            <div className="flex">
                <h5>Actual password</h5>
                <input value={actualPassword} onChange={handleActualPassword} type="password" />
            </div> : null}
            {(newChannelType === "PASSWORD_PROTECTED") ?
                <div>
                    <div className="flex">
                        <h5>New password</h5>
                        <input value={newPassword} onChange={handleNewPassword} type="password" />
                    </div>
                    <div className="flex">
                        <h5>Confirm new password</h5>
                        <input value={confirmNewPassword} onChange={handleConfirmPassword} type="password" />
                    </div>
                </div> : null}
            <ValidationButton action={callManageChannelPassword}
                size={{ height: 50, width: 50 }}
                position={{ top: 0, left: 0 }} />
        </div>
    )
}
export default ManagePassword;
