// Importing necessary React hooks, components, and styles
import React, { useEffect, useState, useCallback } from 'react';
import { getPublicName, getUserAvatar, useUpdatePublicName, useUpdateAvatar, hasMessage } from '../tools/Api';
import SignOutLink from '../tools/SignoutLink';
import { CSSTransition } from 'react-transition-group';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/generalStyles.css';
import LoadingSpinner from '../tools/LoadingSpinner';
import TwoFA from './TwoFA';
import { formatPlayerName } from '../../game/components/gameNetwork/ScoreBoard';

// Settings component definition, wrapped with React.memo for performance optimization
const Settings: React.FC = React.memo(() => {
  // State hooks for various pieces of user data and UI states
  const [username, setPublicName] = useState<string | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [newUsername, setNewPublicName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isUpdatingProfileName, setIsUpdatingProfileName] = useState(false);

  // Custom hooks for updating avatar and public name
  const updateAvatar = useUpdateAvatar();
  const updatePublicName = useUpdatePublicName();

  // Refs for smooth transitions in UI elements
  const usernameRef = React.useRef(null);
  const avatarRef = React.useRef(null);

  // Fetches the user's public name from the backend
  const fetchPublicName = async (): Promise<void> => {
    try {
      const userNameResultFromBack = await getPublicName();
      setPublicName(formatPlayerName(userNameResultFromBack));
    } catch (error) {
      console.error(`Error fetching publicName in settings component : 
      ${hasMessage(error) ? error.message : ""}`);
    }
  }

  // Fetches the user's avatar from the backend
  const fetchUserAvatar = async (): Promise<void> => {
    try {
      const userAvatarResultFromBack = await getUserAvatar();
      if (userAvatarResultFromBack) 
        setAvatarUrl(userAvatarResultFromBack);
    } catch (error) {
      console.error(`Error fetching avatar in settings component : 
      ${hasMessage(error) ? error.message : ""}`);
    }
  }

  // Initial effect for loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1000); // Change the delay to 3000ms

    return () => {
      clearTimeout(timer);
    }
  }, []);

  // Effect for fetching user data on component mount
  useEffect(() => {
    fetchPublicName();
    fetchUserAvatar();
  }, []);

  // Updates user's public name after validation
  const checkUsernameAndUpdate = useCallback(async (): Promise<void> => {
    try {
      await updatePublicName(newUsername);
      toast.success("Public Name updated successfullly");
      if (newUsername) {
        setPublicName(newUsername);
        setNewPublicName(null);
      }
    } catch (error) {
      console.error("Failed to update ProfileName:", error);
      toast.error(`Error updading public Name: ${hasMessage(error)? error.message: ""}`);
      setIsUpdatingProfileName(false);
    }
    if (newUsername)
      setNewPublicName(null);
  }, [newUsername, setNewPublicName, updatePublicName]);

  // Prepares new avatar for uploading
  const checkAndShowInputAvatar = useCallback(async (newFile: File): Promise<void> => {
    setNewAvatar(newFile);
  }, []);

  // Uploads new avatar to the backend
  const sendNewAvatarToBack = useCallback(async (): Promise<void> => {
    try {
      await updateAvatar(newAvatar);
      toast.success("Avatar updated successfullly");
      if (newAvatar)
        setAvatarUrl(URL.createObjectURL(newAvatar));
    } catch (error) {
      console.error("Failed to update avatar:", error);
      toast.error(`Failed to update avatar: ${hasMessage(error) ? error.message : ""}`);
      setIsUpdatingAvatar(false);
    }
  }, [newAvatar, updateAvatar]);

  // Conditionally renders the loading spinner
  if (showLoading) {
    return (
      <div className='settings-container'>
        <LoadingSpinner />
      </div>
    );
  }

  // Main return statement of the component, rendering the UI
  return (
    <div className='settings-container'>
      {/* Display username with transition effect */}
      <CSSTransition nodeRef={usernameRef} in={!isUpdatingProfileName} timeout={500} classNames="fade" appear>
        <h3 className="h3" ref={usernameRef} >{username}</h3>
      </CSSTransition>

      {/* Toast container for showing success/error messages */}
      <ToastContainer />

      {/* Input field and button for updating public name */}
      {isUpdatingProfileName && (
        <CSSTransition in={true} timeout={500} classNames="fade" unmountOnExit onExited={() => setIsUpdatingProfileName(false)}>
          <>
            <input type="text" className='item' value={newUsername ?? ''} onChange={e => setNewPublicName(e.target.value)} />
            <button className="button" style={{'margin' : '2%'}} onClick={checkUsernameAndUpdate}>Confirm</button>
          </>
        </CSSTransition>
      )}

      {/* Button to toggle public name update UI */}
      <button className="button" onClick={() => setIsUpdatingProfileName(!isUpdatingProfileName)}> Update Public Name </button>

      {/* Display avatar with transition effect */}
      <CSSTransition nodeRef={avatarRef} in={!isUpdatingAvatar} timeout={500} classNames="fade" appear>
        <img ref={avatarRef} className='item' src={avatarUrl ?? ''} alt={`avatar`} />
      </CSSTransition>

      {/* Input field and button for updating avatar */}
      {isUpdatingAvatar && (
        <CSSTransition in={isUpdatingAvatar} timeout={500} classNames="fade" unmountOnExit onExited={() => setIsUpdatingAvatar(false)}>
          <>
            <input type="file" style={{'margin' : "1%" , 'color' : 'white'}} onChange={e => e.target.files && checkAndShowInputAvatar(e.target.files[0])} />
            <button className="button" style={{'margin' : '2%'}} onClick={sendNewAvatarToBack}>Confirm</button>
          </>
        </CSSTransition>
      )}

      {/* Button to toggle avatar update UI */}
      <button className="button" style={{'marginTop': '1%'}} onClick={() => setIsUpdatingAvatar(!isUpdatingAvatar)}> Update Avatar </button>

      {/* Two Factor Authentication component */}
      <TwoFA />

      {/* Sign out link */}
      <div style={{'marginTop' : '3%'}}>
        <SignOutLink />
      </div>
    </div>
  );
});

export default Settings;
