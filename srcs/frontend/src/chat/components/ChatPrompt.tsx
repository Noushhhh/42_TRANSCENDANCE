import React, { ChangeEvent, useEffect, useState, useRef } from "react";
import "../styles/ChatPrompt.css";
import SendIcon from "@mui/icons-material/Send";
import "../types/type.Message";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";
import { Socket } from "socket.io-client";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Message {
  id: number;
  senderId: number;
  channelId: number;
  content: string;
  createdAt: Date;
  messageType: string;
}

interface MessageToStore{
	channelId: number;
	content: string;
	senderId: number;
}

interface ChatPromptProps {
  addMessage: (newMessage: Message, messageType: string) => void;
  setPreviewLastMessage: React.Dispatch<React.SetStateAction<Message | undefined>>;
}

function ChatPrompt({ addMessage, setPreviewLastMessage }: ChatPromptProps): JSX.Element {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const channelId: number = useChannelIdContext();
  const socket: Socket = useSocketContext();
  const userId: number = useUserIdContext();

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setMessage(event.target.value);
  };

  function isWhitespace(str: string): boolean {
    return /^\s*$/.test(str);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputRef.current) {
      sendMessage();
    }
  }

  const storeMsgToDatabase = async (message: MessageToStore) => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/addMessageToChannel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
        credentials: "include",
      })
    } catch (errors) {
      console.log(errors);
    }
  };

  const sendMessage = () => {
    const msgToSend: Message = {
      channelId,
      content: message,
      id: 0,
      senderId: userId,
      createdAt: new Date(),
      messageType: "MessageTo",
    };
    let isSenderIsMuted: boolean = false;
    if (msgToSend.content.length > 5000) {
      alert('message too long: 5000char max');
      return;
    }
    if (isWhitespace(message)) {
      setMessage("");
      return;
    }
    socket.emit("message", msgToSend, (data: boolean) => {
      isSenderIsMuted = data;
      if (isSenderIsMuted)
        msgToSend.content = "You are muted from this channel";
      addMessage(msgToSend, "MessageTo");
      if (isSenderIsMuted) {
        setMessage("");
        return;
      }
      const { id, createdAt, messageType, ...parsedMessage } = msgToSend;
      setPreviewLastMessage(msgToSend);
      storeMsgToDatabase(parsedMessage);
      setMessage("");
    });
  };

  useEffect(() => {
    socket.on("messageBack", messageEvent);

    return () => {
      socket.on("messageBack", messageEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messageEvent = (data: Message) => {
    if (!data) return;
    if (isWhitespace(data.content)) return;
    if (data.senderId === userId)
      addMessage(data, "MessageTo");
    else
      addMessage(data, "MessageFrom")
    setMessage("");
  };

  if (channelId === -1) {
    return <div></div>;
  }
  return (
    <div className="ChatPrompt">
      <input
        ref={inputRef}
        value={message}
        className="InputChatPrompt"
        onChange={handleMessageChange}
        type="text"
        onKeyDown={handleKeyDown}
      />
      <button className="SendIconPromptChat" onClick={sendMessage}>
        <SendIcon />
      </button>
    </div>
  );
}

export default ChatPrompt;
