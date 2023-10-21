// Importing necessary hooks and components from "react-router-dom".
import { useNavigate } from "react-router-dom";
import { useSignOut } from "./useSignOut";
import { useEffect } from "react";

const useActivityLogout = () => {
    const navigate = useNavigate();
    const handleSignOut = useSignOut();
    let inactivityTimer: any;

    const logoutAndNavigate = () => {
        handleSignOut();
        navigate('signin');
    };

    const resetTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(logoutAndNavigate, 120000);
    };

    const handleWindowClose = () => {
        handleSignOut();
    };

    useEffect(() => {
        window.addEventListener('load', resetTimer);
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('beforeunload', handleWindowClose);

        return () => {
            window.removeEventListener('load', resetTimer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('beforeunload', handleWindowClose);
        };
    }, []);

    return null;
};

// Export the hook for use in other components.
export default useActivityLogout;