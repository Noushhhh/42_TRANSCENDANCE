import React, { ChangeEvent, useState } from "react";
import "../styles/ChatPrompt.css"
import SendIcon from '@mui/icons-material/Send';
import "../types/type.Message";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useSocketContext } from "../contexts/socketContext";

interface ChatPromptProps {
	simulatedUserId: number;
	addMessage: (newMessage: Message, messageType: string) => void;
}

function ChatPrompt({ addMessage, simulatedUserId }: ChatPromptProps): JSX.Element {

	const [message, setMessage] = useState("");

	const channelId = useChannelIdContext();
	const socket = useSocketContext();

	const handleMessageChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setMessage(event.target.value);
	}

	function isWhitespace(str: string): boolean {
		return /^\s*$/.test(str);
	}

	const storeMsgToDatabase = (message: MessageToStore) => {
		const { id, ...newMessage }: Partial<Message> = message;
		fetch(`http://localhost:4000/api/chat/addMessageToChannel/11`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		})
			.then(response => response.json())
			.then(createdMessage => {
				// Traitez la réponse de la requête ici
				console.log(createdMessage);
			})
			.catch(error => {
				// Gérez les erreurs
				console.error(error);
			});
	}

	const sendMessage = () => {
		const msgToSend: Message = {
			channelId,
			content: message,
			id: 0,
			senderId: simulatedUserId,
			createdAt: new Date(),
			messageType: "MessageTo",
		};
		if (!isWhitespace(message))
		{
			addMessage(msgToSend, "MessageTo");
		}
		const { id, createdAt, messageType, ...parsedMessage } = msgToSend;
		socket.emit('message', msgToSend);
		storeMsgToDatabase(parsedMessage);
		setMessage("");
	}

	socket.on('message', function (id: any, data: Message) {
		if (!data)
			return;
		if (socket.id === id || isWhitespace(data.content))
			return;
		addMessage(data, "MessageFrom");
		setMessage("");
	})

	if (channelId === -1){
		return (
			<div></div>
		)
	}
	return (
		<div className="ChatPrompt">
			<input value={message}
				className="InputChatPrompt"
				onChange={handleMessageChange}
				type="text" />
			<button className="SendIconPromptChat" onClick={sendMessage}>
				<SendIcon />
			</button>
		</div>
	)
}


export default ChatPrompt;