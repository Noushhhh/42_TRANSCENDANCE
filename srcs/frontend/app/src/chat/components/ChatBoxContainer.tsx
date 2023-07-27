import React, { useState } from "react";
import { io } from "socket.io-client";
import "../styles/ChatBoxContainer.css";
import MessageSide from "./MessageSide";
import ContentMessage from "./ContentMessage";
import ChannelInfo from "./ChannelInfo";
import { ChannelIdContext } from "../contexts/channelIdContext";
import { ChannelHeaderContext } from "../contexts/channelHeaderContext";
import { SocketContext } from "../contexts/socketContext";

const socket = io("http://localhost:4000");

function ChatBoxContainer() {

    const [simulatedUserId, setSimulatedUserId] = useState<number>(1);
    const [channelId, setChannelId] = useState<number>(-1);
    const [channelHeader, setChannelHeader] = useState<Channel[]>([]);
    const [channelInfo, setChannelInfo] = useState<boolean>(false);

    socket.on('connect', () => {
        socket.emit('setNewUserConnected', simulatedUserId);
    });

    return (
        <div>
            {/* <SimulateUserId setSimulatedUserId={setSimulatedUserId} /> */}
            <div className="ChatBoxContainer">
                <div className="MessageContainer">
                    <ChannelIdContext.Provider value={{ channelId, setChannelId }}>
                    <SocketContext.Provider value={socket}>
                    <ChannelHeaderContext.Provider value={{ channelHeader, setChannelHeader }}>
                        <MessageSide simulatedUserId={simulatedUserId} />
                        <ContentMessage channelInfo={channelInfo} setChannelInfo={setChannelInfo} userId={simulatedUserId} simulatedUserId={simulatedUserId} />
                    </ChannelHeaderContext.Provider>
                    </SocketContext.Provider>
                    </ChannelIdContext.Provider>
                    <ChannelInfo isChannelInfoDisplay={channelInfo} />
                </div>
            </div>
        </div>
    );

}

export default ChatBoxContainer;