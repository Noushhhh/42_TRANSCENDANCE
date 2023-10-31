import { useState } from 'react';
import { hasMessage } from '../Api';

const useRefreshToken = () => {
  const [error, setError] = useState<string | null>(null);

  const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/refreshToken', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMessage = 'Failed to refresh token';
        console.error(errorMessage);
        setError(errorMessage);
        return Promise.reject(new Error(errorMessage));
      }
    } catch (error) {
      if (hasMessage(error)) {
        const errorMessage = 'There was an error signing out: ' + error.message;
        console.error(errorMessage);
        setError(errorMessage); // Set error state
      }
      else
        setError("There was an error signin out");
      return Promise.reject(error);
    }
  };

  return { refreshToken, error };
};

export default useRefreshToken;