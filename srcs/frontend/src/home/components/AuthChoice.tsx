// Import necessary libraries and styles.
// Import necessary libraries and styles.
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import '../styles/generalStyles.css';
import { hasMessage } from "../tools/Api";
import useTokenExpired from "../tools/hooks/useTokenExpired";

// Create a functional component named AuthChoice.
const AuthChoice: React.FC = () => {

    const [tokenExpired, setTokenExpired] = useState<boolean | null | undefined>(null);
    // Using the useNavigate and useLocation hooks from react-router.
    const navigate = useNavigate();
    const location = useLocation();
    const checkToken = useTokenExpired();


    // ─────────────────────────────────────────────────────────────────────

    // Check for error message in navigation state on component mount.
    useEffect(() => {
        if (location.state && location.state.errorMessage) {
            toast.error(location.state.errorMessage);
        }

    }, [location.state]);

    // useEffect hook for checking token expiration
    useEffect(() => {
        // Function to update the token expiration status
        const updateTokenStatus = async () => {
            try {
                const expired = await checkToken();
                setTokenExpired(expired); // Update the token expiration state
            } catch (error) {
                console.error(`Error checking token in ProtectedRoute: ${hasMessage(error) ? error.message : ""}`);
            }
        };
        updateTokenStatus();
    }, [checkToken, tokenExpired]); // Dependency array with checkToken to rerun if checkToken changes

    // ─────────────────────────────────────────────────────────────────────


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
            toast.error(hasMessage(error) ? error.message : "Error siging in, please contant web site admnistrator");
        }
    };

    if (tokenExpired === false) {
        navigate("/home/game")
    }

    // Return the JSX for the component.
    return (
        <div className="container">
            <ToastContainer />
            <div>
                <header>
                    {/* Header title for the Pong Game */}
                    <h1 className="title" style={{ fontSize: 'xxx-large' }}>Pong Game</h1>
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
