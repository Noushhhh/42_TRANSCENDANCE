import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";
// import AuthContainer from './auth/components/AuthContainer';
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import {
  Welcome,
  SignIn,
  SignUp,
  AuthChoice,
  HomePage,
  Settings,
  ProtectedRoute,
  Friends,
  Stats,
  Chat,
  useActivityLogout,
} from "./home/components/index";
import IoConnection from "./socket/IoConnection";
import "./App.css";
import { Socket } from "socket.io-client";
import { useState, useRef } from "react";
import GameInvitation from "./game/components/gameNetwork/GameInvitation";

// const socket = io("http://localhost:4000");

{
  /* <Navbar /> */
}
{
  /* <ChatBoxContainer /> */
}
{
  /* <GameContainer /> */
}
{
  /* < AuthContainer/> */
}

const App: React.FC = () => {
  useActivityLogout();
  const [socket, setSocket] = useState<Socket>();
  const socketRef = useRef<Socket | undefined>();

  useEffect(() => {
    console.log("socket ref from app", socketRef.current?.id);
    console.log("socket state from app", socket?.id);
  });

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      {/* correct auth instead of authchoice */}
      <Route path="/authchoice" element={<AuthChoice />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
            <IoConnection setSocket={setSocket} socketRef={socketRef} />
            <GameInvitation socket={socket} />
          </ProtectedRoute>
        }
      >
        {/* add here incremented route if user first connexion can access only user settings page */}
        <Route path="chat" element={<ChatBoxContainer socket={socket} />} />
        <Route path="friends" element={<Friends />} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="game"
          element={<GameContainer socket={socketRef.current} />}
        />
      </Route>
    </Routes>
  );
};
export default App;
