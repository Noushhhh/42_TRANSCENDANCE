import React, { useState, useCallback, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/generalStyles.css';
import { fetchImageAsFile, useUpdateAvatar, useUpdatePublicName, getUserData, hasMessage } from '../tools/Api';
import LoadingSpinner from '../tools/LoadingSpinner';

const defaultImage = 'defaultProfileImage.jpg';

const UserProfileSetup: React.FC = React.memo(() => {
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState(defaultImage);
  const [errorMessage, setErrorMessage] = useState('');
  const { updateAvatar, isLoading: isAvatarUpdating } = useUpdateAvatar();
  const { updatePublicName, isLoading: isPublicNameLoading } = useUpdatePublicName();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserData();
        setEmail(userInfo.publicName || userInfo.email);
        // Initialize with default profile image
        const defaultProfileImage = await fetchImageAsFile(defaultImage, "defaultImage");
        setProfileImage(defaultProfileImage);
      } catch (error) {
        setErrorMessage(hasMessage(error) ? error.message : 'Error fetching user data');
      }
    };
    fetchUserInfo();
  }, []);

  // Update image preview
  useEffect(() => {
    if (profileImage) {
      const imageUrl = URL.createObjectURL(profileImage);
      setProfileImageUrl(imageUrl);
      // Revoke URL to avoid memory leaks
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [profileImage]);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!profileName) {
      setErrorMessage('Please enter a profile name.');
      return;
    }
    try {
      await updatePublicName(profileName);
      await updateAvatar(profileImage);
      navigate('/home');
    } catch (error) {
      setErrorMessage(hasMessage(error) ? error.message : 'Failed to update profile');
      try {
        const defaultProfileImage = await fetchImageAsFile(defaultImage, "defaultImage");
        setProfileImage(defaultProfileImage);
      } catch (fetchError) {
        console.error('Failed to fetch the default profile image:', hasMessage(fetchError) ? fetchError.message : '');
      }
    }
  }, [profileName, profileImage, updateAvatar, updatePublicName, navigate]);

  if (isAvatarUpdating || isPublicNameLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container">
      <h1>Pong game</h1>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <h2>Welcome {email}</h2>
      <input
        type="text"
        placeholder="Choose a username"
        value={profileName}
        onChange={e => setProfileName(e.target.value)}
      />
      <input
        type="file"
        onChange={handleImageChange}
      />
      <img
        className="img"
        src={profileImageUrl}
        alt="Profile preview"
      />
      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
});

export default UserProfileSetup;
