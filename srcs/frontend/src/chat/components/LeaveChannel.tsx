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
  setParentError: React.Dispatch<React.SetStateAction<string | null>>;
  isOwner: boolean | undefined;
  setDisplayNewOwner: React.Dispatch<React.SetStateAction<boolean>>;
  setDisplayMenu: React.Dispatch<React.SetStateAction<boolean>>;
  goBack: () => void;
}

export default function ConfirmationPopup( { setParentError, isOwner, setDisplayNewOwner, setDisplayMenu, goBack }: ConfirmationPopup ) {

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
      if (isOwner === true){
        console.log("need to display new owner");
        setDisplayNewOwner(true)
        setOpen(false);
        setDisplayMenu(false);
        return ;
      }
      await leaveChannel(userId, channelId, setChannelHeader, socket);
      socket.emit("leaveChannel", channelId);
      goBack();
      setChannelId(-1);
    } catch (error: any){
      console.log(error.message);
      setParentError(error.message);
    }
    setOpen(false);
  };

  return (
    <div>
      <Button sx={{color:"red"}} onClick={handleClickOpen}>
        <h4 className="clickable"><LogoutIcon style={{ fill: 'red' }} className="icon leaveChannel" />Leave channel</h4>
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