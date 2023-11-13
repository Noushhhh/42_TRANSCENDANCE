
// api.ts

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
    const response = await fetch(`http://localhost:8081/api/users/getprofilename`, {
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
 * @return {Promise<string | null>} A promise that resolves to the avatar URL or null if an error occurs.
 */
export const getUserAvatar = async (): Promise<string | null> => {
    try {
        // Send a request to the server to get the user's avatar
        const response = await fetch(`http://localhost:8081/api/users/getavatar`, {
            method: 'GET',
            credentials: 'include'
        });
        // Check if the response is successful (status code in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Read the response as a Blob(Binary large object)
        const blob = await response.blob();
        // Create a URL for the Blob so it can be interpreted by html show the image
        const url = URL.createObjectURL(blob);
        // Return the URL
        return url;
    } catch (error) {
        // Log the error and return null if an error occurs
        console.log('Error fetching user avatar:', error);
        return null;
    }
}


// This function is responsible for updating the public name of the user.
// It sends a PUT request to the server with the new public name as a parameter.
// If the server responds with a valid response, the function returns the response data.
// If the server responds with an invalid response or if an error occurs during the fetch operation,
// the function throws an error.
export const updatePublicName = async (publicName: string) => {
  try {
    const response = await fetch(`http://localhost:8081/api/users/updatepublicname?username=${encodeURIComponent(publicName)}`, {
      method: 'PUT',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      throw new Error(`${data.statusCode} ${data.message}`)
    }
  } catch (error) {
    console.log('Error updating user name');
    throw error; // Throw the error instead of just logging it
  }
}
  
// ─────────────────────────────────────────────────────────────────────────────

// Define an asynchronous function to update the avatar
export const updateAvatar = async (newAvatar: File | null) => {
  // Early return if no file is provided
  if (!newAvatar) return;

  // Define allowed file types for the avatar
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  // Check if the provided file type is allowed, throw an error if not
  if (!allowedTypes.includes(newAvatar.type)) {
    throw new Error("Unsupported file type. Please upload a JPEG, PNG, or GIF image.");
  }

  // Define a maximum file size (5MB in this case)
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  // Check if the file size exceeds the maximum limit, throw an error if it does
  if (newAvatar.size > maxFileSize) {
    throw new Error("File size too large. Please upload an image smaller than 5MB.");
  }

  // Create a new FormData object to hold the file data for sending
  const formData = new FormData();
  // Append the new avatar file to the FormData object
  formData.append("avatar", newAvatar);

  try {
    // Perform an HTTP PUT request to the server to update the avatar
    const response = await fetch(`${API_BASE_URL}/api/users/updateavatar`, {
      method: "PUT",
      body: formData,
      credentials: "include", // Include credentials for authentication
    });

    // Check if the server response is not OK (e.g., 200, 201), throw an error if it's not
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    // Parse the JSON response from the server
    const data = await response.json();
    // Check if the response indicates an unsuccessful update, throw an error if it does
    if (!data.valid) {
      throw new Error(`Update failed: ${data.message}`);
    }

    // Return the response data, could be used for UI updates or logging
    return data;
  } catch (error) {
    // Log and re-throw any errors for higher-level handling (e.g., UI error messages)
    console.error("Error updating avatar:", error);
    throw error;
  }
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.blob();
        return new File([data], `${imageName}.${data.type.split('/')[1]}`, { type: data.type });
    } catch (error) {
        if (hasMessage(error))
            console.error(`There was an error with the fetch operation: ${error.message}`);
        throw error; // Re-throw the error to allow higher level handling
    }
};
