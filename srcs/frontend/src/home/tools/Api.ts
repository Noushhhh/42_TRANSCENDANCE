
// api.ts

export const getPublicName = async () => {
    try {
        const response = await fetch(`http://localhost:8081/api/users/getprofilename`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.valid)
            throw new Error(`${result.data.statusCode} ${result.data.message}`)
        return result.data.profileName;
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
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
      if (!data.valid) {
        throw new Error(data.message); // Throw the error message from the server response
      }
      return data;
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