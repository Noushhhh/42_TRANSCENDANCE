import React, { useState, useRef, ChangeEvent } from "react";
import axios from "axios";
import ValidationButton from "./ValidationButton";
import { ChannelNameDto } from "../../../../backend/src/chat/dto/chat.dto";
import "../styles/JoinChannel.css";
import { fetchUser, joinChannel, isUserIsBan } from "./ChannelUtils";
import { useUserIdContext } from "../contexts/userIdContext";
import { useSetChannelHeaderContext } from "../contexts/channelHeaderContext";
import { useSocketContext } from "../contexts/socketContext";
import JoinProtectedChannel from "./JoinProtectedChannel";

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
    const [channelNameDto, setChannelNameDto] = useState<ChannelNameDto>({ channelName: '' });
    const inputRef = useRef<HTMLInputElement | null>(null);

    const userId: number = useUserIdContext();
    const setChannelHeader = useSetChannelHeaderContext();
    const socket = useSocketContext();

    const handleClick = async () => {
        if (apiResponse) {
            if (await isUserIsBan(apiResponse.id, userId) === true) {
                setError("You are banned from this channel");
            }
            const channelType: ChannelType = await joinChannel(apiResponse, userId);
            switch (channelType.toString()) {
                case "PUBLIC":
                    setStateMessageToClick([false, false]);
                    await fetchUser(setChannelHeader, userId, socket);
                    break;
                case "PRIVATE":
                    setError("You can't join private channel");
                    break;
                case "PASSWORD_PROTECTED":
                    setDisplayPasswordInput(true);
                    break;
                default:
                    console.log('invalid channel type: ', channelType);
            }
        }
        else {
            setError("Channel doesnt exist");
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
            const response = await axios.post('http://localhost:4000/api/chat/isChannelNameExist',
                { channelName: updatedChannelName });
            if (response.status === 201) {
                response.data.isExist ? setApiResponse(response.data) : null;
            } else if (response.status === 400) {
                setError('invalid charater');
            }
            else {
                setError('Error');
            }
        } catch (error) {
            setError('Invalid character');
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
                    <div>
                        <p>Enter channel name:</p>
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