import GameContainer from "./game/components/GameContainer";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useSignOut } from "./home/tools/hooks/useSignOut";
import { useNavigate } from "react-router-dom";
import { withOneTabEnforcer } from "react-one-tab-enforcer";
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
  UserProfileSetup,
  ActivityLogoutHandler,
  OAuth42Callback,
} from "./home/components/index";
import SocketError from "./game/components/gameNetwork/SocketError";
import IoConnection from "./socket/IoConnection";
import "./App.css";
import { Socket } from "socket.io-client";
import { useState, useRef } from "react";
import GameInvitation from "./game/components/gameNetwork/GameInvitation";

// Interface for handling socket errors
interface SocketErrorObj {
  statusCode: number;
  message: string;
}

const App: React.FC = () => {
  // State and refs for managing the socket and errors
  const [socket, setSocket] = useState<Socket>();
  const socketRef = useRef<Socket | undefined>();
  const [error, setError] = useState<string>("");
  const signOut = useSignOut();
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────────────────────
  // Effect to listen for changes in local storage, specifically for logout
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "logout") {
        console.log("Logout detected in another tab");
        signOut();
        navigate("/signin");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [signOut, navigate]);

  useEffect(() => {
    socket?.on("disconnectUser", handleDisconnectUser);

    return () => {
      socket?.off("disconnectUser", handleDisconnectUser);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleDisconnectUser = () => {
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = undefined;
      setSocket(undefined);
    }
    signOut();
  
    navigate("/signin");
  };

  // ─────────────────────────────────────────────────────────────────────

  // Function to handle socket errors and display them
  const handleError = (error: SocketErrorObj) => {
    setError(error.message);
    console.error("error %d : %s", error.statusCode, error.message);
    setTimeout(() => {
      setError("");
    }, 1500);
  };
  // ─────────────────────────────────────────────────────────────────────

  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/authchoice" element={<AuthChoice />} />
        <Route path="/userprofilesetup" element={<UserProfileSetup />} />
        <Route path="/callback42" element={<OAuth42Callback />} />

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
          {/* Nested routes for different sections of the home page */}
          <Route
            path="chat"
            element={<ChatBoxContainer socket={socketRef.current} />}
          />
          <Route
            path="friends"
            element={<Friends socket={socketRef.current} />}
          />
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
        {/* Catch-all route for handling any unmatched URLs */}
        {/*       https://stackoverflow.com/questions/74645355/react-router-v6-catch-all-path-does-not-work-when-using-nested-routes */}
        <Route path="*" element={<ErrorComponent />} />
      </Routes>
    </>
  );
};

// export default App;
export default withOneTabEnforcer()(App);
