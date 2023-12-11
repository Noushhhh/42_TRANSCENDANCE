import React, { useState, useRef, ChangeEvent } from "react";
import ValidationButton from "./ValidationButton";
import { useUserIdContext } from "../contexts/userIdContext";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { fetchUser, joinProtectedChannel } from "./ChannelUtils";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useSocketContext } from "../contexts/socketContext";
import "../styles/JoinChannel.css";

interface JoinProtectedChannelProps {
    setStateMessageToClick: React.Dispatch<React.SetStateAction<boolean[]>>;
    channelId: number | undefined;
}

function JoinProtectedChannel({ setStateMessageToClick, channelId }: JoinProtectedChannelProps) {

    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    const userId: number = useUserIdContext();
    const setChannelHeader = useSetChannelHeaderContext();
    const socket = useSocketContext();

    const handleClick = async () => {
        setError(null);
        if (password.length < 6) {
            setError("Password is at least 6 characters");
        }
        try {
            if (channelId) {
                if (await joinProtectedChannel(channelId, userId, password)){
                    socket.emit("joinChannel", channelId);
                    await fetchUser(setChannelHeader, userId, socket);
                    setStateMessageToClick([false, false]);
                } else {
                    setError("Wrong password");
                }
            }
        } catch (error: any) {
            setError(error.message);
        }
    }


    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && inputRef.current) {
            handleClick();
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const updatedPassword: string = event.target.value;
        setPassword(updatedPassword);
    }

    return (
        <div className="containerJoinChannel">
            <div>
                <p style={{ color: "red" }}>
                    {error}
                </p>
                <p className="fontColorWhite">Enter password:</p>
                <input ref={inputRef} onKeyDown={handleKeyDown} value={password} onChange={handleChange} type="text" />
            </div>
            <div>
                <ValidationButton action={handleClick}
                    size={{ height: 40, width: 200 }}
                    position={{ top: 0, left: 0 }} />
            </div>
        </div>
    )
}

export default JoinProtectedChannel;