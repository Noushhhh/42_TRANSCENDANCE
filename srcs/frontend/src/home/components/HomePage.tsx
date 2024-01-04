// Importing necessary React and react-router components.
import React from 'react';
import { useLocation, NavLink, Outlet } from 'react-router-dom';
import '../styles/generalStyles.css'

// Define the HomePage functional component.
const HomePage: React.FC = () => {

    // Use the useLocation hook to get the current URL location.
    const location = useLocation();

    // Function to determine the link's class based on the current URL.
    // If the current pathname matches the provided path, it returns an "active" class, otherwise, a regular class.
    const getLinkClassName = (path: string) => {
        return location.pathname === path ? "active-nav-link" : "nav-link";
    };

    // Return the JSX to render for the component.
    return (
        <div className="container" style={{justifyContent: 'start'}}>
            
            <h1 className="title">Pong Game</h1>   {/* Main title of the page */}
            
            <header className="header">
                {/* Navigation links with conditional class names depending on the current route */}
                <NavLink to="chat" className={getLinkClassName("/home/chat")}>Chat</NavLink>
                <NavLink to="friends" className={getLinkClassName("/home/friends")}>Friends</NavLink>
                <NavLink to="stats" className={getLinkClassName("/home/stats")}>Stats</NavLink>
                <NavLink to="settings" className={getLinkClassName("/home/settings")}>Settings</NavLink>
                <NavLink to="game" className={getLinkClassName("/home/game")}>Game</NavLink>
            </header >

            {/* Content container that will render the nested route's component (child route) */}
            <div className='content'>
                <Outlet/>
            </div>
        </div>
    );
}

// Export the HomePage component for use in other parts of the application.
export default HomePage;
