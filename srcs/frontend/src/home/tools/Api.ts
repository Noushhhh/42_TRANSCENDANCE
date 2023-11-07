
// api.ts

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
  


// returns server response to notify user if the avatar was updated or not
// error hadling is treated using try and catch
export const updateAvatar = async (newAvatar: File | null) => {
    const formData = new FormData();
    formData.append("avatar", newAvatar || new Blob());
    if (!newAvatar)
        return;
    const response = await fetch("http://localhost:8081/api/users/updateavatar", {
        method: "PUT",
        body: formData,
        credentials: "include",
    });

    const data = await response.json();
    if (!data.valid) {
        throw new Error(`${data.statusCode} ${data.message}`)
    }
    return data;
}

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

// ─────────────────────────────────────────────────────────────────────────────

/**
* ****************************************************************************
 * Update profile on the backend.
 * @param {File | null} profileImage - The profile image file.
 * @param {string} profileName - The profile name.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating the success of the update.
 * @throws {Error} If the update fails.
* ****************************************************************************
*/
export const updateProfileBackend = async (profileImage: File | null, profileName: string) => {
  const formData = new FormData();
  formData.append("profileImage", profileImage || new Blob());
  formData.append("profileName", profileName);

  const response = await fetch("http://localhost:8081/api/users/update", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await response.json();

  if (data.valid) {
    return true;
  } else {
    throw new Error(
      ` ${data?.statusCode}: ${data?.message}` ||
        "An error occurred when reaching the server to update your profile, please contact the website administrator"
    );
  }
};

