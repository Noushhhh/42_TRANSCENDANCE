import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/generalStyles.css';
import useIsClientRegistered from '../tools/hooks/useIsClientRegistered';
import {
  fetchImageAsFile,
  useUpdateAvatar,
  useUpdatePublicName,
  getUserData,
  hasMessage,
  getUserAvatar
} from '../tools/Api';
import LoadingSpinner from '../tools/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useTokenExpired from '../tools/hooks/useTokenExpired';

const defaultImage = 'defaultProfileImage.jpg';
const MIN_LOADING_TIME = 2000;

const UserProfileSetup: React.FC = React.memo(() => {
  // State for profile information
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState(defaultImage);
  const [avatarFromBack, setAvatarFromBack] = useState<File | null>(null);

  // API hooks
  const { updateAvatar, isLoading: isAvatarUpdating } = useUpdateAvatar();
  const { updatePublicName, isLoading: isPublicNameLoading } = useUpdatePublicName();
  const isClientRegistered = useIsClientRegistered();
  const tokenExpired = useTokenExpired();

  // Other state variables
  const [showLoader, setShowLoader] = useState(true);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Loading spinner timeout
  let loadingTimeout: NodeJS.Timeout;

  // Set loading spinner to false after MIN_LOADING_TIME passed
  const setLoaderSpinner = () => {
    loadingTimeout = setTimeout(() => {
      setShowLoader(false);
      clearTimeout(loadingTimeout);
    }, MIN_LOADING_TIME);
  }

  // Fetch user information from an API
  const fetchUserInfo = async () => {
    try {
      const userInfo = await getUserData();
      console.log(userInfo.publicName, userInfo);
      setEmail(userInfo.publicName ?? userInfo.username);
      if (userInfo.avatar) {
        const avatar = await getUserAvatar();
        const result = await fetchImageAsFile(avatar ?? " ", "avatar");
        setAvatarFromBack(result);
        setProfileImage(result);
      }
      else {
        // Initialize with default profile image
        console.log(`setting default avatar`);
        const defaultProfileImage = await fetchImageAsFile(defaultImage, "defaultImage");
        setProfileImage(defaultProfileImage);
      }
    } catch (error) {
      toast.error(hasMessage(error) ? error.message : 'Error fetching user data');
    }
  };

  // Check if the user is authenticated
  const checkUserAuth = async () => {
    try {
      if (await tokenExpired()) {
        navigate('/signin');
        toast.error("You are not authenticated, please sign in");
        return;
      }
    } catch (error) {
      console.error('User not authenticated accessing userProfileSetup: ',
        hasMessage(error) ? error.message : "");
      toast.error("You are not authenticated, please sign in");
      navigate('/signin');
    }
  }

  // Handle updating the avatar
  const handleUpdateAvatar = useCallback(async () => {
    try {
      console.log(`passing handleUpdateAvatar`);
      setShowLoader(true);
      setLoaderSpinner();
      await updateAvatar(profileImage);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error(hasMessage(error) ? error.message : 'Failed to update avatar');
      try {
        const defaultProfileImage = await fetchImageAsFile(defaultImage, "defaultImage");
        setProfileImage(defaultProfileImage);
      } catch (fetchError) {
        console.error('Failed to fetch the default profile image:', hasMessage(fetchError) ? fetchError.message : '');
      }
    }
  }, [profileImage, updateAvatar, navigate]);

  // Check if the client is registered, and navigate accordingly
  const checkAndNavigate = useCallback(async () => {
    try {
      const result = await isClientRegistered();
      if (result) {
        console.log(`passing by checkAndNavigate avatarFromBack: ${avatarFromBack}`);
        if (!avatarFromBack) {
          await handleUpdateAvatar();
        }
        navigate('/home');
      }
      toast.error("You need to provide a Public Name to access the game");
    } catch (error) {
      console.error('passing by catch checkAndNavigate');
      toast.error("You need to provide a Public Name to access the game");
    }
  }, [profileImage,avatarFromBack, handleUpdateAvatar, isClientRegistered])

  // useEffect hook to handle the loading screen timeout
  useEffect(() => {
    setLoaderSpinner();
    checkUserAuth();
    fetchUserInfo();
    return () => clearTimeout(loadingTimeout); // Cleanup function to clear the timeout
  }, []);

  // Update image preview when profileImage changes
  useEffect(() => {
    if (profileImage) {
      const imageUrl = URL.createObjectURL(profileImage);
      setProfileImageUrl(imageUrl);
      // Revoke URL to avoid memory leaks
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [profileImage, avatarFromBack]);

  // Handle file input change to update profileImage
  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  }, []);

  // Handle updating the public name
  const handleUpdatePublicName = useCallback(async () => {
    if (!profileName) {
      toast.error('Please enter a profile name.');
      return;
    }
    try {
      setShowLoader(true);
      setLoaderSpinner();
      await updatePublicName(profileName);
      setEmail(profileName);
      toast.success('Profile name updated successfully!');
    } catch (error) {
      toast.error(hasMessage(error) ? error.message : 'Failed to update profile name');
    }
  }, [profileName, updatePublicName, navigate]);

  // Render loading spinner or user profile setup form
  if (showLoader || isAvatarUpdating || isPublicNameLoading) {
    return <LoadingSpinner />;
  }

  // Render the user profile setup form
  return (
    <div className="container">
      <ToastContainer />
      <h1>Pong game</h1>
      <h2>Welcome {email}</h2>
      <input
        type="text"
        placeholder="Choose a username"
        value={profileName}
        onChange={e => setProfileName(e.target.value)}
      />
      <button className="button" onClick={handleUpdatePublicName}>Update Profile Name</button>

      <input
        type="file"
        onChange={handleImageChange}
      />
      <img
        className="img"
        src={profileImageUrl}
        alt="Profile preview"
      />
      <button className="button" onClick={handleUpdateAvatar}>Update Avatar</button>
      <button className="button" onClick={checkAndNavigate}>Continue</button>
    </div>
  );
});

export default UserProfileSetup;
