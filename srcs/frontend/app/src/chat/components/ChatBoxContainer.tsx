import React, { useState } from "react";
import { io } from "socket.io-client";
import "../styles/ChatBoxContainer.css";
import MessageSide from "./MessageSide";
import ContentMessage from "./ContentMessage";
import SimulateUserId from "./SimulateUserId";
import { Socket } from "socket.io-client";
import "../types/type.Message";
import "../types/channel.type";

const socket = io("http://localhost:4000");

// const socket = io("http://localhost:4000", { 
//     auth: { userId: simulatedUserId },
//     withCredentials:true,
//  });


function ChatBoxContainer() {

    const [simulatedUserId, setSimulatedUserId] = useState<number>(2);
    const [selectedConversation, setConversationList] = useState<number>(1);
    const [channelId, setChannelId] = useState<number>(11);
    const [channelHeader, setChannelHeader] = useState<Channel[]>([]);

    socket.on('connect', () => {
        socket.emit('setNewUserConnected', simulatedUserId);
    });

    console.log(`logged with userId: ${simulatedUserId}`);

    return (
        <div>
            <SimulateUserId setSimulatedUserId={setSimulatedUserId} />
            <div className="ChatBoxContainer">
                <div className="MessageContainer">
                    <MessageSide channelHeader={channelHeader} setChannelHeader={setChannelHeader} simulatedUserId={simulatedUserId} setChannelId={setChannelId} channelId={channelId} socket={socket} />
                    <ContentMessage channelHeader={channelHeader} userId={simulatedUserId} socket={socket} simulatedUserId={simulatedUserId} conversation={selectedConversation} channelId={channelId} />
                </div>
            </div>
        </div>
    );

}

export default ChatBoxContainer;