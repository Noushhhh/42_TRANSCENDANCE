import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/generalStyles.css";
import { useSignOut } from "../tools/hooks/useSignOut";
import { fetchImageAsFile, updateAvatar, updateProfileBackend, updatePublicName } from "../tools/Api";

const defaultImage = "/assets/defaultProfileImage.jpg";

const UserProfileSetup: React.FC = React.memo(() => {
  const location = useLocation();
  const email = location.state.email;
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const handleSignOut = useSignOut();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const profileNameRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDefaultImage();
  }, []);


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
    const file = event.target.files && event.target.files;
    if (file) {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedMimeTypes.includes(file[0].type)) {
        setErrorMessage("Please upload a valid image file.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      if (file[0].size > 15 * 1024 * 1024) {
        setErrorMessage("Please upload an image smaller than 15MB.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setProfileImage(file[0]);
    }
  }, [profileImage]);

  const handleSubmit = useCallback(() => {
    const profileNameValue: string | undefined = profileNameRef.current?.value;
    if (!profileNameValue) {
      setErrorMessage("Please enter a valid user name");
      return;
    }
    if (profileNameValue.length < 2 || profileNameValue.length > 50) {
      setErrorMessage("Please enter a user name between 2 and 50 characters");
      return;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(profileNameValue)) {
      setErrorMessage("User name can only contain alphanumeric characters, hyphens, and underscores");
      return;
    }
    setProfileName(profileNameValue);
  }, [profileImage, profileName]);

  useEffect(() => {
    if (profileName === null) return;

    const updateProfile = async () => {
      try {
        await updatePublicName(profileName);
        await updateAvatar(profileImage);
        setErrorMessage(null);
        navigate("/home");
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          if (error.message.includes("403")) {
            setErrorMessage("Username already exists");
          } else if (error.message.includes("413")) {
            setErrorMessage("The uploaded image is too large. Please upload an image smaller than 15MB.");
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

    updateProfile();
  }, [profileName]);



  return (
    <div className="container">
      <h1>Pong game</h1>
      <h2>Welcome {email}</h2>
      {errorMessage && <div style={{ color: 'white' }}>{errorMessage}</div>}
      <input type="text" placeholder="Choose a username" ref={profileNameRef} onChange={() => setErrorMessage(null)} />
      <input ref={fileInputRef} type="file" onChange={handleImageChange} />
      <img className="img" src={profileImage ? URL.createObjectURL(profileImage) : defaultImage} alt="Profile preview" />
      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
});

export default UserProfileSetup;
