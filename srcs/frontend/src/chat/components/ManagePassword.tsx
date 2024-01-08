import React, { useState, ChangeEvent, useEffect } from "react";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { manageChannelPassword, manageChannelType, getChannelType } from "./ChannelUtils";
import ValidationButton from "./ValidationButton";

interface ManagePasswordProps {
    needReload: boolean,
}

function ManagePassword({ needReload }: ManagePasswordProps) {

    const [actualPassword, setActualPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [actualChannelType, setActualChannelType] = useState<string | null>(null);
    const [newChannelType, setNewChannelType] = useState<string>("PUBLIC");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const channelId: number = useChannelIdContext();

    const fetchChannelType = async () => {
        try {
            const channelType: string = await getChannelType(channelId);
            setActualChannelType(channelType);
            setNewChannelType(channelType);
        } catch (error: any) {
            setError(`error: ${error.message}`);
        }
    }

    useEffect(() => {

        if (needReload === true)
            fetchChannelType();
        setActualPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setError(null);
        setSuccess(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needReload]);

    const handleChannelTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
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
        setSuccess(null);
        setError(null);
        if ((newChannelType === "PASSWORD_PROTECTED") && (newPassword.length < 6)){
            setError("Password length is 6 characters minimum")
            return ;
        }
        if ((newChannelType === "PASSWORD_PROTECTED") && (newPassword !== confirmNewPassword)) {
            setError("passwords doesn't match");
            return;
        }
        try {
            if (actualChannelType === "PASSWORD_PROTECTED" || newChannelType === "PASSWORD_PROTECTED") {
                console.log("manage channel password")
                await manageChannelPassword(channelId, newChannelType, actualPassword, newPassword);
            }
            else if (newChannelType === "PUBLIC" || newChannelType === "PRIVATE"){
                await manageChannelType(channelId, newChannelType);
            }
            await fetchChannelType();
            setSuccess("credentials changed");
            setActualPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error: any) {
            setError(`${error.message}`);
        }
    }

    if (actualChannelType) {
        return (
            <div className={`ManagePassword`}>
                <div style={{ color: "red" }}>{error}</div>
                <div style={{ color: "green" }}>{success}</div>
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
    } else {
        return (
            <div>
                <div style={{ color: "red" }}>{error}</div>
                <div>loading...</div>
            </div>
        )
    }
}
export default ManagePassword;
