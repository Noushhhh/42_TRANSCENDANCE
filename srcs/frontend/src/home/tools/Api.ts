// api.ts
import { useState } from 'react';

// Assuming API_BASE_URL is defined in a configuration file or environment variable
const API_BASE_URL = "http://localhost:8081";

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



// This function is responsible for updating the public name of the user.
// It sends a PUT request to the server with the new public name as a parameter.
// If the server responds with a valid response, the function returns the response data.
// If the server responds with an invalid response or if an error occurs during the fetch operation,
// the function throws an error.

export const useUpdatePublicName = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

  const updatePublicName = async (publicName: string | null) => {
    setIsLoading(true);
    setError(null);

    if (!publicName) {
      const error = new Error("Please enter a valid user name");
      setError(error);
      setIsLoading(false);
      return;
    }
    if (publicName.length < 2 || publicName.length > 50) {
      const error = new Error("Please enter a user name between 2 and 50 characters");
      setError(error);
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(publicName)) {
      const error = new Error("User name can only contain alphanumeric characters, hyphens, and underscores");
      setError(error);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/updatepublicname`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicName }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.valid) {
        throw new Error(`Update failed: ${data.message}`);
      }

      setIsLoading(false);
      return data; // Return the response data
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err; // Re-throw to allow further handling in components
    }
  };

  return { updatePublicName, isLoading, error };
};


// ─────────────────────────────────────────────────────────────────────────────



export const useUpdateAvatar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateAvatar = async (newAvatar: File | null) => {
    setIsLoading(true);
    setError(null);

    if (!newAvatar) {
      setIsLoading(false);
      return; // Early return if no avatar is provided
    }

    // File type and size validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(newAvatar.type)) {
      const error: Error = new Error("Unsupported file type. Please upload a JPEG, PNG, or GIF image.");
      setError(error);
      setIsLoading(false);
      throw error;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (newAvatar.size > maxFileSize) {
      const error = new Error("File size too large. Please upload an image smaller than 5MB.");
      setError(error);
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

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.valid) {
        throw new Error(`Update failed: ${data.message}`);
      }

      setIsLoading(false);
      return data;
    } catch (error) {
      setError(error as Error);
      setIsLoading(false);
      throw error // Re-throw to allow further handling in components
    }
  };
  return { updateAvatar, isLoading, error };
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