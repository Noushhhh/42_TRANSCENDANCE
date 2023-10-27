import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
    Welcome, SignIn, SignUp, AuthChoice, HomePage, Settings,
    ProtectedRoute,  Stats, ErrorComponent, useActivityLogout,
    UserProfileSetup
} from './home/components/index';
// import GameContainer from "./game/components/GameContainer";
// import ChatBoxContainer from "./chat/components/ChatBoxContainer";
import './App.css';

// Mock element while Paul finishes the chat, Theo finishes the game, and someone finished the friends
// component
const MockComponent: React.FC = () => {
    return <div> Placeholder for unfinish component </div>
} 

const App: React.FC = () => {
    // Hooks: Use the `useActivityLogout` hook to check for user inactivity and perform a logout if needed.
    useActivityLogout();
    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/authchoice" element={<AuthChoice  />} />
            <Route path="/userprofilesetup" element={<UserProfileSetup />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>}>
                <Route path="chat" element={<MockComponent/>} /> 
                <Route path="friends" element={<MockComponent/>} />
                <Route path="stats" element={<Stats />} />
                <Route path="settings" element={<Settings />} />
                <Route path="game" element={<MockComponent/>} />
            </Route>
            {/*       https://stackoverflow.com/questions/74645355/react-router-v6-catch-all-path-does-not-work-when-using-nested-routes */}
            <Route path="*" element={<ErrorComponent />} /> {/* Catch-all route */}
        </Routes>
    );
};
export default App;
