import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useSignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/signout', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        localStorage.setItem('logout', 'true'); // Broadcast logout event
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
