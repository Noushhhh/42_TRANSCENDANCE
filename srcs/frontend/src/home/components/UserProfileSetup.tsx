// Import necessary modules and dependencies
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/generalStyles.css";
import { useSignOut } from "../tools/hooks/useSignOut";

// Default profile image URL
const defaultImage = "/assets/defaultProfileImage.jpg";

// ─────────────────────────────────────────────────────────────────────────────

// Function to fetch the default profile image as a File object
const fetchDefaultImageAsFile = async () => {
  const response = await fetch(defaultImage);
  const data = await response.blob();
  return new File([data], "defaultImage.jpg", { type: data.type });
};

// ─────────────────────────────────────────────────────────────────────────────

const updateImageBackend =async (profileImage:File | null, profileName: string) => {

  
    const formData = new FormData();
    formData.append("profileImage", profileImage || new Blob());
    formData.append("profileName", profileName);

    const response = await fetch("http://localhost:4000/api/user/update", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();
    if (data.success) {
    } else {
      throw new Error( ` ${data?.statusCode}: ${data?.message}` || 'An error ocurred when reaching the' +
      'server to update your profile, please contact the website administrator');
    }
}

/**
 * ****************************************************************************
 * @brief UserProfileSetup component
 * @date 2023-09-19
 *
 * UserProfileSetup is a React component that takes an email prop and handles
 * user profile setup, including image uploading and validation.
 *
 * @prop email - The email address of the user for whom the profile is being set up.
 * ****************************************************************************
 */

interface UserProfileSetupProps {
  email: string;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ email }) => {
  // Declare state variables for profile name and profile image
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  // Initialize useNavigate and useSignOut hooks
  const navigate = useNavigate();
  const handleSignOut = useSignOut();


  // Create a ref for the file input element
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────────────────────────────

  // Set the default profile image on component mount
  useEffect(() => {
    setDefaultImage();
  }, []);
// ─────────────────────────────────────────────────────────────────────────────

  // Revoke the object URL for the profile image on component unmount
  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(URL.createObjectURL(profileImage));
      }
    };
  }, [profileImage]);
// ─────────────────────────────────────────────────────────────────────────────

  // Function to set the default profile image
  const setDefaultImage = async () => {
    const defaultProfileImage = await fetchDefaultImageAsFile();
    setProfileImage(defaultProfileImage);
  };
// ─────────────────────────────────────────────────────────────────────────────

  // Function to handle profile name input change
  const handleUsernameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setProfileName(event.target.value);
  }, []);

// ─────────────────────────────────────────────────────────────────────────────

  // Function to handle profile image input change
  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];

    if (file) {

      // Define an array of allowed MIME types for image files
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

      // Check if the uploaded file's MIME type is included in the allowedMimeTypes array
      if (!allowedMimeTypes.includes(file.type)) {
        // If the file's MIME type is not allowed, show an alert to the user
        alert("Please upload a valid image file.");

        // Clear the file input value if the fileInputRef.current exists
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Stop the function execution
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        alert("Please upload an image smaller than 15MB.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setProfileImage(file);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────

  // Function to handle form submission
  const handleSubmit = async () => {
    if (profileName.trim() === "") {
      alert("Please enter a valid user name");
      return;
    }
    try {
      await updateImageBackend(profileImage, profileName);
      navigate('/home');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('409')) {
          alert('Username already exists');
        } else if (error.message.includes('401')) {
          alert('Your credentials have expired please log in ');
          setTimeout(() => {
            handleSignOut();
            navigate('/signin');
          }, (6000 * 5));
        }
        else if (error.message.includes('400')) {
          alert(error.message);
        }
        else {
          alert('An unsuspected error occurred. Please try again later');
        }
      }
    }
  };
// ─────────────────────────────────────────────────────────────────────────────

  // Render the UserProfileSetup component
  return (
    <div className="container">
      <h1>Pong game</h1>
      <h2>Welcome {email}</h2>
      <input
        type="text"
        placeholder="Choose a username"
        value={profileName}
        onChange={handleUsernameChange}
      />
      <input ref={fileInputRef} type="file" onChange={handleImageChange} />
      <img
        className="img"
        src={profileImage ? URL.createObjectURL(profileImage) : defaultImage}
        alt="Profile preview"
      />
      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
};

export default UserProfileSetup;