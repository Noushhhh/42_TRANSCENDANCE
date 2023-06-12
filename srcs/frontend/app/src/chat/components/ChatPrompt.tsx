import React from "react";
import "../styles/ChatPrompt.css"
import SendIcon from '@mui/icons-material/Send';

function ChatPrompt() {
    return (
        <div className="ChatPrompt">
            <input className="InputChatPrompt" type="text"/>
            <span className="SendIconPromptChat"><SendIcon/></span>
        </div>
    )   
}

export default ChatPrompt;