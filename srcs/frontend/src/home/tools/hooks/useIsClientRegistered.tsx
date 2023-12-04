import { hasMessage } from "../Api";

// Constants
const API_IS_CLIENT_REGISTERED = "http://localhost:4000/api/users/isClientRegistered";

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
          const errorDetails = await response.json();

          // Reject the promise with a new Error object. 
          // This provides a more detailed error message than simply rejecting with the raw response.
          // Including both the response status and a message from the server (if available) in the error message
          // makes it easier to understand the nature of the error when handling it later.
          return Promise.reject(new Error(`Error ${response.status}: ${errorDetails.message}`));
        }
        return true;

      } catch (error) {
        console.error("User check first connection error:", hasMessage(error) ? error.message : "");
        return false;
      }
    };

  // Return the user's first connection status.
  return isClientRegistered;
};

export default useIsClientRegistered;
