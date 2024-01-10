import React, { useState, useRef, ChangeEvent } from "react";
import ValidationButton from "./ValidationButton";
import "../styles/JoinChannel.css";
import { fetchUser, joinChannel, isUserIsBan } from "./ChannelUtils";
import { useUserIdContext } from "../contexts/userIdContext";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useSocketContext } from "../contexts/socketContext";
import JoinProtectedChannel from "./JoinProtectedChannel";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

enum ChannelType {
    PUBLIC,
    PRIVATE,
    PASSWORD_PROTECTED,
}

interface isChannelExist {
    isExist: boolean,
    channelType: ChannelType,
    id: number,
}

interface JoinChannelProps {
    setStateMessageToClick: React.Dispatch<React.SetStateAction<boolean[]>>;
}

function JoinChannel({ setStateMessageToClick }: JoinChannelProps) {

    const [error, setError] = useState<string | null>(null);
    const [apiResponse, setApiResponse] = useState<isChannelExist | null>(null);
    const [displayPasswordInput, setDisplayPasswordInput] = useState<boolean>(false);
    const [channelNameDto, setChannelNameDto] = useState<{channelName: string}>({ channelName: '' });
    const inputRef = useRef<HTMLInputElement | null>(null);

    const userId: number = useUserIdContext();
    const setChannelHeader = useSetChannelHeaderContext();
    const socket = useSocketContext();

    const handleClick = async () => {
        try {
            if (apiResponse) {
                if (await isUserIsBan(apiResponse.id, userId) === true) {
                    setError("You are banned from this channel");
                    return ;
            }
            let channelType: { channelType: ChannelType; channelId: number; } | null = null;
            try {
                channelType = await joinChannel(apiResponse, userId);
            } catch (error: any){
                setError(error.message);
            }
            if ( ! channelType)
                return ;
            switch (channelType.channelType.toString()) {
                case "PUBLIC":
                    setStateMessageToClick([false, false]);
                    socket.emit("joinChannel", channelType.channelId);
                    await fetchUser(setChannelHeader, userId, socket);
                    break;
                case "PRIVATE":
                    setError("You can't join private channel");
                    break;
                case "PASSWORD_PROTECTED":
                    setDisplayPasswordInput(true);
                    break;
                }
        }
        else {
            setError("Channel doesnt exist");
        }
        } catch (error: any){
            setError(error.message);
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && inputRef.current) {
            if (!apiResponse)
                setError("Invalid channel name");
            handleClick();
        }
    }

    const handleChangeName = async (event: ChangeEvent<HTMLInputElement>) => {
        const updatedChannelName: string = event.target.value;
        setChannelNameDto({
            ...channelNameDto,
            channelName: updatedChannelName,
        });
        try {
            setError(null);
            setApiResponse(null);
            const response: Response = await fetch(`${API_BASE_URL}/api/chat/isChannelNameExist`, {
                method: "POST",
                credentials: 'include',
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ channelName: updatedChannelName })
              });
            if (!response.ok){
                const errorData = await response.json();
                setError(errorData.message || 'An error occurred');
                return ;
            }
            const data = await response.json();
            if (response.status === 201) {
                setApiResponse(data);
            } else {
                setError('Error');
            }
        } catch (error) {
        }
    }

    return (
        <div className="containerJoinChannel fontColorWhite">
            <div>
                <p style={{ color: "red" }}>
                    {error}
                </p>

                {displayPasswordInput ?

                    <JoinProtectedChannel setStateMessageToClick={setStateMessageToClick} channelId={apiResponse?.id} />
                    :
                    <div className="joinChannelBox">
                        <p>Channel name:</p>
                        <input ref={inputRef} onKeyDown={handleKeyDown} type="text" value={channelNameDto.channelName} onChange={handleChangeName} />
                        <ValidationButton action={handleClick}
                            size={{ height: 40, width: 200 }}
                            position={{ top: 0, left: 0 }} />
                    </div>

                }
            </div>
            <div>
            </div>
        </div>
    )
}

export default JoinChannel;