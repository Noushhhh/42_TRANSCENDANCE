import React, { useEffect, useState, useCallback } from 'react';
import { getPublicName, getUserAvatar, useUpdatePublicName, useUpdateAvatar, hasMessage } from '../tools/Api';
import SignOutLink from '../tools/SignoutLink';
import { CSSTransition } from 'react-transition-group';
import  '../styles/generalStyles.css'
import LoadingSpinner from '../tools/LoadingSpinner'; // New import for a loading spinner component
import TwoFA from './TwoFA';



/*

                                        |
,---.,---.,-.-.,---.,---.,---.,---.,---.|---
|    |   || | ||   ||   ||   ||---'|   ||
`---'`---'` ' '|---'`---'`   '`---'`   '`---'
               |
*/
const Settings: React.FC = React.memo(() => {

  const [username, setPublicName] = useState<string | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [newUsername, setNewPublicName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isUpdatingProfileName, setIsUpdatingProfileName] = useState(false);
  const [promptError, setError] = useState<string | null>(null);
  const { updateAvatar, isLoading: isAvatarUpdating} = useUpdateAvatar();
  const { updatePublicName, isLoading: isPublicNameLoading} = useUpdatePublicName();

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

    return () => {
      setError(null);
    };

  }, []);


  const checkUsernameAndUpdate = useCallback(async (): Promise<void> => {

    try {
      await updatePublicName(newUsername);
      if (newUsername) {
        setPublicName(newUsername);
        setNewPublicName(null);
      }
      // if pubicName updated successfully, set the publicName var to newUsername 
      // before re-rendering the component so the user can see the update inmediatelly
    } catch (error) {
      console.error("Failed to update ProfileName:", error);
      setError(hasMessage(error)? error.message: "Failed to update ProfileName");
      setIsUpdatingProfileName(false);
    }
    if (newUsername)
      setNewPublicName(null);
  }, [newUsername, setNewPublicName, updatePublicName]);

  const checkAndShowInputAvatar = useCallback(async (newFile: File): Promise<void> => {
    setNewAvatar(newFile);
  }, []);

  const sendNewAvatarToBack = useCallback(async (): Promise<void> => {
    try {
      await updateAvatar(newAvatar);
      if (newAvatar)
        setAvatarUrl(URL.createObjectURL(newAvatar));
    } catch (error) {
      // Error handling is managed by avatarUpdateError from the useUpdateAvatar hook
      console.error("Failed to update avatar:", error);
      setError(hasMessage(error) ? error.message : "Failed to update avatar");
      setIsUpdatingAvatar(false);
    }
  }, [newAvatar, updateAvatar]);

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

  if (showLoading || isAvatarUpdating || isPublicNameLoading) {
    return (
      <div className='settings-container'>
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
    <div className='settings-container'>
      {/* nodeRef for username */}
      <CSSTransition nodeRef={usernameRef} in={!isUpdatingProfileName} timeout={500} classNames="fade" appear>
        <h3  className="h3" ref={usernameRef} >{username}</h3>
      </CSSTransition>

      {/* {promptError && <p>{promptError}</p>} */}
      {promptError && (
  <div className='error-message'>
    <p>{promptError}</p>
    <button onClick={() => setError(null)}>Dismiss</button>
  </div>
)}

      {isUpdatingProfileName && (
        <CSSTransition in={true} timeout={500} classNames="fade" unmountOnExit onExited={() => setIsUpdatingProfileName(false)}>
          <>
            <input type="text" className='item' value={newUsername ?? ''} onChange={e => setNewPublicName(e.target.value)} />
            <button className="button" style={{'margin' : '2%'}} onClick={checkUsernameAndUpdate}>Confirm</button>
          </>
        </CSSTransition>
      )}

      <button className="button" onClick={() => setIsUpdatingProfileName(!isUpdatingProfileName)}> Update Public Name </button>

      {/* nodeRef for avatar */}
      <CSSTransition nodeRef={avatarRef} in={!isUpdatingAvatar} timeout={500} classNames="fade" appear>
        <img ref={avatarRef}  className='item' src={avatarUrl ?? ''} alt={`avatar`} />
      </CSSTransition>


      {isUpdatingAvatar && (
        <CSSTransition in={isUpdatingAvatar} timeout={500} classNames="fade" unmountOnExit onExited={() => setIsUpdatingAvatar(false)}>
          <>
            <input type="file"  style={{'margin' : "1%" , 'color' : 'white'}} onChange={e => e.target.files && checkAndShowInputAvatar(e.target.files[0])} />
            <button className="button" style={{'margin' : '2%'}} onClick={sendNewAvatarToBack}>Confirm</button>
          </>
        </CSSTransition>
      )}

      <button className="button" style={{'marginTop': '1%'}} onClick={() => setIsUpdatingAvatar(!isUpdatingAvatar)}> Update Avatar </button>

      <TwoFA />

      <div style={{'marginTop' : '3%'}}>
        < SignOutLink />
      </div>


    </div>
  );
});

export default Settings;