// Import necessary libraries and styles.
import React from "react";
import axios from 'axios';
import { useNavigate, NavLink } from "react-router-dom";
import '../styles/generalStyles.css';


// const authorizeUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-18a39bac72b776af2fd5f62fa678fe5a734e9e5d8c4fe99f2ff1c7041a1d990a&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Ftoken&response_type=code';
const authorizeUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=' + process.env.UID_42 + '&redirect_uri' + 'http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Ftoken&response_type=code';

// Create a functional component named AuthChoice.
const AuthChoice: React.FC = () => {

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

    async function signin42() {
        // navigate('/signin42');
        // let url42 = axios.get('/auth/42Url');
        window.location.href = authorizeUrl;
      }

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

            {/* Button for 42 student authentication */}
            <button className="button" onClick={signin42}>Sign in with 42</button>
            {/* <NavLink to='42api' className='nav-link'> I am a 42 student</NavLink> */}
        </div>
    );
}

// Export the AuthChoice component for use in other parts of the app.
export default AuthChoice;
