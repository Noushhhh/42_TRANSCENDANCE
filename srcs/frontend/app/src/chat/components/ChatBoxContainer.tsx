import React, { useState } from "react";
import "../styles/ChatBoxContainer.css";
import MessageSide from "./MessageSide";
import ContentMessage from "./ContentMessage";

function ChatBoxContainer() {

    const [selectedConversation, setConversationList] = useState<number>(1);
    const [channelId, setChannelId] = useState<number>(-1);

    console.log(channelId);

    const changeSelectedChannelid = (id: number) => {
        setChannelId(10);
    }

    return (
        <div className="ChatBoxContainer">
            <div className="MessageContainer">
                <MessageSide onSelectConversation={setConversationList} setChannelId={setChannelId} />
                <ContentMessage conversation={selectedConversation} channelId={channelId}/>
            </div>
            <button onClick={() => {changeSelectedChannelid(10)}}></button>
        </div>
    );

}

export default ChatBoxContainer;