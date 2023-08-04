import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LogoutIcon from '@mui/icons-material/Logout';
import "../styles/ChannelInfo.css"
import { useUserIdContext } from '../contexts/userIdContext';
import { useChannelIdContext } from '../contexts/channelIdContext';
import { useSetChannelHeaderContext } from '../contexts/channelHeaderContext';
import { useSocketContext } from '../contexts/socketContext';

interface ConfirmationPopup{
    Action: (...args: any[]) => any;
}

export default function ConfirmationPopup( {Action}: ConfirmationPopup ) {

  const [open, setOpen] = useState(false);

  const userId = useUserIdContext();
  const channelId = useChannelIdContext();
  const setChannelHeader = useSetChannelHeaderContext();
  const socket = useSocketContext();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = () => {
    console.log('called');
    try{
      Action(userId, channelId, setChannelHeader, socket);
    } catch (error){
      console.log("Error while leaving channel");
      // NOTIFICATIONS ERROR
    }
    setOpen(false);
  };

  return (
    <div>
      <Button sx={{color:"red"}} onClick={handleClickOpen}>
        <h4 className="clickable"><LogoutIcon style={{ fill: 'red' }} className="icon leaveChannel" />Quitter la discussion</h4>
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          {"Leave channel"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you really want to leave this channel ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleAgree} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}