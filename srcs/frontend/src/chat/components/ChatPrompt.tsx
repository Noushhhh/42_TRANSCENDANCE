import React, { ChangeEvent, useEffect, useState } from "react";
import "../styles/ChatPrompt.css";
import SendIcon from "@mui/icons-material/Send";
import "../types/type.Message";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useSocketContext } from "../contexts/socketContext";
import { useUserIdContext } from "../contexts/userIdContext";
import { Socket } from "socket.io-client";

interface ChatPromptProps {
  addMessage: (newMessage: Message, messageType: string) => void;
}

function ChatPrompt({ addMessage, }: ChatPromptProps): JSX.Element {
  const [message, setMessage] = useState("");

  const channelId: number = useChannelIdContext();
  const socket: Socket = useSocketContext();
  const userId: number = useUserIdContext();

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setMessage(event.target.value);
  };

  function isWhitespace(str: string): boolean {
    return /^\s*$/.test(str);
  }

  const storeMsgToDatabase = (message: MessageToStore) => {
    const { id, ...newMessage }: Partial<Message> = message;
    fetch(`http://localhost:4000/api/chat/addMessageToChannel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
      .then((response) => response.json())
      .then((createdMessage) => {
        console.log(createdMessage);
      })
      .catch((error) => {
        console.error(error);
      });
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
    let isUserIsMuted: boolean = false;
    if (isWhitespace(message)){
      setMessage("");
      return
    }
    socket.emit("message", msgToSend, (response: boolean) => {
      console.log("IS ACTUALLY EMITTING...");
      isUserIsMuted = response;
      if (isUserIsMuted === true){
        msgToSend.content = "You are actually blocked from this channel. Others users won't see your message";
      }
      addMessage(msgToSend, "MessageTo");
    });
    const { id, createdAt, messageType, ...parsedMessage } = msgToSend;
    storeMsgToDatabase(parsedMessage);
    setMessage("");
  };

  useEffect(() => {
    socket.on("messageBack", messageEvent);

    return () => {
      socket.off("messageBack", messageEvent);
    };
  }, []);

  const messageEvent = (data: Message) => {
    console.log("do i trigger my own event ?");
    if (!data) return;
    if (isWhitespace(data.content)) return;
    addMessage(data, "MessageFrom");
    setMessage("");
  };

  if (channelId === -1) {
    return <div></div>;
  }
  return (
    <div className="ChatPrompt">
      <input
        value={message}
        className="InputChatPrompt"
        onChange={handleMessageChange}
        type="text"
      />
      <button className="SendIconPromptChat" onClick={sendMessage}>
        <SendIcon />
      </button>
    </div>
  );
}

export default ChatPrompt;
