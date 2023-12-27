import { hasMessage, getErrorResponse } from "../Api";

// Constants
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_IS_CLIENT_REGISTERED = `${API_BASE_URL}/api/users/isClientRegistered`;

/**
 * Custom React hook to determine if the user has already had a first connection.
 *
 * @returns boolean | null - Returns:
 *                           * true if the user has already had a first connection
 *                           * false if the user hasn't had a first connection
 *                           * null if the status hasn't been determined yet
 */
const useIsClientRegistered = () => {

    const isClientRegistered = async ():Promise<boolean> => {
      try {
        const response = await fetch(API_IS_CLIENT_REGISTERED, {
          method: "GET",
          credentials: "include",
        });

        // Check if the response from the fetch request is not successful
        if (!response.ok) {
          // If the response is not successful, parse the response body as JSON.
          // This assumes that the server provides a JSON response containing error details.
          const errorDetails = await getErrorResponse(response);

          // Reject the promise with a new Error object. 
          // This provides a more detailed error message than simply rejecting with the raw response.
          // makes it easier to understand the nature of the error when handling it later.
          return Promise.reject(errorDetails);
        }
        const data = await response.json();
        return data.valid;

      } catch (error) {
        console.error("User check first connection error:", hasMessage(error) ? error.message : "");
        throw error;
      }
    };

  // Return the user's first connection status.
  return isClientRegistered;
};

export default useIsClientRegistered;
