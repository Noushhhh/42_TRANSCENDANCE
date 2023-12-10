import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import useIsClientRegistered from "../tools/hooks/useIsClientRegistered";
import "../styles/generalStyles.css";
import GoBackButton from "../tools/GoBackButton";
import { hasMessage , getErrorResponse} from "../tools/Api";
import useTokenExpired from "../tools/hooks/useTokenExpired";
import { verify2FA } from "../tools/Api";
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
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}> = ({ type, value, onChange, placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
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
    const response = await fetch("http://localhost:8081/api/auth/signin", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
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

    const data = await response.json();
    if (!data.valid) {
      throw new Error(`SignIn Filed: ${data.message}`);
    }

    if (data.message === "2FA") {
      return data.userId;
    }
  } catch (error) {
      console.error(`Error during signInAPI:`);
    throw error;
  }

  return 0;
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
  const [isLoading, setIsLoading] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [displayTwoFa, setDisplayTwoFa] = useState(false);
  const [userId, setUserId] = useState(0);
  const checkToken = useTokenExpired();
  // Hook for programmatic navigation.
  const isClientRegistered = useIsClientRegistered();
  const navigate = useNavigate();

  const checkIfAlreadyLoggedIn = useCallback(async () => {
    const tokenExpired = await checkToken();
    if (tokenExpired === false) {
      navigate("/home");
    }
  }, [checkToken, navigate]);

  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    checkIfAlreadyLoggedIn();
  }, [checkIfAlreadyLoggedIn]);
// ─────────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Faire en sorte que cette fonction nous renvoie un status
      // pour savoir si le client est co ou si il faut qu'il passe par la 2FA
      const res = await signInAPI(email, password);
      if (res !== 0) {
        console.log("USER ID 2FA = ", res);
        setUserId(res);
        setDisplayTwoFa(true);
      } else {
        const userIsRegisterd = await isClientRegistered();
        navigate(userIsRegisterd ? "/home" : "/userprofilesetup");
      }
    } catch (error) {
      const errorMessage = hasMessage(error)
        ? error.message
        : "An unexpected error occurred. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
// ─────────────────────────────────────────────────────────────────────────────

  const handleVerify2FA = async () => {
    try {
      console.log(`Passing by handleVerify2FA`);
      await verify2FA(userId, twoFaCode, navigate);
    } catch (error) {
      console.error(`Error when verifying 2FA : ${hasMessage(error) ? error.message : ""}`);
      toast.error(hasMessage(error)? error.message : 'Unable to check 2FA');
    }
  };
// ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="container">
      <GoBackButton />
      <h1 className="title">Pong Game</h1>
      <ToastContainer />
      <InputField
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <InputField
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button
        className="button"
        onClick={handleSubmit}
        disabled={isLoading || !email || !password}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      {displayTwoFa ? (
        <div>
          <InputField
            type="text"
            value={twoFaCode}
            onChange={(e) => setTwoFaCode(e.target.value)}
            placeholder="2FA Code"
          />

          <button onClick={handleVerify2FA}>Submit</button>
        </div>
      ) : null}
    </div>
  );
};

export default SignIn;
