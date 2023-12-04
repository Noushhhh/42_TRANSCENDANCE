import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/generalStyles.css';
import useIsClientRegistered from '../tools/hooks/useIsClientRegistered';
import {
  fetchImageAsFile,
  useUpdateAvatar,
  useUpdatePublicName,
  getUserData,
  hasMessage
} from '../tools/Api';
import LoadingSpinner from '../tools/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultImage = 'defaultProfileImage.jpg';

const UserProfileSetup: React.FC = React.memo(() => {
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState(defaultImage);
  const { updateAvatar, isLoading: isAvatarUpdating } = useUpdateAvatar();
  const { updatePublicName, isLoading: isPublicNameLoading } = useUpdatePublicName();
  const isClientRegistered = useIsClientRegistered();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

// ─────────────────────────────────────────────────────────────────────────────

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserData();
        console.log(userInfo.publicName, userInfo);
        setEmail(userInfo.publicName ? userInfo.pubicName : userInfo.email);
        // Initialize with default profile image
        const defaultProfileImage = await fetchImageAsFile(defaultImage, "defaultImage");
        setProfileImage(defaultProfileImage);
      } catch (error) {
        toast.error(hasMessage(error) ? error.message : 'Error fetching user data');
      }
    };
    fetchUserInfo();
  }, []);

// ─────────────────────────────────────────────────────────────────────────────

  // Update image preview
  useEffect(() => {
    if (profileImage) {
      const imageUrl = URL.createObjectURL(profileImage);
      setProfileImageUrl(imageUrl);
      // Revoke URL to avoid memory leaks
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [profileImage]);

// ─────────────────────────────────────────────────────────────────────────────

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  }, []);

// ─────────────────────────────────────────────────────────────────────────────

  const handleUpdatePublicName = useCallback(async () => {
    if (!profileName) {
      toast.error('Please enter a profile name.');
      return;
    }
    try {
      await updatePublicName(profileName);
      toast.success('Profile name updated successfully!');
    } catch (error) {
      toast.error(hasMessage(error) ? error.message : 'Failed to update profile name');
    }
  }, [profileName, updatePublicName, navigate]);

// ─────────────────────────────────────────────────────────────────────────────

  const handleUpdateAvatar = useCallback(async () => {
    try {
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

  const checkAndNavigate = useCallback(async () => {
    try {
      if (await isClientRegistered) navigate('/home');
      
    } catch (error) {
      toast.error(hasMessage(error) ? error.message : 'Faild to check use registration please try again later');
    }
  },[])
// ─────────────────────────────────────────────────────────────────────────────


  if (isAvatarUpdating || isPublicNameLoading) {
    return <LoadingSpinner />;
  }

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
