import { useNavigate } from "react-router-dom";
import { useSignOut } from "./useSignOut";
import Cookies from 'js-cookie';

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

/**
 * @brief Custom hook to handle automatic logout after a period of inactivity.
 * @returns Cleanup function to remove event listeners when the hook is no longer in use.
 */
const useActivityLogout = () => {
  const navigate = useNavigate();
  const handleSignOut = useSignOut();

  let inicativityTimer: any;

  /**
   * @brief Removes the user token and navigates to the signin page.
   */
  const logoutAndNavigate = () => {
    handleSignOut();
    navigate('signin');
  };

  /**
   * @brief Resets the inactivity timer whenever there's user activity.
   */
  const resetTimer = () => {
    clearTimeout(inicativityTimer);

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

    inicativityTimer = setTimeout(logoutAndNavigate, 600000);
  };

  window.addEventListener('load', resetTimer);
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);

  return () => {
    window.removeEventListener('load', resetTimer);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keypress', resetTimer);
  };
};

export default useActivityLogout;