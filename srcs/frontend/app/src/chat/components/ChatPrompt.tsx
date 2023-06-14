import React, { ChangeEvent, useState } from "react";
import "../styles/ChatPrompt.css"
import SendIcon from '@mui/icons-material/Send';

interface ChatPromptProps{
  addMessage:(newMessage: string) => void;
}

function ChatPrompt({addMessage}: ChatPromptProps): JSX.Element {

	const [message, setMessage] = useState("");

	const handleMessageChange = (event: ChangeEvent<HTMLInputElement>): void =>{
		setMessage(event.target.value);
	}

	function isWhitespace(str: string): boolean {
		return /^\s*$/.test(str);
	}

	const handleEvent = () => {
		if ( ! isWhitespace(message))
			addMessage(message);
		setMessage("");
	}

    return (
        <div className="ChatPrompt">
            <input	value={message}
					className="InputChatPrompt"
					onChange={handleMessageChange} 
					type="text"/>
            <button className="SendIconPromptChat" onClick={handleEvent}>
            	<SendIcon/>
            </button>
        </div>
    )   
}

export default ChatPrompt;