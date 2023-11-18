import React, { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import useCheckFirstConnection from "../tools/hooks/useCheckFirstConnection";
import '../styles/generalStyles.css'
import GoBackButton from "../tools/GoBackButton";
import { hasMessage } from "../tools/Api";
import useTokenExpired  from "../tools/hooks/useTokenExpired";
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
    try {
      const response = await fetch('http://localhost:8081/api/auth/signin', {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password: password,
        })
      });
  
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.valid) {
            throw new Error(`SignIn Filed: ${data.message}`);
      }
    } catch (error) {
        if (hasMessage(error))
            console.error("Error during signInAPI:", error.message);
      throw error;
    }
  };
  

// ─────────────────────────────────────────────────────────────────────────────

/*************************************************************************** */
/**
 * @function SignIn
 * @description SignIn functional component responsible for rendering and handling the sign-in process.
 * @returns {JSX.Element} Rendered Sign-In component.
 */
/*************************************************************************** */
// ... imports ...

const SignIn: React.FC = () => {
    // States to manage email, password, error messages and loading state.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const  checkToken = useTokenExpired();
    // Hook for programmatic navigation.
    const navigate = useNavigate();
    const checkFirstConnection = useCheckFirstConnection();

    const checkIfAlreadyLoggedIn = async () => {
        const tokenExpired = await checkToken();
        if (tokenExpired === false) {
            navigate('/home');
        }
    }

    useEffect(() => {
        checkIfAlreadyLoggedIn();
    }, [navigate, checkToken]);

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            await signInAPI(email, password);
            const userIsRegisterd = await checkFirstConnection();
            navigate(userIsRegisterd ? '/home' : '/userprofilesetup', { state: { email } });
        } catch (error) {
            const errorMessage = hasMessage(error) ? error.message : 'An unexpected error occurred. Please try again later.';
            setErrorMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // ... JSX ...

    return (
        <div className="container">
            <GoBackButton />
            <h1 className="title">Pong Game</h1>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <InputField type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <button className="button" onClick={handleSubmit} disabled={isLoading || !email || !password}>
                {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
        </div>
    );
}

export default SignIn;
