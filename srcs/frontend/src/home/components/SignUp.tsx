
// External dependencies
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Styles and components
import '../styles/generalStyles.css';
import GoBackButton from "../tools/GoBackButton";
import { getErrorResponse, hasMessage, validateEmail, validatePassword } from "../tools/Api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
const InputField: React.FC<{ type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }> = 
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
    const response = await fetch('http://localhost:8081/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
    });

    // Check if the response from the fetch request is not successful
    if (!response.ok) {
        // If the response is not successful, parse the response body as JSON.
        // This assumes that the server provides a JSON response containing error details.
        const errorDetails = await getErrorResponse(response);

        // Reject the promise with a new Error object. 
        // This provides a more detailed error message than simply rejecting with the raw response.
        // makes it easier to understand the nature of the error when handling it later.
        return Promise.reject(errorDetails);
    }
    return response.json();
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
            if (password !== confirmPassword)
                throw new Error('Passwords do not match.');
            await validateEmail(email);
            await validatePassword(password);
            await signUpAPI(email, password);
            navigate('/signin', { state: { message: 'Your account has been created successfully. Please sign in.' } });
        } catch (error) {
            toast.error(`Error signing up: ${hasMessage(error) ? error.message : ""}`);
            console.error(`Error signing up: ${hasMessage(error) ? error.message : ""}`);
        } finally {
            setIsLoading(false);
        }
    };

    // JSX Render
    return (
        <div className="container">
            <GoBackButton />
            <h1 className="title" style={{ fontSize: 'xxx-large' }}>Pong Game</h1>
            <ToastContainer/>
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

