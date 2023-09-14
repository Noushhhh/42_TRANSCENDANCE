import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/generalStyles.css';

// Inline styles to override or complement general CSS classes
const containerStyle = {
    height: '100vh',
    width: '100vw',
    justifyContent: 'center',
    alignContent: 'center',
}

const btnElement = {
    alignSelf: 'center',
    justifySelf: 'center',
    height: '8vh',
    width: '13vw',
    fontSize: '1.5vw'
}

/**
 * Header Component
 * Represents the main title of the application.
 */
const Header: React.FC = () => (
    <header className="header">
        <h1 className="title" style={{ color: 'purple', flexWrap: 'wrap', textAlign: 'center' }}>
            Ready to Pong?
        </h1>
    </header>
);

// Types for the props of Features component
interface FeaturesProps {
    handleFunction: () => void;  // Callback to be executed on button click
}

/**
 * Features Component
 * Contains instructions and a start button. When clicked, it triggers the provided handleFunction.
 */
const Features: React.FC<FeaturesProps> = ({ handleFunction }) => (
    <div>
        <button style={btnElement} className="button" onClick={handleFunction}>start</button>
    </div>
);

/**
 * Welcome Component
 * Represents the main welcome page. Displays the Header and Features components.
 * Uses the useNavigate hook from 'react-router-dom' for programmatic navigation.
 */
const Welcome: React.FC = () => {
    const navigate = useNavigate();

    // Handler for the start button. When clicked, navigates the user to the '/AuthChoise' page.
    const handleStart = () => {
        navigate('/AuthChoise');
    }

    return (
        <div className="container" style={containerStyle}>
            <Header />
            <h4>Press start to play</h4>
            <Features handleFunction={handleStart} />
        </div>
    );
}

export default Welcome;