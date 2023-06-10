import React from "react";
import "../styles/ChatBoxContainer.css";
import MessageSide from "./MessageSide";
import ContentMessage from "./ContentMessage";

function ChatBoxContainer() {

    return (
        <div className="ChatBoxContainer">
            <div className="MessageContainer">
                <MessageSide />
                <ContentMessage />
            </div>
        </div>
    );

}

export default ChatBoxContainer;