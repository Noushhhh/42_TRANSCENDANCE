// api.ts
import { useState } from 'react';

// Assuming API_BASE_URL is defined in a configuration file or environment variable
const API_BASE_URL = "http://localhost:4000";

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

const getErrorResponse = async (response: Response) => {
  try {
    if (response.headers.get('Content-Type')?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    return "Error reading response";
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const getPublicName = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/getprofilename`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`${data.statusCode} ${data.message}`);
    }
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

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error('Error fetching user avatar:', error);
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
const validatePublicName = (publicName: string | null) => {
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
 * @brief Custom hook for updating a user's public name.
 *
 * This hook provides a function to asynchronously update a user's public name.
 *
 * @returns {object} An object containing the updatePublicName function and isLoading state.
 * - updatePublicName: A function to update the public name.
 * - isLoading: A boolean indicating whether an update operation is in progress.
 */
export const useUpdatePublicName = () => {
  // State variable to track whether an update operation is in progress.
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * @brief Update the user's public name.
   *
   * This function sends a PUT request to update the user's public name.
   *
   * @param {string | null} publicName - The new public name to set for the user.
   * @returns {Promise} A promise that resolves with the response JSON if successful or rejects with an error.
   * @throws {Error} If the publicName validation fails or if there's an error during the update.
   */
  const updatePublicName = async (publicName: string | null) => {
    try {
      // Set isLoading to true to indicate that an update is in progress.
      setIsLoading(true);

      // Call the validatePublicName function to check the validity of publicName.
      validatePublicName(publicName);

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
        const errorDetails = await getErrorResponse(response);

        // Reject the promise with a new Error object. 
        // This provides a more detailed error message than simply rejecting with the raw response.
        // makes it easier to understand the nature of the error when handling it later.
        return Promise.reject(errorDetails);
      }

    } catch (error) {
      // Re-throw any errors to allow further handling in components.
      throw error;
    } finally {
      // Set isLoading to false when the update operation is complete.
      setIsLoading(false);
    }
  };

  // Return the updatePublicName function and isLoading state.
  return { updatePublicName, isLoading };
};


// ─────────────────────────────────────────────────────────────────────────────



export const useUpdateAvatar = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateAvatar = async (newAvatar: File | null) => {
    setIsLoading(true);

    if (!newAvatar) {
      setIsLoading(false);
      return; // Early return if no avatar is provided
    }

    // File type and size validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(newAvatar.type)) {
      const error: Error = new Error("Unsupported file type. Please upload a JPEG, PNG, or GIF image.");
      setIsLoading(false);
      throw error;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (newAvatar.size > maxFileSize) {
      const error = new Error("File size too large. Please upload an image smaller than 5MB.");
      setIsLoading(false);
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
        const errorDetails = await getErrorResponse(response);

        // Reject the promise with a new Error object. 
        // This provides a more detailed error message than simply rejecting with the raw response.
        // makes it easier to understand the nature of the error when handling it later.
        return Promise.reject(errorDetails);
      }

      return (await response.json());
    } catch (error) {
      throw error // Re-throw to allow further handling in components
    }
    finally {
      setIsLoading(false);
    }
  };
  return { updateAvatar, isLoading};
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

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.blob();
    return new File([data], `${imageName}.${data.type.split('/')[1]}`, { type: data.type });
  } catch (error) {
    if (hasMessage(error))
      console.error(`There was an error with the fetch operation: ${error.message}`);
    throw error; // Re-throw the error to allow higher level handling
  }
};