import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/generalStyles.css'
import GoBackButton from "../tools/GoBackButton";

/*************************************************************************** */
/**
 * @function InputField
 * @description A reusable input field component.
 * @param {string} type - Type of the input field (e.g., text, email, password).
 * @param {string} value - Current value of the input field.
 * @param {function} onChange - Function to be called when the value changes.
 * @param {string} placeholder - Placeholder text for the input field.
 * @returns {JSX.Element} Rendered input field component.
 */
/*************************************************************************** */
const InputField: React.FC<{ type: string, value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }> = 
    ({ type, value, onChange, placeholder }) => (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} />
);

// ─────────────────────────────────────────────────────────────────────────────
/*************************************************************************** */
/**
 * @function signInAPI
 * @description Makes an asynchronous POST request to authenticate a user.
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @returns {Promise<object>} Response data from the server.
 * @throws Will throw an error if the response is not successful.
 */
/*************************************************************************** */
const signInAPI = async (email: string, password: string) => {
    const response = await fetch('http://localhost:4000/api/auth/signin', {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: email,
            password: password,
        })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(`${data?.message}` || `Server responded with status: ${response.status}`);
    }

    return response.json();
};

// ─────────────────────────────────────────────────────────────────────────────

/*************************************************************************** */
/**
 * @function SignIn
 * @description SignIn functional component responsible for rendering and handling the sign-in process.
 * @returns {JSX.Element} Rendered Sign-In component.
 */
/*************************************************************************** */
const SignIn: React.FC = () => {
    // States to manage email, password, error messages and loading state.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Hook for programmatic navigation.
    const navigate = useNavigate();

    // Event handler for the Sign In button click.
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();  // Prevent default behaviors like page refresh.
        setIsLoading(true);  // Set the loading state before API call.

        try {
            await signInAPI(email, password);  // Try to authenticate the user.
            navigate('/home');  // Navigate to home on successful authentication.
        } catch (error) {
            // Error handling: differentiate between different error types and set appropriate error messages.
            if (error instanceof Error) {
                if (error.message.includes('403')) {
                    setErrorMessage('Wrong credentials. Please try again.');
                } else {
                    setErrorMessage(`${error?.message} Please try again`);
                }
                console.error("There was an error:", error.message);
            } else {
                setErrorMessage('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);  // Reset loading state after API call completion.
        }
    };

    return (
        <div className="container">
            <GoBackButton />
            <h1 className="title" style={{ fontSize: 'xxx-large' }}>Pong Game</h1>
            {errorMessage && <div style={{ color: 'white' }}>{errorMessage}</div>}
            <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <InputField type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <button className="button" onClick={handleSubmit} disabled={isLoading || !email || !password}>
                {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
        </div>
    );
}

export default SignIn;
