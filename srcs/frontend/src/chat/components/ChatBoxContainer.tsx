import React, { useState } from "react";
import { io } from "socket.io-client";
import "../styles/ChatBoxContainer.css";
import MessageSide from "./MessageSide";
import ContentMessage from "./ContentMessage";
import ChannelInfo from "./ChannelInfo";
import { ChannelIdContext } from "../contexts/channelIdContext";
import { ChannelHeaderContext } from "../contexts/channelHeaderContext";
import { SocketContext } from "../contexts/socketContext";
import { UserIdContext } from "../contexts/userIdContext";

const socket = io("http://localhost:4000");

function ChatBoxContainer() {

    const [simulatedUserId] = useState<number>(1);
    const [channelId, setChannelId] = useState<number>(-1);
    const [channelHeader, setChannelHeader] = useState<Channel[]>([]);
    const [channelInfo, setChannelInfo] = useState<boolean>(false);

    socket.on('connect', () => {
        socket.emit('setNewUserConnected', simulatedUserId);
    });

    return (
            <div className="ChatBoxContainer">
                <div className="MessageContainer">
                    <ChannelIdContext.Provider value={{ channelId, setChannelId }}>
                    <SocketContext.Provider value={socket}>
                    <ChannelHeaderContext.Provider value={{ channelHeader, setChannelHeader }}>
                    <UserIdContext.Provider value={simulatedUserId}>
                        <MessageSide />
                        <ContentMessage channelInfo={channelInfo} setChannelInfo={setChannelInfo} userId={simulatedUserId} simulatedUserId={simulatedUserId} />
                        <ChannelInfo isChannelInfoDisplay={channelInfo} setChannelInfo={setChannelInfo}/>
                    </UserIdContext.Provider>
                    </ChannelHeaderContext.Provider>
                    </SocketContext.Provider>
                    </ChannelIdContext.Provider>
                </div>
            </div>
    );

}

export default ChatBoxContainer;