
// External dependencies
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Styles and components
import '../styles/generalStyles.css';
import GoBackButton from "../tools/GoBackButton";

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

    if (!response.ok) {
        const data = await response.json();
        console.log(data);
        throw new Error(`${data?.message} | Server responded with status: ${response.status}`);
    }

    return response.json();
};


// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Validates the given password against certain criteria
 * 
 * @param password User's password
 * 
 * @returns null if the password is valid, error message otherwise
 */
const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
        return 'Password should be at least 8 characters long.';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password should contain at least one lowercase letter.';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password should contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password should contain at least one digit.';
    }
    if (!/[@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)) {
        return 'Password should contain at least one special character (e.g., @, #, $, etc.).';
    }
    return null;
};

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

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
            setErrorMessage(passwordValidationError);
            return;
        }

        setIsLoading(true);
        try {
            await signUpAPI(email, password);
            navigate('/signin');
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('403')) {
                    setErrorMessage('Email is already registered. Please sign in.');
                } else {
                    setErrorMessage('An unexpected error occurred. Please try again later.');
                }
            } else {
                setErrorMessage('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // JSX Render
    return (
        <div className="container">
            <GoBackButton />
            <h1 className="title" style={{ fontSize: 'xxx-large' }}>Pong Game</h1>
            {errorMessage && <div style={{color: 'white'}}>{errorMessage}</div>}
            <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <InputField type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <InputField type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
            <button className="button" onClick={handleSubmit} disabled={isLoading || !email || !password || !confirmPassword}>
                {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
        </div>
    );
}

// Export the SignUp component for use in other parts of the application
export default SignUp;

