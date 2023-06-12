import React from "react";
import "../styles/MessageSide.css";
import MessageToClick from "./MessageToClick";

function MessageSide() {
    return (
        <div className="MessageSide">
            <MessageToClick/>
            <MessageToClick/>
        </div>
    )   
}

export default MessageSide;