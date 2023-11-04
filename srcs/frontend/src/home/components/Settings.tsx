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

  // We're creating a "ref" for our username and avatar elements.
  // Think of a "ref" like a name tag that we're putting on these elements so we can find them easily later.
  // Why is this important? Well, imagine if you're a magician and you have to perform a magic trick on someone in a crowd, but you don't know who that person is. It would be pretty hard, right?
  // That's why we use "ref". It makes sure our magic trick (the transition) works on the right person (the element)!
  const usernameRef = React.useRef(null);
  const avatarRef = React.useRef(null);

  

  const fetchPublicName = async (): Promise<void> => {
    try {
      const userNameResultFromBack = await getPublicName();
      setPublicName(userNameResultFromBack);

    } catch (error) {
      if (hasMessage(error))
        setError(error.message);
      else
        setError('Error getting publicName');
    }
  }

  const fetchUserAvatar = async (): Promise<void> => {
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
      await updatePublicName(newUsername);
      setPublicName(newUsername);
      alert('Username updated successfully!');
      setIsUpdatingProfileName(false);
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

  // Now we're using our "CSSTransition" component. This is like a magic trick that makes our elements appear and disappear smoothly!
  // But for the magic trick to work, it needs to know exactly which element it's working with.
  // That's where our "ref" comes in. We give it to the "CSSTransition" component using the "nodeRef" prop.
  // We also give it to our element using the "ref" prop. This way, the "CSSTransition" component can find our element easily, just like how we can find someone easily if they're wearing a name tag!

  return (
    <div className='container'>
      {/* nodeRef for username */}
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

      {/* nodeRef for avatar */}
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