import React from "react";
import "../styles/ChatPrompt.css"
import SendIcon from '@mui/icons-material/Send';
import { useState, ChangeEvent } from "react";

type InputProps = {
    sendMessage: (message: string) => void;
  };

function ChatPrompt({ sendMessage }: InputProps) {

    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
      };

  const handleSendMessage = () => {
    sendMessage(inputValue);
    setInputValue('');
  };

    return (
        <div className="ChatPrompt">
            <input value={inputValue} onChange={handleInputChange} className="InputChatPrompt" type="text"/>
            <button onClick={handleSendMessage}>ENVOYERRRR</button>
            <span className="SendIconPromptChat"><SendIcon/></span>
        </div>
    )
}
export default ChatPrompt;



// function ChatPrompt() {

//     const [messageUS, setMessageUS] = useState('');
//     const [messagesUS, setMessagesUS] = useState<string[]>([]);
  
//     const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setMessageUS(event.target.value);
//       };
  
//       <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.2/socket.io.js "></script>
      
//     const socket = io("http://localhost:5555");
//     const message = document.getElementById('message') as HTMLInputElement;
//     const messages = document.getElementById('messages')as HTMLInputElement;
    
//     socket.on('connect', ()=> {
//         //console.log('connected');
//     });

//     socket.on('message', function(id: string, data: string){
//         if (messages !== null) {
//             messages.innerHTML += `<p> ${id}: ${data}</p>`;
//         }
//     })
//     const sendMessage = () => {
//       if (messageUS.trim() !== '') {
//         setMessagesUS([...messagesUS, messageUS]);
//         setMessageUS('');
//       }
//       socket.emit('message', messageUS);
//     };

            
//             return (
//                 <div className="ChatPrompt">
//           <input
//             className="InputChatPrompt"
//             type="text"
//             id="message"
//             value={messageUS}
//             onChange={handleInputChange}
//           />
//           <button onClick={sendMessage}>envoyer</button>
//           <div id="messages">
//             {messagesUS.map((msg, index) => (
//               <p key={index}>{msg}</p>
//             ))}
//           </div>
//         </div>
//       );
// }
// export default ChatPrompt;