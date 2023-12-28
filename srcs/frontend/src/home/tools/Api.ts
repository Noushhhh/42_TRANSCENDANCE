// api.ts
import { NavigateFunction } from "react-router-dom";

// Assuming API_BASE_URL is defined in a configuration file or environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FETCH_TIMEOUT = 5000;  // Timeout for the fetch call set to 5 seconds

/**
 * @brief Checks if a given object has a property named 'message' and if the value of that property is a string.
 * @param x The object to check.
 * @return True if 'x' has a property named 'message' and its value is a string, false otherwise.
 * @example
 * let obj = { message: "Hello, world!" };
 * console.log(hasMessage(obj));  // Outputs: true
 */
export const hasMessage = (x: unknown): x is { message: string } => {
  return Boolean(typeof x === "object" && x && "message" in x && typeof x.message === "string");
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Asynchronously handles an HTTP response and extracts the content based on the 'Content-Type' header.
 *
 * @param {Response} response - The HTTP response object to process.
 * @returns {Promise<JSON|string>} A promise that resolves to either parsed JSON data or plain text content.
 *                               In case of an error, it returns a generic error message.
 */
export const getResponseBody = async (response: Response) => {
  try {
    // Check if the 'Content-Type' header of the response includes 'application/json'
    if (response.headers.get('Content-Type')?.includes('application/json')) {
      // If the 'Content-Type' is JSON, parse the response body as JSON and return it
      return await response.json();
    } else {
      // If the 'Content-Type' is not JSON, read the response body as text and return it
      return await response.text();
    }
  } catch (error) {
    // If an error occurs during the process, return a generic error message
    return "Error reading response";
  }
};

// ─────────────────────────────────────────────────────────────────────────────

// Utility function to format error messages, if an array in sent from the backend
export const formatErrorMessage = (error: unknown): string => {
  let errorMessage = 'Unknown error occurred';

  if (error instanceof Error) {
    // If error is an instance of Error, use its message
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    // If error is an object, try to extract the message array or string
    const errorObj = error as { [key: string]: any }; // Typecasting to an object with any properties
    if (errorObj.message) {
      if (Array.isArray(errorObj.message)) {
        // If the message is an array, join the messages
        errorMessage = errorObj.message.join(', ');
      } else if (typeof errorObj.message === 'string') {
        // If the message is a string, use it directly
        errorMessage = errorObj.message;
      }
    }
  }

  return errorMessage;
}


// ─────────────────────────────────────────────────────────────────────────────

export const getPublicName = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/getprofilename`, {
      method: 'GET',
      credentials: 'include'
    });

    // Check if the response from the fetch request is not successful
    if (!response.ok) {
      // If the response is not successful, parse the response body as JSON.
      // This assumes that the server provides a JSON response containing error details.
      const errorDetails = await getResponseBody(response);

      // Reject the promise with a new Error object. 
      // This provides a more detailed error message than simply rejecting with the raw response.
      // makes it easier to understand the nature of the error when handling it later.
      return Promise.reject(errorDetails);
    }
    const data = await response.json();
    return data.profileName;
  } catch (error) {
    throw error;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export const getUserData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/getUserInfo`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`${data.statusCode} ${data.message}`);
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Fetches the user's avatar from the server and returns its URL.
 * @return {Promise<url: string | null>} A promise that resolves to an object containing either the avatar URL or an error message.
 */
export const getUserAvatar = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/getavatar`, {
      method: 'GET',
      credentials: 'include'
    });

    // Check if the response from the fetch request is not successful
    if (!response.ok) {
      // If the response is not successful, parse the response body as JSON.
      // This assumes that the server provides a JSON response containing error details.
      const errorDetails = await getResponseBody(response);

      // Reject the promise with a new Error object. 
      // This provides a more detailed error message than simply rejecting with the raw response.
      // makes it easier to understand the nature of the error when handling it later.
      return Promise.reject(errorDetails);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Validates the user's public name.
 *
 * This function checks if the provided publicName is valid based on certain criteria.
 *
 * @param {string | null} publicName - The user's public name to validate.
 * @throws {Error} If publicName is null, empty, or doesn't meet the criteria.
 */
const validatePublicName = async (publicName: string | null) => {
  // Check if publicName is null or empty
  if (!publicName) {
    throw new Error("Please enter a valid user name");
  }
  // Check if the length of publicName is between 2 and 50 characters
  if (publicName.length < 2 || publicName.length > 50) {
    throw new Error("User name must be between 2 and 50 characters");
  }
  // Check if publicName contains only alphanumeric characters, hyphens, and underscores
  if (!/^[a-zA-Z0-9-_]+$/.test(publicName)) {
    throw new Error("User name can only contain alphanumeric characters, hyphens, and underscores");
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Validates the given password against certain criteria
 * 
 * @param password User's password
 * 
 * @returns null if the password is valid, error message otherwise
 */
export const validatePassword = async (password: string): Promise<any> => {
  if (password.length < 8) {
    throw new Error('Password should be at least 8 characters long.');
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Password should contain at least one lowercase letter.');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password should contain at least one uppercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password should contain at least one digit.');
  }
  if (!/[@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)) {
    throw new Error('Password should contain at least one special character (e.g., @, #, $, etc.).');
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const validateEmail = async (email: string): Promise<any> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
};



// ─────────────────────────────────────────────────────────────────────────────

/**
 * @brief Custom hook for updating a user's public name.
 *
 * This hook provides a function to asynchronously update a user's public name.
 *
 * @returns {object} An object containing the updatePublicName function and isLoading state.
 * - updatePublicName: A function to update the public name.
 * - isLoading: A boolean indicating whether an update operation is in progress.
 */
export const useUpdatePublicName = () => {

  /**
   * @brief Update the user's public name.
   *
   * This function sends a PUT request to update the user's public name.
   *
   * @param {string | null} publicName - The new public name to set for the user.
   * @returns {Promise} A promise that resolves with the response JSON if successful or rejects with an error.
   * @throws {Error} If the publicName validation fails or if there's an error during the update.
   */
  const updatePublicName = async (publicName: string | null): Promise<any> => {
    try {

      await validatePublicName(publicName);
      // Send a PUT request to the server to update the public name.
      const response = await fetch(`${API_BASE_URL}/api/users/updatepublicname`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicName }),
        credentials: "include",
      });

      // Check if the response from the fetch request is not successful
      if (!response.ok) {
        // If the response is not successful, parse the response body as JSON.
        // This assumes that the server provides a JSON response containing error details.
        const errorDetails = await getResponseBody(response);

        // Reject the promise with a new Error object. 
        // This provides a more detailed error message than simply rejecting with the raw response.
        // makes it easier to understand the nature of the error when handling it later.
        return Promise.reject(errorDetails);
      }

    } catch (error) {
      // Re-throw any errors to allow further handling in components.
      throw error;
    }
  };

  // Return the updatePublicName function and isLoading state.
  return updatePublicName;
};


// ─────────────────────────────────────────────────────────────────────────────



export const useUpdateAvatar = () => {

  const updateAvatar = async (newAvatar: File | null) => {

    if (!newAvatar) {
      throw new Error("You need to provide a avatar")
    }
    // File type and size validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(newAvatar.type)) {
      const error: Error = new Error("Unsupported file type. Please upload a JPEG, PNG, or GIF image.");
      throw error;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (newAvatar.size > maxFileSize) {
      const error = new Error("File size too large. Please upload an image smaller than 5MB.");
      throw error;
    }

    // FormData setup for file upload
    const formData = new FormData();
    formData.append("avatar", newAvatar);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/updateavatar`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });


      // Check if the response from the fetch request is not successful
      if (!response.ok) {
        // If the response is not successful, parse the response body as JSON.
        // This assumes that the server provides a JSON response containing error details.
        const errorDetails = await getResponseBody(response);

        // Reject the promise with a new Error object. 
        // This provides a more detailed error message than simply rejecting with the raw response.
        // makes it easier to understand the nature of the error when handling it later.
        return Promise.reject(errorDetails);
      }

      return (await response.json());
    } catch (error) {
      throw error // Re-throw to allow further handling in components
    }
  };
  return updateAvatar;
};



// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch an image as a File object.
 * @param imageUrl {string} The URL of the image to fetch.
 * @param imageName {string} The name of the image file.
 * @returns {Promise<File>} A promise that resolves to a File object.
 */
export const fetchImageAsFile = async (imageUrl: string, imageName: string): Promise<File> => {
  try {
    const response = await fetch(imageUrl);

    // Check if the response from the fetch request is not successful
    if (!response.ok) {
      // If the response is not successful, parse the response body as JSON.
      // This assumes that the server provides a JSON response containing error details.
      const errorDetails = await getResponseBody(response);

      // Reject the promise with a new Error object. 
      // This provides a more detailed error message than simply rejecting with the raw response.
      // makes it easier to understand the nature of the error when handling it later.
      return Promise.reject(errorDetails);
    }

    const data = await response.blob();
    return new File([data], `${imageName}.${data.type.split('/')[1]}`, { type: data.type });
  } catch (error) {
    if (hasMessage(error))
      console.error(`There was an error with the fetch operation: ${error.message}`);
    throw error; // Re-throw the error to allow higher level handling
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const verify2FA = async (userId: number, twoFaCode: string, navigate: NavigateFunction) => {

  const response = await fetch(
    `${API_BASE_URL}/api/auth/verifyTwoFACode`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, token: twoFaCode }),
    }
  );

  if (!response.ok) return Promise.reject(await response.json());

  const formattedRes = await response.json();
  if (formattedRes.valid === true) {
    // setTwoFaError("");
    navigate("/home");
  }

};

// ─────────────────────────────────────────────────────────────────────────────

 export const checkToken = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/checkTokenValidity`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    //            console.log(`passing by useTokenExpired response.ok = ${response.ok}`)
    if (response.ok) {
      //                console.log(`passing by if condition true withing checkToken response.ok = ${response.ok}`);
      return false;  //
    }
    else {
      //                console.log(`passing by if condition false withing checkToken response.ok = ${response.ok}`);
      return true;   // Return the actual result
    }
    //            console.log(`after setting tokenExpired withing checkToken ${tokenExpired}`);
  } catch (error) {
    console.error("Token check error:", hasMessage(error) ? error.message : error);
  }
};
