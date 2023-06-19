import React, { ChangeEvent, useState } from "react";
import "../styles/ChatPrompt.css"
import SendIcon from '@mui/icons-material/Send';
import { io, Socket } from "socket.io-client";

const socket = io("http://localhost:4000");

interface ChatPromptProps{
  addMessage:(newMessage: string, messageType: string) => void;
}

function ChatPrompt({addMessage}: ChatPromptProps): JSX.Element {

	const [message, setMessage] = useState("");

	const handleMessageChange = (event: ChangeEvent<HTMLInputElement>): void =>{
		setMessage(event.target.value);
	}

	function isWhitespace(str: string): boolean {
		return /^\s*$/.test(str);
	}

	const sendMessage = () => {
		if ( ! isWhitespace(message))
			addMessage(message, "MessageTo");
		socket.emit('message', message);
		setMessage("");
	}

	socket.on('message', function(id, data){
		if (socket.id == id || isWhitespace(data))
			return ;
		addMessage(data, "MessageFrom");
		setMessage("");
	})

    return (
        <div className="ChatPrompt">
            <input	value={message}
					className="InputChatPrompt"
					onChange={handleMessageChange} 
					type="text"/>
            <button className="SendIconPromptChat" onClick={sendMessage}>
            	<SendIcon/>
            </button>
        </div>
    )   
}

export default ChatPrompt;