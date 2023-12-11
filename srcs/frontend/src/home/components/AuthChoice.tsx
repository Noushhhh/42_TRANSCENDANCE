// Import necessary libraries and styles.
import React from "react";
import axios from 'axios';
import { useNavigate} from "react-router-dom";
import '../styles/generalStyles.css';


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

    let url42 = () => {
        return axios.get('http://localhost:4000/api/auth/42Url',
            { withCredentials: true })
    }

    const handleSignin42Nav = async () => {
        try {
            const response = await url42();
            console.log(response);
            window.location.href = response.data; // Redirects to 42 OAuth page
        } catch (error) {
            console.log(error);
        }
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

            {/* Button for 42 student authentication */}
            <button className="button" onClick={handleSignin42Nav}>Sign in with 42</button>
        </div>
    );
}

export default AuthChoice;
