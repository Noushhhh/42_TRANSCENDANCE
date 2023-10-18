import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";
// import AuthContainer from './auth/components/AuthContainer';
import React from "react";
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
import "./App.css";

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
          </ProtectedRoute>
        }
      >
        {/* add here incremented route if user first connexion can access only user settings page */}
        <Route path="chat" element={<ChatBoxContainer />} />
        <Route path="friends" element={<Friends />} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
        {/* <Route path="game" element={<GameContainer/>} /> */}
      </Route>
    </Routes>
  );
};
export default App;
