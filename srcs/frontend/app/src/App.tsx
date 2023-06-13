import React from "react";
import "./App.css";
import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";

function App() {
  return (
    <div className="App">
      <Navbar />
      <GameContainer/>
      {/* <ChatBoxContainer /> */}
    </div>
  );
}

export default App; 
