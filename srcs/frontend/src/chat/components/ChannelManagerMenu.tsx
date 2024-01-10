import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import "../styles/ChannelManagerMenu.css";

interface ChannelManagerMenuProps{
  stateMessageToClick: boolean[];
  setStateMessageToClick: React.Dispatch<React.SetStateAction<boolean[]>>
}

export default function ChannelManagerMenu( {stateMessageToClick, setStateMessageToClick}: ChannelManagerMenuProps ) {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const menu: string[] = ["Create channel", "Join channel"];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleCreateChannel = () => {
    setStateMessageToClick(prevState => {
      const newState = [...prevState];
      newState[0] = !newState[0];
      if (newState[1] === true && newState[0] === true)
        newState[1] = false;
      return newState
    });
  };

  const handleJoinChannel = () => {
    setStateMessageToClick(prevState => {
      const newState = [...prevState];
      newState[1] = !newState[1];
      if (newState[0] === true && newState[1] === true)
        newState[0] = false;
      return newState;
    });
  };
  

  const menuFunctions: { [key: string]: () => void } = {
    "Create channel": handleCreateChannel,
    "Join channel": handleJoinChannel,
  };

  return (
    <div>
      <p
        onClick={handleClick}>
        <AddCircleOutlineIcon className="createChannel"/>
      </p>
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