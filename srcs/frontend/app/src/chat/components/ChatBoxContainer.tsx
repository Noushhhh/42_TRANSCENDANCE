import React, { useState } from "react";
import { io } from "socket.io-client";
import "../styles/ChatBoxContainer.css";
import MessageSide from "./MessageSide";
import ContentMessage from "./ContentMessage";
import SimulateUserId from "./SimulateUserId";
import { Socket } from "socket.io-client";
import "../types/type.Message";

const socket = io("http://localhost:4000");

// const socket = io("http://localhost:4000", { 
//     auth: { userId: simulatedUserId },
//     withCredentials:true,
//  });

function ChatBoxContainer() {

    const [simulatedUserId, setSimulatedUserId] = useState<number>(1);
    const [selectedConversation, setConversationList] = useState<number>(1);
    const [channelId, setChannelId] = useState<number>(11);

    socket.on('connect', () => {
        socket.emit('setNewUserConnected', simulatedUserId);
    });

    return (
        <div>
            <SimulateUserId setSimulatedUserId={setSimulatedUserId} />
            <div className="ChatBoxContainer">
                <div className="MessageContainer">
                    <MessageSide simulatedUserId={simulatedUserId} setChannelId={setChannelId} channelId={channelId} socket={socket} />
                    <ContentMessage userId={simulatedUserId} socket={socket} simulatedUserId={simulatedUserId} conversation={selectedConversation} channelId={channelId} />
                </div>
            </div>
        </div>
    );

}

export default ChatBoxContainer;