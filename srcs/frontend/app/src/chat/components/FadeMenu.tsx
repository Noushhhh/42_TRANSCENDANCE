import React, { useContext } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { useState } from 'react';
import axios from 'axios';
import { isChannelExist, createChannel, fetchUser } from './ChannelUtils';
import { ChannelIdContext, useChannelIdContext, useSetChannelIdContext } from '../contexts/channelIdContext';
import { useSetChannelHeaderContext } from '../contexts/channelHeaderContext';
import { useSocketContext } from '../contexts/socketContext';

interface FadeMenuProps {
  user: { username: string; id: number; };
  simulatedUserId: number;
}

export default function FadeMenu({ user, simulatedUserId }: FadeMenuProps) {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const setChannelHeader = useSetChannelHeaderContext();
  const setChannelId = useSetChannelIdContext();
  const socket = useSocketContext();

  // const [idOfParticipants, setIdOfParticipants] = useState<number[]>([]);

  const open = Boolean(anchorEl);
  const menu: string[] = ["Profile", "Private message", "Play", "Block"];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfilClick = () => {
    console.log("Profil clicked!");
    // Ajoutez ici la logique pour "Profil"
  };

  const handlePrivateMessageClick = async () => {
    console.log("Message prive clicked!");
    const response = await isChannelExist([simulatedUserId, user.id]);
    if (response !== -1)
    {
      setChannelId(response);
    } else {
      // creer channel puis fetch
      const response = await axios.post(
        'http://localhost:4000/api/chat/addChannelToUser',
        {
          name: "",
          password: "",
          ownerId: simulatedUserId,
          participants: [simulatedUserId, user.id],
          type: 0,
        }
      );
      fetchUser(setChannelHeader, simulatedUserId, socket);
    }
  };

  const handlePlayClick = () => {
    console.log("Jouer clicked!");
    // Ajoutez ici la logique pour "Jouer"
  };

  const handleBlockClick = () => {
    console.log("Bloquer clicked!");
    // Ajoutez ici la logique pour "Bloquer"
  };

  const menuFunctions: { [key: string]: () => void } = {
    Profile: handleProfilClick,
    'Private message': handlePrivateMessageClick,
    Play: handlePlayClick,
    Block: handleBlockClick,
  };

  return (
    <div>
      <p
        onClick={handleClick}
        className="User">
        {user.username}</p>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {menu.map((item, index) => {
          return (<MenuItem key={index} onClick={menuFunctions[item]}>{item}</MenuItem>)
        })}
      </Menu>
    </div>
  );
}