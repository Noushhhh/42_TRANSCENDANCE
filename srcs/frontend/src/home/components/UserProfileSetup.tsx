import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";
import "../styles/generalStyles.css";
import { useSignOut } from "../tools/hooks/useSignOut";
import { fetchImageAsFile, useUpdateAvatar, useUpdatePublicName } from "../tools/Api";
import LoadingSpinner from "../tools/LoadingSpinner";
import { getUserData, hasMessage } from "../tools/Api";

const defaultImage = 'defaultProfileImage.jpg';

const UserProfileSetup: React.FC = React.memo(() => {
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { updateAvatar, isLoading: isAvatarUpdating, error: avatarUpdateError } = useUpdateAvatar();
  const { updatePublicName, isLoading: isPublicNameLoading, error: publicNameError } = useUpdatePublicName();
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleSignOut = useSignOut();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const profileNameRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const result = await getUserData();
        setEmail(result.publicName ? result.publicName : result.email);
      } catch (error) {
        console.error(hasMessage(error) ? error.message : "Something went wrong when \
        calling when fetching user email in UserProfile compoenet");
      }
    }

    getUserInfo();
    setDefaultImage();

  }, [getUserData]);


  useEffect(() => {
    setErrorMessage(null);
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(URL.createObjectURL(profileImage));
      }
    };
  }, [profileImage]);

  const setDefaultImage = async () => {
    const defaultProfileImage = await fetchImageAsFile(defaultImage, "defaultImage");
    setProfileImage(defaultProfileImage);
  };

  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file)
      setProfileImage(file[0]);
  }, [profileImage]);

  const handleSubmit = useCallback(async () => {
    try {
      // Use the custom hook function to update the public name and avatar
      await updatePublicName(profileName);
      await updateAvatar(profileImage);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        return;
      }
    }
    navigate("/home");
  }, [updateAvatar, updatePublicName, navigate]);


  // Display loading spinner or error message based on the hook's states
  if (isAvatarUpdating || isPublicNameLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container">
      <h1>Pong game</h1>

      {avatarUpdateError && <p>Error updating avatar: {avatarUpdateError.message}</p>}
      {publicNameError && <p>Error updating Public Name: {publicNameError.message}</p>}

      <h2>Welcome {email}</h2>

      {errorMessage && <div style={{ color: 'white' }}>{errorMessage}</div>}

      <input type="text" placeholder="Choose a username" ref={profileNameRef} onChange={e => {setErrorMessage(null); setProfileName(e.target.value); }} />
      <input ref={fileInputRef} type="file" onChange={handleImageChange} />
      <img className="img" src={profileImage ? URL.createObjectURL(profileImage) : defaultImage} alt="Profile preview" />
      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
});

export default UserProfileSetup;