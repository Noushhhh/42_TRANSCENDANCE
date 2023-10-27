// Constants
const API_IS_CLIENT_REGISTERED = "http://localhost:8081/api/user/isClientRegistered";

/**
 * Custom React hook to determine if the user has already had a first connection.
 *
 * @returns boolean | null - Returns:
 *                           * true if the user has already had a first connection
 *                           * false if the user hasn't had a first connection
 *                           * null if the status hasn't been determined yet
 */
const useCheckFirstConnection = () => {

    const checkFirstConnection = async ():Promise<boolean> => {
      try {
        const response = await fetch(API_IS_CLIENT_REGISTERED, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          return result.valid;
        } else {
          throw new Error(`Error status ${response.status}`);
        }
      } catch (error) {
        console.error("User check first connection error:", error);
        return false;
      }
    };

  // Return the user's first connection status.
  return checkFirstConnection;
};

export default useCheckFirstConnection;
