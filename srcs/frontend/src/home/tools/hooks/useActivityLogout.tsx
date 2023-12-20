import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignOut } from './useSignOut';
import { useRefreshToken } from "./useRefreshToken";
import { checkToken } from '../Api';

// Custom hook for handling user inactivity logout and token refreshing
const useActivityLogout = (timeToLogout = 1000 * 60 * 20, refreshCheckInterval = 1000 * 60 * 10) => {
  const navigate = useNavigate();
  const handleSignOut = useSignOut();
  const { refreshTokenIfNeeded } = useRefreshToken();

  useEffect(() => {
    // Declare timerId for tracking user inactivity
    let timerId: NodeJS.Timeout | null = null;

    // Function to reset the inactivity timer
    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);

      const lastActivity = localStorage.getItem("lastActivity");
      const timeSinceLastActivity = lastActivity ? Date.now() - Number(lastActivity) : null;

      if (timeSinceLastActivity && timeSinceLastActivity >= timeToLogout) {
        //console.log("User inactive for too long. Signing out.");
        handleSignOut();
        navigate('/signin');
      } else {
        timerId = setTimeout(() => {
          //console.log("Inactivity timeout reached. Signing out.");
          handleSignOut();
          navigate('/signin');
        }, timeToLogout - (timeSinceLastActivity ?? 0));
      }
    };

    // Function to update the last activity timestamp
    const updateLastActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
      resetTimer();
    };

    // Events to listen for user activity
    const events = ['click', 'load', 'keypress'];
    events.forEach(event => window.addEventListener(event, updateLastActivity));

    // Handle changes in local storage (used for cross-tab synchronization)
    const onStorageUpdate = (event: StorageEvent) => {
      if (event.key === "lastActivity") {
        //console.log("Local storage updated. Resetting timer.");
        updateLastActivity();
      }
    };

    window.addEventListener('storage', onStorageUpdate);

    // Initialize the last activity time and timers
    updateLastActivity();

    // Cleanup event listeners and timers when unmounting
    return () => {
      events.forEach(event => window.removeEventListener(event, updateLastActivity));
      window.removeEventListener('storage', onStorageUpdate);
      if (timerId) clearTimeout(timerId);
      localStorage.removeItem("lastActivity");
    };
  }, [navigate, handleSignOut, timeToLogout]);

  useEffect(() => {
    // Function to check token status and refresh if needed
    const checkTokenStatusAndRefresh = async () => {
      //console.log("Checking token status and refreshing if needed");
      const currentTokenExpired = await checkToken();

      if (currentTokenExpired === false) {
        // Token is still valid, refresh if needed
        await refreshTokenIfNeeded();
      } else if (currentTokenExpired === true) {
        //console.log("Token expired. Signing out.");
        handleSignOut();
        navigate('/signin');
      }
    };

    // Set up an interval for checking token status and refreshing
    const tokenCheckIntervalId = setInterval(checkTokenStatusAndRefresh, refreshCheckInterval);

    // Cleanup the token check interval when unmounting
    return () => {
      //console.log("Clearing token check interval");
      clearInterval(tokenCheckIntervalId);
    };
  }, [navigate, handleSignOut, refreshTokenIfNeeded, refreshCheckInterval]);

  // Return null, as this is a custom hook and doesn't render any components
  return null;
};

export default useActivityLogout;
