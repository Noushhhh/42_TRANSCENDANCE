import React from "react";
import "./App.css";
import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";
import AuthContainer from './auth/components/AuthContainer';
import MyButton from './auth/index';

function App() {
  return (
    <div className="App">
      {/* <Navbar /> */}
      {/* <ChatBoxContainer /> */}
        {/* <div className="Game"> */}
          {/* <GameContainer /> */}
        {/* </div> */}
        <div className="Auth"> 
          < AuthContainer />
        </div>
    </div>
  );
}

export default App;
