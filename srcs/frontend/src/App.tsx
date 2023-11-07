import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";
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
  ErrorComponent,
  Chat,
  useActivityLogout,
  UserProfileSetup
} from "./home/components/index";
import IoConnection from "./socket/IoConnection";
import "./App.css";
import { Socket } from "socket.io-client";
import { useState, useRef } from "react";
import GameInvitation from "./game/components/gameNetwork/GameInvitation";

// const socket = io("http://localhost:4000");

// Mock element while Paul finishes the chat, Theo finishes the game, and someone finished the friends
// component
const MockComponent: React.FC = () => {
  return <div> Placeholder for unfinish component </div>
}

const App: React.FC = () => {

  // useActivityLogout(600000);
  const [socket, setSocket] = useState<Socket>();
  const socketRef = useRef<Socket | undefined>();

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/authchoice" element={<AuthChoice />} />
      <Route path="/userprofilesetup" element={<UserProfileSetup />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
            <IoConnection setSocket={setSocket} socketRef={socketRef} />
            <GameInvitation socket={socketRef.current} />
          </ProtectedRoute>
        }
      >
        {/* add here incremented route if user first connexion can access only user settings page */}
        <Route
          path="chat"
          element={<ChatBoxContainer socket={socketRef.current} />}
        />
        <Route path="friends" element={<Friends />} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="game"
          element={<GameContainer socket={socketRef.current} />}
        />
      </Route>
      {/*       https://stackoverflow.com/questions/74645355/react-router-v6-catch-all-path-does-not-work-when-using-nested-routes */}
      <Route path="*" element={<ErrorComponent />} /> {/* Catch-all route */}
    </Routes>
  );
};
export default App;
