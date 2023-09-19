// Import necessary libraries and styles.
import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import '../styles/generalStyles.css';

// Create a functional component named AuthChoise.
const AuthChoise: React.FC = () => {

    // Using the useNavigate hook from react-router to programmatically change routes.
    const navigate = useNavigate();

    // Function to navigate to the SignIn route.
    const handleSignInNav = () => {
        navigate('/signin');
    };

    // Function to navigate to the SignUp route.
    const handleSignUpNav = () => {
        navigate('/signup');
    };

    // Return the JSX for the component.
    return (
        <div className="container">
            <div>
                <header>
                    {/* Header title for the Pong Game */}
                    <h1 className="title" style={{fontSize: 'xxx-large'}}>Pong Game</h1>
                </header>
            </div>

            {/* Button container with SignIn and SignUp buttons */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <button className="button" onClick={handleSignInNav}>SignIn</button>
                <button className="button" onClick={handleSignUpNav}>SignUp</button>
            </div>

            {/* NavLink for 42 student authentication */}
            <NavLink to='42api' className='nav-link'> I am a 42 student</NavLink>
        </div>
    );
}

// Export the AuthChoise component for use in other parts of the app.
export default AuthChoise;
