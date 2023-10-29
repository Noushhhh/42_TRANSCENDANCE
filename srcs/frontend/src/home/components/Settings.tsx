
import React, { useEffect, useState } from 'react';
import { getPublicName, getUserAvatar, updatePublicName, updateAvatar } from '../tools/Api'
import SignOutLink from '../tools/SignoutLink' 

const Settings: React.FC = () => {
  const [username, setPublicName] = useState<string>('');
  const [newUsername, setNewPublicName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingProfileName, setIsUpdatingProfileName] = useState(false);


  useEffect(() => {
    async function fetchData() {
      const userInfo = await getPublicName();
      const userAvatar = await getUserAvatar();
      console.log(`Passing by settings componet, testing user ProfileName: ${userInfo} \nand Avatar ${userAvatar}\n`);
      if (userInfo && userAvatar) {
        setPublicName(userInfo);
        setAvatarUrl(userAvatar);
      }
      else
      {
        console.error('There is an error when fetching the information,\
         please contant the system administrator')
      }
    }

    fetchData();
  }, []);

  // update new Username in backend, I have to think about showing to the client if the name is
  // available to be update and it is not taken by other person.
  const checkUsernameAndUpdate = async () => {
    if (newUsername) {
      const response = await updatePublicName(newUsername);
      if (response.ok)
        setPublicName(newUsername);
    }
  };

  // Check if the avatar image meets the condition to be send to backend,
  // and renders new avatar in componet if everthing is ok
  const checkAndShowInputAvatar = async (newFile: File) => {
    
    setNewAvatar(newFile);
    setAvatarUrl(URL.createObjectURL(newFile));
  }

  //send new avatar to backend, if the file is checked,
  // and there is a file in the newAvatar variable
  const sendNewAvatarToBack = async () => {
    try {
      await updateAvatar(newAvatar);
    } catch (error) {
      console.error(error);
    }
  };

  return (

    <div className='container'>

      <h3>{username}</h3>

      {/* show input option if user wants to update public username */}
      {isUpdatingProfileName && (
        <>
          <input type="text" value={newUsername} onChange={e => setNewPublicName(e.target.value)} />

          <button onClick={checkUsernameAndUpdate}>Confirm</button>
        </>
      )}
      {/* Activate public username show option */}
      <button onClick={()=> setIsUpdatingProfileName(!isUpdatingProfileName)}> Update Public Name </button>

      {/* Avatar image */}
      <img  className='img' src={avatarUrl} alt={`${username} avatar`} />

      {/* show input option if user wants to update avatar */}
      {isUpdatingAvatar && (
        <>
          {/*  I use here a short-sicuit evaluation to check if e.target.files exist before executing setNewAvatar */}
          <input type="file" onChange={e => e.target.files && checkAndShowInputAvatar(e.target.files[0])} />
          <button onClick={sendNewAvatarToBack}>Update avatar</button>
        </>
      )}

      {/* signout component  */}
      <SignOutLink/>
    </div>
  );
};

export default Settings;
