import { useState, useCallback } from 'react';
import { getResponseBody } from '../Api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const useRefreshToken = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTokenIfNeeded = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refreshToken`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        // If the response is not successful, parse the response body as JSON.
        // This assumes that the server provides a JSON response containing error details.
        const errorDetails = await getResponseBody(response);

        // Reject the promise with a new Error object. 
        // This provides a more detailed error message than simply rejecting with the raw response.
        // makes it easier to understand the nature of the error when handling it later.
        return Promise.reject(errorDetails);
      }
      setIsRefreshing(false);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      setIsRefreshing(false);
      return false;
    }
  }, []);

  return { refreshTokenIfNeeded, isRefreshing };
};