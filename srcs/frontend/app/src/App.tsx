import React from "react";
import "./App.css";
import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";

function App() {
  return (
    <div className="App">
      <Navbar />
      <ChatBoxContainer/>
      {/* <GameContainer /> */}
    </div>
  );
}

export default App; 
