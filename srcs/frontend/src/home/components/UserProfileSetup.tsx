// Import necessary modules and dependencies
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/generalStyles.css";
import { useSignOut } from "../tools/hooks/useSignOut";
import { fetchImageAsFile } from "../tools/Api";

// Default profile image URL
const defaultImage = "/assets/defaultProfileImage.jpg";

/**
* ****************************************************************************
 * Update profile on the backend.
 * @param {File | null} profileImage - The profile image file.
 * @param {string} profileName - The profile name.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating the success of the update.
 * @throws {Error} If the update fails.
* ****************************************************************************
*/
const updateProfileBackend = async (profileImage: File | null, profileName: string) => {
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

/**
* ****************************************************************************
 * UserProfileSetup component.
 * @component
* ****************************************************************************
*/
const UserProfileSetup: React.FC = () => {
  const location = useLocation();
  const email = location.state.email;

  // Declare state variables for profile name and profile image
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize useNavigate and useSignOut hooks
  const navigate = useNavigate();
  const handleSignOut = useSignOut();

  // Create a ref for the file input element
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Set the default profile image on component mount
  useEffect(() => {
    setDefaultImage();
  }, []);

  // Revoke the object URL for the profile image on component unmount
  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(URL.createObjectURL(profileImage));
      }
    };
  }, [profileImage]);

/**
   * Set the default profile image.
*/
  const setDefaultImage = async () => {
    const defaultProfileImage = await fetchImageAsFile(defaultImage, "defaultImage");
    setProfileImage(defaultProfileImage);
  };

  /**
   * Handle profile name input change.
   * @param {ChangeEvent<HTMLInputElement>} event - The change event.
   */
  const handleUsernameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setProfileName(event.target.value);
  }, [profileName]);

  /**
   * Handle profile image input change.
   * @param {ChangeEvent<HTMLInputElement>} event - The change event.
   */
  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];

    if (file) {
      // Define an array of allowed MIME types for image files
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

      // Check if the uploaded file's MIME type is included in the allowedMimeTypes array
      if (!allowedMimeTypes.includes(file.type)) {
        // If the file's MIME type is not allowed, show an alert to the user
        setErrorMessage("Please upload a valid image file.");

        // Clear the file input value if the fileInputRef.current exists
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Stop the function execution
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage("Please upload an image smaller than 15MB.");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        return;
      }

      setProfileImage(file);
    }
  }, [profileImage]);

  /**
   * Handle form submission.
   */
  const handleSubmit = async () => {
    if (profileName.trim() === "") {
      setErrorMessage("Please enter a valid user name");
      return;
    }

    try {
      await updateProfileBackend(profileImage, profileName);
      navigate("/home");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("409")) {
          setErrorMessage("Username already exists");
        } else if (error.message.includes("401")) {
          setErrorMessage("Your credentials have expired, please log in");
          setTimeout(() => {
            handleSignOut();
            navigate("/signin");
          }, 1000 * 10);
        } else if (error.message.includes("400")) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unsuspected error occurred. Please try again later");
        }
      }
    }
  };

  // Render the UserProfileSetup component
  return (
    <div className="container">
      <h1>Pong game</h1>
      <h2>Welcome {email}</h2>
      {errorMessage && <div style={{ color: 'white' }}>{errorMessage}</div>}
      <input type="text" placeholder="Choose a username" value={profileName} onChange={handleUsernameChange} />
      <input ref={fileInputRef} type="file" onChange={handleImageChange} />
      <img className="img" src={profileImage ? URL.createObjectURL(profileImage) : defaultImage} alt="Profile preview" />
      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
};

export default UserProfileSetup;