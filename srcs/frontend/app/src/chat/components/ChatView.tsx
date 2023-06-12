import React from "react";
import "../styles/ChatView.css";
import Message from "./Message";

interface MonComposantProps {
    contentMessage: string;
    messageType: string;
}

function ChatView() {

    const message1: string = "ceci est le contenu de mon message";
    const message2: string = "mec ce chat est incroyable !!!!";
    const longMessage: string = "mec ce chat est incroyable !!!!  mec ce chat est incroyable !!!! mec ce chat est incroyable !!!! mec ce chat est incroyable !!!!mec ce chat est incroyable !!!!mec ce chat est incroyable !!!! mec ce chat est incroyable !!!! mec ce chat est incroyable !!!! mec ce chat est incroyable !!!! mec ce chat est incroyable !!!! mec ce chat est incroyable !!!!";
    const message3: string = "ok";
    const date: string = "24/06/2022";

    const dateType: string = "date";
    const messageToType: string = "MessageTo";
    const messageFromType: string = "MessageFrom";

    return (
        <div className="ChatView">
            <Message contentMessage={date} messageType={dateType}/>
            <Message contentMessage={message1} messageType={messageToType}/>
            <Message contentMessage={message1} messageType={messageToType}/>
            <Message contentMessage={message2} messageType={messageFromType}/>
            <Message contentMessage={message3} messageType={messageToType}/>
            <Message contentMessage={date} messageType={dateType}/>
            <Message contentMessage={longMessage} messageType={messageToType}/>
            <Message contentMessage={message1} messageType={messageToType}/>
            <Message contentMessage={message2} messageType={messageFromType}/>
            <Message contentMessage={longMessage} messageType={messageToType}/>
            <Message contentMessage={date} messageType={dateType}/>
            <Message contentMessage={message1} messageType={messageToType}/>
            <Message contentMessage={message1} messageType={messageToType}/>
            <Message contentMessage={message2} messageType={messageFromType}/>
            <Message contentMessage={message3} messageType={messageToType}/>
            <Message contentMessage={date} messageType={dateType}/>
            <Message contentMessage={longMessage} messageType={messageToType}/>
            <Message contentMessage={message1} messageType={messageToType}/>
            <Message contentMessage={message2} messageType={messageFromType}/>
            <Message contentMessage={longMessage} messageType={messageToType}/>
        </div>
    )   
}

export default ChatView;