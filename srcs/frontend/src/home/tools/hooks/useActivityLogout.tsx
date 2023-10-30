
// Importing necessary hooks and components from "react-router-dom".
import { useNavigate } from "react-router-dom";
import { useSignOut } from "./useSignOut";
import { useEffect, useCallback } from "react";
import Cookies from 'js-cookie';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Refreshes the user's access token.
 * @throws Error if the token refresh request fails.
 */
const refreshToken = async () => {
  try {
    const response = await fetch('http://localhost:8081/api/auth/refreshToken', {
      method: 'POST',
      credentials: 'include', // Send cookies with the request
    });
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

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

        //Extract token Expiration date from cookies, is the only information we only can extract for security
        const tokenExpires = Cookies.get('tokenExpires');
        if (!tokenExpires) {
            console.warn('Token expiration time not found in cookie');
            return;
        }

        // Convert expiration data to date
        const accessTokenExpiresAt = new Date(tokenExpires);
        const now = new Date().getTime();
        // Calculate the expiration token time in milliseconds
        const expiresIn: number = accessTokenExpiresAt.getTime() - now;

        // If the token expires within 5 minutes, we create a new token
        if (expiresIn <= 5 * 60 * 1000) {
            refreshToken().catch((error) => {
                console.error('Error refreshing token:', error);
            });
        }

        inactivityTimer = setTimeout(logoutAndNavigate, 6000000);
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
