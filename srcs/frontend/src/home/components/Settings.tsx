import React, { useEffect, useState, useCallback } from 'react';
import { getPublicName, getUserAvatar, updatePublicName, updateAvatar } from '../tools/Api'
import SignOutLink from '../tools/SignoutLink'

const Settings: React.FC = React.memo(() => {
  const [username, setPublicName] = useState<string>('');
  const [newUsername, setNewPublicName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingProfileName, setIsUpdatingProfileName] = useState(false);
  const [promptError, setError] = useState<string | null>(null); // Add an error state

  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchData() {
      const userInfo = await getPublicName();
      const userAvatar = await getUserAvatar();
      if (userInfo && userAvatar) {
        setPublicName(userInfo);
        setAvatarUrl(userAvatar);
      }
      else {
        setError('There is an error when fetching the information, please contact the system administrator');
      }
    }

    fetchData();
  }, []); // Add an empty array as the second argument to useEffect

  // ─────────────────────────────────────────────────────────────────────

  // This function is responsible for checking the new username and updating it.
  // It uses the useCallback hook to ensure that the function is not recreated on every render.
  // If a new username is provided, it calls the updatePublicName function to update the username on the server.
  // If the server responds with a successful response, it updates the public name in the state and sets the isUpdatingProfileName state to false.
  // It also displays a success message to the user.
  // If an error occurs during the updatePublicName function call, it sets an error message in the state.
  const checkUsernameAndUpdate = useCallback(async () => {
    if (newUsername) {
      try {
        const response = await updatePublicName(newUsername);
        if (response.valid) {
          setPublicName(newUsername);
          alert('Username updated successfully!');
          setIsUpdatingProfileName(false);
        }
      } catch (error) {
        console.log("passing by catch in checkUsernameAndUpdate\n");
        if (error instanceof Error) {
          console.log(`passing by catch errro instanceof Error\n Aright, let print error message ${error.message}`);
          // setError(error.message);
          alert(error.message);
        }
      }
    }
  }, [newUsername, promptError, isUpdatingProfileName]);



  // ─────────────────────────────────────────────────────────────────────

  const checkAndShowInputAvatar = useCallback(async (newFile: File) => {
    setNewAvatar(newFile);
    setAvatarUrl(URL.createObjectURL(newFile));
  }, [setNewAvatar, setAvatarUrl]); // Include dependencies in useCallback

  // ─────────────────────────────────────────────────────────────────────

  const sendNewAvatarToBack = useCallback(async () => {
    try {
      await updateAvatar(newAvatar);
      setIsUpdatingAvatar(false);
      alert('Avatar updated successfully!'); // Provide user feedback
    } catch (error) {
      console.error(`passing by here ${error}\n`);
    }
  }, [newAvatar]);

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className='container'>
      <h3>{username}</h3>
      {isUpdatingProfileName && (
        <>
          <input type="text" value={newUsername} onChange={e => setNewPublicName(e.target.value)} />
          <button onClick={checkUsernameAndUpdate}>Confirm</button>
        </>
      )}
      <button onClick={() => setIsUpdatingProfileName(!isUpdatingProfileName)}> Update Public Name </button>
      <img className='img' src={avatarUrl} alt={`${username} avatar`} />
      {isUpdatingAvatar && (
        <>
          <input type="file" onChange={e => e.target.files && checkAndShowInputAvatar(e.target.files[0])} />
          <button onClick={sendNewAvatarToBack}>Confirm</button>
        </>
      )}
      <button onClick={() => setIsUpdatingAvatar(!isUpdatingAvatar)}> Update Avatar </button>
      <SignOutLink />
      {/* {promptError && <p>{promptError}</p>} */}
    </div>
  );
});

export default Settings;