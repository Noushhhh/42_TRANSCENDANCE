import React from "react";
import "../styles/ContentMessage.css";
import HeaderChatBox from "./HeaderChatBox";
import ChatView from "./ChatView";
import ChatPrompt from "./ChatPrompt";

function ContentMessage() {
    return (
        <div className="ContentMessage">
            <HeaderChatBox />
            <ChatView />
            <ChatPrompt/>
        </div>
    )   
}

export default ContentMessage;