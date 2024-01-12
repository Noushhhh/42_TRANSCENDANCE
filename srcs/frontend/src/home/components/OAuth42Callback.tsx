import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { verify2FA, hasMessage } from "../tools/Api";
import InputField from '../tools/InputField';
import LoadingSpinner from '../tools/LoadingSpinner';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const MIN_LOADING_TIME = 1000;

const OAuth42Callback: React.FC = () => {
    const navigate = useNavigate();
    const [twoFaCode, setTwoFaCode] = useState("");
    const [displayTwoFa, setDisplayTwoFa] = useState(false);
    const [userId, setUserId] = useState(0);
    const [showLoader, setShowLoader] = useState(true);

    // Loading spinner timeout
    let loadingTimeout: NodeJS.Timeout;

    // console.log('OAuth42Callback rendered'); // Log when component is rendered
    // ─────────────────────────────────────────────────────────────────────────────

    // Set loading spinner to false after MIN_LOADING_TIME passed
    const setLoaderSpinner = () => {
        loadingTimeout = setTimeout(() => {
            setShowLoader(false);
            clearTimeout(loadingTimeout);
        }, MIN_LOADING_TIME);
    }
    
    // ─────────────────────────────────────────────────────────────────────────────

    const handle42Callback = useCallback(async (code: string) => {
        try {
            // console.log(`passinb by habdle42Callback`);
            const result = await axios.get(`${API_BASE_URL}/api/auth/callback42?code=${code}`,
                { withCredentials: true });
            console.log(result);
            const userId = result.data.userId;
            //Theo's logic returns from backed the userId to check if 2FA is activated other wise return null
            if (userId) {
                // console.log("USER ID 2FA = ", userId);
                setUserId(userId);
                setDisplayTwoFa(true);
            } else {
                navigate("/home/game");
            }
            // navigate('/home');
        } catch (error) {
            console.error(hasMessage(error) ? error.message : "Something went wrong when calling callback42 endpoint");
            navigate('/authchoice', {
                state: {
                    errorMessage: hasMessage(error) && error.message.includes("403") ? "User already logged in " :
                        "Something went wrong when authentication with 42api, contact website administrator"
                }
            });
        }
    }, [navigate]);

    // ─────────────────────────────────────────────────────────────────────


    useEffect(() => {
        setLoaderSpinner();
        return () => clearTimeout(loadingTimeout); // Cleanup function to clear the timeout
    }, );

    // ─────────────────────────────────────────────────────────────────────────────

    useEffect(() => {

        // console.log('useEffect triggered in OAuth42Callback'); // Log when useEffect is triggered

        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
            // console.log(code);
            handle42Callback(code);
        } else {
            navigate('/error');
        }
    }, [handle42Callback, navigate]);


    // ─────────────────────────────────────────────────────────────────────────────

    const handleVerify2FA = async () => {
        try {
            // console.log(`Passing by handleVerify2FA`);
            await verify2FA(userId, twoFaCode, navigate);
        } catch (error) {
            console.error(`Error when verifying 2FA : ${hasMessage(error) ? error.message : ""}`);
            toast.error(hasMessage(error) ? error.message : 'Unable to check 2FA');
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────

    // Render loading spinner or user profile setup form
    if (showLoader) {
        return <LoadingSpinner />;
    }

    return (
        <div className='container'>
            <ToastContainer />
            {displayTwoFa ? (
                <div >
                    <header>
                        {/* Header title for the Pong Game */}
                        <h1 className="title" style={{ fontSize: 'xxx-large' }}>Pong Game</h1>
                    </header>
                    <h3 style={{ color: `var(--purple-color)`, flexWrap: 'wrap', textAlign: 'center' }}>
                        Please provide a 2FA code.
                    </h3>
                    <div style={{marginTop: '5%'}}>
                        <InputField
                            type="text"
                            value={twoFaCode}
                            onChange={(e) => setTwoFaCode(e.target.value)}
                            placeholder="2FA Code"
                        />
                    </div>
                    <button className='button'  style={{marginTop:'5%'}}onClick={handleVerify2FA}>Submit</button>
                </div >
            ) : null}
        </div>
    );
};

export default OAuth42Callback;
