/**
 * @file useActivityLogout.tsx
 * @author [Jairo Alexander VALENCIA CANDAMIL]
 * @date 2023-10-21
 * 
 * @brief This is a custom React hook that handles user inactivity.
 * It logs out the user after a certain period of inactivity and navigates to the sign-in page.
 * 
 * @note The inactivity period is currently set to 120000 milliseconds (2 minutes).
 */

// Importing necessary hooks and components from "react-router-dom".
import { useNavigate } from "react-router-dom";
import { useSignOut } from "./useSignOut";
import { useEffect, useCallback } from "react";

/**
 * @function useActivityLogout
 * @description This hook sets up event listeners for user activity and logs out the user after a period of inactivity.
 * @returns {null} This hook does not return anything.
 */
const useActivityLogout = () => {
    const navigate = useNavigate();
    const handleSignOut = useSignOut();
    let inactivityTimer: any;

    // Function to handle user sign out and navigation to the sign-in page.
    const logoutAndNavigate = useCallback(() => {
        handleSignOut();
        navigate('signin');
    }, [handleSignOut, navigate]);

    // Function to reset the inactivity timer.
    const resetTimer = useCallback(() => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(logoutAndNavigate, 600000);
    }, [logoutAndNavigate]);

    // Function to handle window close event.
    const handleWindowClose = useCallback(() => {
        handleSignOut();
    }, [handleSignOut]);

    // Setting up event listeners for user activity and window close.
    useEffect(() => {
        window.addEventListener('load', resetTimer);
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('beforeunload', handleWindowClose);

        // Cleaning up event listeners on unmount.
        return () => {
            window.removeEventListener('load', resetTimer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('beforeunload', handleWindowClose);
        };
    }, [resetTimer, handleWindowClose]);

    return null;
};

// Export the hook for use in other components.
export default useActivityLogout;
