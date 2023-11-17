import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8081";

export const useRefreshToken = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTokenIfNeeded = useCallback(async () => {
    setIsRefreshing(true);
    try {
      console.log("passing by userRefreshToken");
      const response = await axios.post(`${API_BASE_URL}/api/auth/refreshToken`); // Adjust the endpoint if necessary
      if (response.status === 200 ) {
        // Assuming the response contains the new token
        // Update the token in local storage or context
        // localStorage.setItem('token', response.data.newToken);
        setIsRefreshing(false);
        return true;
      } else {
        setIsRefreshing(false);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setIsRefreshing(false);
      return false;
    }
  }, []);

  return { refreshTokenIfNeeded, isRefreshing };
};