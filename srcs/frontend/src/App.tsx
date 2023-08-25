import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";
// import AuthContainer from './auth/components/AuthContainer';

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  Welcome, SignIn, SignUp, AuthChoise, HomePage, Settings,
  ProtectedRoute, Friends, Stats, Chat, useActivityLogout
} from './home/components/index'
import './App.css'

{/* <Navbar /> */ }
{/* <ChatBoxContainer /> */ }
{/* <GameContainer /> */ }
{/* < AuthContainer/> */ }

const App: React.FC = () => {
    useActivityLogout();
    return (
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/authchoise" element={<AuthChoise />} />
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>}>
                    <Route path="chat" element={<ChatBoxContainer />} />
                    <Route path="friends" element={<Friends />} />
                    <Route path="stats" element={<Stats />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="game" element={<GameContainer />} />
                </Route>
            </Routes>
    );
}
export default App;

