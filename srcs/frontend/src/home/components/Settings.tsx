import React, { useEffect, useState, useCallback } from 'react';
import { getPublicName, getUserAvatar, updatePublicName, updateAvatar, hasMessage } from '../tools/Api';
import SignOutLink from '../tools/SignoutLink';
import { CSSTransition } from 'react-transition-group';
import '../styles/settings/Settings.css';
import LoadingSpinner from '../tools/LoadingSpinner'; // New import for a loading spinner component



/*

                                        |
,---.,---.,-.-.,---.,---.,---.,---.,---.|---
|    |   || | ||   ||   ||   ||---'|   ||
`---'`---'` ' '|---'`---'`   '`---'`   '`---'
               |
*/
const Settings: React.FC = React.memo(() => {
  const [username, setPublicName] = useState<string | null>(null);
  const [newUsername, setNewPublicName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingProfileName, setIsUpdatingProfileName] = useState(false);
  const [promptError, setError] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────────

  const usernameRef = React.useRef(null);
  const avatarRef = React.useRef(null);

  

  async function fetchPublicName(): Promise<void> {
    const userNameResultFromBack = await getPublicName();
    if (userNameResultFromBack) {
      setPublicName(userNameResultFromBack);
    } else {
      setError('There was an error fetching the public name, please contact the system administrator');
    }
  }

  async function fetchUserAvatar(): Promise<void> {
    const userAvatarResultFromBack = await getUserAvatar();
    if (userAvatarResultFromBack) {
      setAvatarUrl(userAvatarResultFromBack);
    } else {
      setError('There was an error fetching the avatar, please contact the system administrator');
    }
  }

/*

             |                  |                       |    |        |              |                  |
        . . .|---.,---.,---.    |--- ,---.    ,---.,---.|    |        |---.,---.,---.|__/ ,---.,---.,---|
        | | ||   ||---'|   |    |    |   |    |    ,---||    |        |   |,---||    |  \ |---'|   ||   |
        `-'-'`   '`---'`   '    `---'`---'    `---'`---^`---'`---'    `---'`---^`---'`   ``---'`   '`---'

*/
  useEffect(() => {
    setShowLoading(true); // Set showLoading to true before fetching the data

    Promise.all([fetchPublicName(), fetchUserAvatar()])
      .then(() => setShowLoading(false)) // Set showLoading to false after the data has been fetched
      .catch(() => setShowLoading(false)); // Also set showLoading to false if there's an error
  }, []);


  const checkUsernameAndUpdate = useCallback(async (): Promise<void> => {
    // Check if newUsername is not empty
    if (!newUsername) {
      alert('Username cannot be empty');
      return;
    }

    try {
      const response = await updatePublicName(newUsername);
      if (response.valid) {
        setPublicName(newUsername);
        alert('Username updated successfully!');
        setIsUpdatingProfileName(false);
      }
    } catch (error) {
      if (hasMessage(error)) {
        setError(error.message);
        alert(error.message);
      }
    }
  }, [newUsername]);

  const checkAndShowInputAvatar = useCallback(async (newFile: File): Promise<void> => {
    setNewAvatar(newFile);
  }, []);

  const sendNewAvatarToBack = useCallback(async (): Promise<void> => {
    if (newAvatar) {
      try {
        await updateAvatar(newAvatar);
        setAvatarUrl(URL.createObjectURL(newAvatar));
        setIsUpdatingAvatar(false);
        alert('Avatar updated successfully!');
      } catch (error) {
        if (hasMessage(error)) setError(error.message);
      }
    }
  }, [newAvatar]);

/*

                  o          o              |              o
        ,---.,---..,---.,---..,---.,---.    |    ,---.,---..,---.
        `---.|   |||   ||   |||   ||   |    |    |   ||   |||
        `---'|---'``   '`   '``   '`---|    `---'`---'`---|``---'
             |                     `---'              `---'
*/
  useEffect(() => {
    let timer: NodeJS.Timeout;
    timer = setTimeout(() => {
      setShowLoading(false);
    }, 1000); // Change the delay to 3000ms

    return () => {
      clearTimeout(timer);
      setShowLoading(true);
    };
  }, [username, avatarUrl]);

  if (showLoading) {
    return (
      <div className='container'>
        <LoadingSpinner />
      </div>
    );
  }
/*

    o
    .,---..  ,
    |`---. ><
    |`---''  `
`---'
*/
  return (
    <div className='container'>
      <CSSTransition nodeRef={usernameRef} in={!isUpdatingProfileName} timeout={500} classNames="fade" appear>
        <h3 ref={usernameRef} className=''>{username}</h3>
      </CSSTransition>

      {isUpdatingProfileName && (
        <CSSTransition in={true} timeout={500} classNames="fade" unmountOnExit onExited={() => setIsUpdatingProfileName(false)}>
          <>
            <input type="text" value={newUsername ?? ''} onChange={e => setNewPublicName(e.target.value)} />
            <button onClick={checkUsernameAndUpdate}>Confirm</button>
          </>
        </CSSTransition>
      )}

      <button onClick={() => setIsUpdatingProfileName(!isUpdatingProfileName)}> Update Public Name </button>

      <CSSTransition nodeRef={avatarRef} in={!isUpdatingAvatar} timeout={500} classNames="fade" appear>
        <img ref={avatarRef} className='img' src={avatarUrl ?? ''} alt={`${username ?? 'User'} avatar`} />
      </CSSTransition>


      {isUpdatingAvatar && (
        <CSSTransition in={isUpdatingAvatar} timeout={500} classNames="fade" unmountOnExit onExited={() => setIsUpdatingAvatar(false)}>
          <>
            <input type="file" onChange={e => e.target.files && checkAndShowInputAvatar(e.target.files[0])} />
            <button onClick={sendNewAvatarToBack}>Confirm</button>
          </>
        </CSSTransition>
      )}

      <button onClick={() => setIsUpdatingAvatar(!isUpdatingAvatar)}> Update Avatar </button>

      <SignOutLink />

      {promptError && <p>{promptError}</p>}
    </div>
  );
});

export default Settings;