import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useSignOut } from "./home/tools/hooks/useSignOut";
import { useNavigate } from "react-router-dom";
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
  UserProfileSetup,
  ActivityLogoutHandler
} from "./home/components/index";
import SocketError from "./game/components/gameNetwork/SocketError";
import IoConnection from "./socket/IoConnection";
import "./App.css";
import { Socket } from "socket.io-client";
import { useState, useRef } from "react";
import GameInvitation from "./game/components/gameNetwork/GameInvitation";

// Mock element while Paul finishes the chat, Theo finishes the game, and someone finished the friends
// component
const MockComponent: React.FC = () => {
  return <div> Placeholder for unfinish component </div>;
};

interface SocketErrorObj {
  statusCode: number;
  message: string;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket>();
  const socketRef = useRef<Socket | undefined>();
  const [error, setError] = useState<string>("");
  const signOut = useSignOut();
  const navigate = useNavigate();
// ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'logout') {
        console.log('Logout detected in another tab');
        signOut();
        navigate('/signin');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [signOut, navigate]);
// ─────────────────────────────────────────────────────────────────────────────


  const handleError = (error: SocketErrorObj) => {
    setError(error.message);
    console.error("error %d : %s", error.statusCode, error.message);
    setTimeout(() => {
      setError("");
    }, 1500);
  };

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
            <ActivityLogoutHandler />
            <HomePage />
            <IoConnection setSocket={setSocket} socketRef={socketRef} />
            <GameInvitation socket={socketRef.current} />
            <SocketError
              socket={socketRef.current}
              error={error}
              handleError={handleError}
            ></SocketError>
          </ProtectedRoute>
        }
      >
        {/* add here incremented route if user first connexion can access only user settings page */}
        <Route
          path="chat"
          element={<ChatBoxContainer socket={socketRef.current} />}
        />
        <Route path="friends" element={<Friends socket={socketRef.current}/>} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="game"
          element={
            <GameContainer
              socket={socketRef.current}
              error={error}
              handleError={handleError}
            />
          }
        />
      </Route>
      {/*       https://stackoverflow.com/questions/74645355/react-router-v6-catch-all-path-does-not-work-when-using-nested-routes */}
      <Route path="*" element={<ErrorComponent />} /> {/* Catch-all route */}
    </Routes>
  );
};
export default App;
