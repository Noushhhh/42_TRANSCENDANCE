import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignOut } from './useSignOut';
import { useRefreshToken } from "./useRefreshToken";
import { useTokenExpired } from './useTokenExpired';

const useActivityLogout = (timeToLogout = 1000 * 60 * 20, refreshCheckInterval = 1000 * 60 * 10) => {
  const navigate = useNavigate();
  const handleSignOut = useSignOut();
  const { refreshTokenIfNeeded } = useRefreshToken();
  const checkToken = useTokenExpired();

  useEffect(() => {
    // Declare timerId for tracking user inactivity
    let timerId: NodeJS.Timeout | null = null;

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);

      const lastActivity = localStorage.getItem("lastActivity");
      const timeSinceLastActivity = lastActivity ? Date.now() - Number(lastActivity) : null;

      if (timeSinceLastActivity && timeSinceLastActivity >= timeToLogout) {
        console.log("User inactive for too long. Signing out.");
        handleSignOut();
        navigate('/signin');
      } else {
        timerId = setTimeout(() => {
          console.log("Inactivity timeout reached. Signing out.");
          handleSignOut();
          navigate('/signin');
        }, timeToLogout - (timeSinceLastActivity ?? 0));
      }
    };

    const updateLastActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
      resetTimer();
    };

    const events = ['click', 'load', 'keypress'];
    events.forEach(event => window.addEventListener(event, updateLastActivity));

    const onStorageUpdate = (event: StorageEvent) => {
      if (event.key === "lastActivity") {
        console.log("Local storage updated. Resetting timer.");
        updateLastActivity();
      }
    };

    window.addEventListener('storage', onStorageUpdate);

    updateLastActivity(); // Initialize last activity time

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
      console.log("Checking token status and refreshing if needed");
      const currentTokenExpired = await checkToken();
      if (currentTokenExpired === false) {
        await refreshTokenIfNeeded();
      } else if (currentTokenExpired === true) {
        console.log("Token expired. Signing out.");
        handleSignOut();
        navigate('/signin');
      }
    };

    const tokenCheckIntervalId = setInterval(checkTokenStatusAndRefresh, refreshCheckInterval);

    return () => {
      console.log("Clearing token check interval");
      clearInterval(tokenCheckIntervalId);
    };
  }, [navigate, handleSignOut, checkToken, refreshTokenIfNeeded]);

  return null;
};

export default useActivityLogout;
