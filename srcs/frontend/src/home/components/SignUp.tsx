
// External dependencies
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Styles and components
import '../styles/generalStyles.css';
import GoBackButton from "../tools/GoBackButton";
import { getResponseBody, formatErrorMessage } from "../tools/Api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Reusable Input Component to render various input fields
 * 
 * @param type Type of the input field (e.g. email, password)
 * @param value Current value of the input field
 * @param onChange Event handler when the input value changes
 * @param placeholder Placeholder text for the input field
 * 
 * @returns JSX.Element
 */
export const InputField: React.FC<{ type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }> = 
    ({ type, value, onChange, placeholder }) => (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} />
    );

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Makes an API call to sign up the user
 * 
 * @param email User's email
 * @param password User's password
 * 
 * @returns Promise with the response JSON
 * @throws Error if API call isn't successful
 */
const signUpAPI = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
    });

    const data = await getResponseBody(response);
    if (!response.ok) {
        throw new Error(data.message || 'Unknown error occurred');
    }
    return data;
};


// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Sign Up functional component
 * 
 * @returns JSX.Element
 */
const SignUp: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * @brief Handles the submit event when user attempts to sign up
     * 
     * @param event Mouse event when the button is clicked
     */
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match.');
            }
            await signUpAPI(email, password);
            navigate('/signin', { state: { message: 'Your account has been created successfully. Please sign in.' } });
        } catch (error) {
            const errorMessage = formatErrorMessage(error);
            toast.error(`Error signing up: ${errorMessage}`);
            console.error(`Error signing up: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // JSX Render
    return (
        <div className="container">
            <GoBackButton />
            <h1 className="title" style={{ fontSize: 'xxx-large' }}>Pong Game</h1>
            <ToastContainer />
            <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <InputField type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <InputField type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
            <button className="button" onClick={handleSubmit} disabled={isLoading || !email || !password || !confirmPassword}>
                {isLoading ? (<div>SingUp</div> && <div>Loading...</div>) : (<div>SignUp</div>)}
            </button>
        </div>
    );
}

// Export the SignUp component for use in other parts of the application
export default SignUp;

