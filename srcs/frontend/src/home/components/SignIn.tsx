import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCheckFirstConnection from "../tools/hooks/useCheckFirstConnection";
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
const InputField: React.FC<{
    type: string, value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string
}> =
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
    const response = await fetch('http://localhost:8081/api/auth/signin', {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: email,
            password: password,
        })
    });

    const data = await response.json();
    // Check if the server response was not successful (response.ok is false)
    if (!response.ok) {
        // Default error message includes the status code of the response
        let errorMessage = `Server responded with status: ${response.status}`;

        // If the data object has a 'message' property and it is an object with a 'message' property,
        // use that as the error message
        if (typeof data?.message === 'object' && data?.message?.message) {
            errorMessage = data.message.message;
        }
        // If the data object has a 'message' property and it is a string,
        // use that as the error message
        else if (typeof data?.message === 'string') {
            errorMessage = data.message;
        }

        // Throw an error with the determined error message
        throw new Error(errorMessage);
    }

    return data;
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
    const checkFirstConnection = useCheckFirstConnection();

    // Event handler for the Sign In button click.
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            await signInAPI(email, password);
            const userNotRegistered = await checkFirstConnection();

            if (!userNotRegistered) {
                navigate('/userprofilesetup', { state: { email } });
            } else {
                navigate('/home');
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('403')) {
                    setErrorMessage('Wrong credentials. Please try again.');
                } else if (error.message.includes('500')) {
                    setErrorMessage('An internal server error occurred. Please try again later.');
                } else {
                    setErrorMessage(`${error.message}. Please try again.`);
                }
                console.error("There was an error:", error.message);
            } else {
                setErrorMessage('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);
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