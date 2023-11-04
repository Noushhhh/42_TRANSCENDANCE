import { useNavigate } from "react-router-dom";
import { useSignOut } from "./useSignOut";
import { useEffect, useCallback } from "react";
import Cookies from 'js-cookie';

const refreshToken = async () => {
  try {
    const response = await fetch('http://localhost:8081/api/auth/refreshToken', {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      return Promise.reject(new Error('Failed to refresh token'));
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return Promise.reject(error);
  }
};

const useActivityLogout = (timeToLogout: number = 600000) => {
  const navigate = useNavigate();
  const handleSignOut = useSignOut();
  let inactivityTimer: NodeJS.Timeout;

  const logoutAndNavigate = useCallback(() => {
    const result: number = Date.now() - Number(localStorage.getItem('lastActivity') || '0');
    if (result >= timeToLogout) {
      handleSignOut();
      localStorage.setItem('logout', 'true'); // Broadcast logout event
      navigate('signin');
    }
  }, [handleSignOut, navigate]);

  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimer);
    localStorage.setItem('lastActivity', Date.now().toString());
    inactivityTimer = setTimeout(logoutAndNavigate, timeToLogout);
  }, [logoutAndNavigate]);

  const handleTokenExpiration = useCallback(() => {
    const tokenExpires = Cookies.get('tokenExpires');
    if (!tokenExpires) {
      console.warn('Token expiration time not found in cookie');
      return;
    }
    const accessTokenExpiresAt = new Date(tokenExpires);
    const now = new Date().getTime();
    const expiresIn: number = accessTokenExpiresAt.getTime() - now;
    console.log(expiresIn);
    if (expiresIn <= 5 * 60 * 1000) {
      refreshToken().catch((error) => {
        console.error('Error refreshing token:', error);
      });
    }
  }, [handleSignOut]);

  const handleWindowClose = useCallback(() => {
    handleSignOut();
    localStorage.removeItem('logout'); // Clear logout event
  }, [handleSignOut]);

  const handleLogoutEvent = useCallback(() => {
    // Handle logout event
    if (localStorage.getItem('logout') === 'true') {
      navigate('signin');
      handleSignOut();
    }
  }, [handleSignOut, navigate]);

  useEffect(() => {
    window.addEventListener('load', resetTimer);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('beforeunload', handleWindowClose);
    window.addEventListener('storage', handleLogoutEvent); // Listen for logout event

    const tokenExpirationCheck = setInterval(handleTokenExpiration, 6000);

    return () => {
      window.removeEventListener('load', resetTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('beforeunload', handleWindowClose);
      window.removeEventListener('storage', handleLogoutEvent); // Remove event listener

      clearInterval(tokenExpirationCheck);
    };
  }, [resetTimer, handleWindowClose, handleTokenExpiration, logoutAndNavigate, handleLogoutEvent]);

  return null;
};

export default useActivityLogout;
