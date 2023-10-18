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
import { useChannelIdContext, useSetChannelIdContext } from '../contexts/channelIdContext';
import { useSetChannelHeaderContext } from '../contexts/channelHeaderContext';
import { useSocketContext } from '../contexts/socketContext';
import { Socket } from 'socket.io-client';
import { leaveChannel } from './ChannelUtils';

interface ConfirmationPopup{
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

export default function ConfirmationPopup( {setError}: ConfirmationPopup ) {

  const [open, setOpen] = useState<boolean>(false);

  const userId: number = useUserIdContext();
  const channelId: number = useChannelIdContext();
  const socket: Socket = useSocketContext();
  const setChannelId = useSetChannelIdContext();
  const setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>> = useSetChannelHeaderContext();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = async () => {
    try{
      await leaveChannel(userId, channelId, setChannelHeader, socket);
      setChannelId(-1);
    } catch (error: any){
      setError("Admin can't leave channel");
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