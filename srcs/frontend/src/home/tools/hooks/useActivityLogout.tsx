import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignOut } from './useSignOut';
import { useRefreshToken } from "./useRefreshToken";
import { useTokenExpired } from './useTokenExpired';

const useActivityLogout = (timeToLogout = 1000 * 30, refreshCheckInterval = 1000 * 15) => {
  const navigate = useNavigate();
  const handleSignOut = useSignOut();
  const { refreshTokenIfNeeded } = useRefreshToken();
  const checkToken = useTokenExpired();


  useEffect(() => {
    //timerId inside useEffect to avoid errrors
    // let timerId : NodeJS.Timeout | undefined; 
    // console.log(`passing by timerId defined in useEffect ${timerId}`);

    const resetTimer = () => {
      let timeSinceLastActivity: number | null = null;

      //if timer difined clear it
      // if (timerId !== undefined) {
      //   console.log(`Passing by clearTimeout TIMERID : ${timerId}`);
      //   clearTimeout(timerId);
      // }

      //calculate the last timer the user was active, this because we can be in multiple taps
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) timeSinceLastActivity = Date.now() - Number(lastActivity);
      console.log(`TIMER SINCE LAST EVENT PASSING BY RESET : ${timeSinceLastActivity}`)
      // timerId = setTimeout(() => {
      //   // if no time Since last activity or timer since last activity is grater than timeToLogout force sign out
        if (timeSinceLastActivity && timeSinceLastActivity >= timeToLogout) {
          console.log(`Timer expired, logging out user.`);
          handleSignOut();
          navigate('/signin');
        }
      // }, timeToLogout)
      // console.log(`Timer set with ID: ${timerId}`);
    };
   
    // Set up event listeners for user activity
    const events = ['click', 'load', 'keypress'];
    events.forEach(event => window.addEventListener(event, () => {
      console.log(`User activity detected: ${event}`);
      // resetTimer();
      localStorage.setItem("lastActivity", Date.now().toString());
    }));

    // Event listener for local storage changes
    const onStorageUpdate = (event: StorageEvent) => {
      if (event.key === "lastActivity") {
        resetTimer();
      }
    };

    // Listen to storage events
    window.addEventListener('storage', onStorageUpdate);
    // // Initial reset of the timer

    // Function to check token status and refresh if needed
    const checkTokenStatusAndRefresh = async () => {
      console.log(`passing by checkTokenStatusAndRefresh called with SETINTERVAL`);
      const currentTokenExpired = await checkToken();
      if (currentTokenExpired === false) {
        await refreshTokenIfNeeded();
      } else if (currentTokenExpired === true) {
        handleSignOut();
        navigate('/signin');
      }
    };

    resetTimer();
    // Set up interval to check token status
    const tokenCheckIntervalId = setInterval(checkTokenStatusAndRefresh, refreshCheckInterval);

    // Cleanup function
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      const lastTimerId = localStorage.getItem("inactivityTimerId");
      if (lastTimerId) clearTimeout(Number(lastTimerId));
      clearInterval(tokenCheckIntervalId);
      window.removeEventListener('storage', onStorageUpdate);
    };
  }, [navigate, handleSignOut, timeToLogout, refreshCheckInterval, checkToken, refreshTokenIfNeeded]);

  return null;
};

export default useActivityLogout;
