import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const useSignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signout`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        localStorage.setItem('logout', Date.now().toString());
        navigate('/signin');
      } else {
        console.error('Failed to sign out.');
        throw new Error('Failed to sign out');
      }
    } catch (error) {
      console.error('There was an error signing out:', error);
    }
  }, [navigate]);

  return handleSignOut;
}