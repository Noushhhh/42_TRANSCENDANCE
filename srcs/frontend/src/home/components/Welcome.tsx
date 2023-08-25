import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/generalStyles.css';

// Inline style for the container to override general CSS
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

// Header component
// Displays the main title of the application
const Header: React.FC = () => (
    <header className="header">
        <h1 className="title" style={{ color: 'purple', flexWrap: 'wrap', textAlign: 'center' }}>
            Ready to Pong?
        </h1>
    </header>
);

// Props interface for the Features component
interface FeaturesProps {
    handleFunction: () => void;  // Function to be called on button click
}

// Features component
// Displays instruction and a start button. On button click, it triggers the passed handleFunction
const Features: React.FC<FeaturesProps> = ({ handleFunction }) => (
    <div>
        <button style={btnElement} className="button" onClick={handleFunction}>start</button>
    </div>
);

// Welcome component
// Acts as the main component, containing both Header and Features components.
// Uses the useNavigate hook for programmatic navigation.
const Welcome: React.FC = () => {
    const navigate = useNavigate();

    // Handles the button click, navigating to the '/AuthChoise' route.
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
