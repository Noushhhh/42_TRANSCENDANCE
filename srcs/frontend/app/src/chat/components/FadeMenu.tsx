import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';

interface FadeMenuProps {
  user: { username: string; id: number; };
  // child: React.Component;
}

export default function FadeMenu({ user }: FadeMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menu: string[] = ["Profil", "Message prive", "Jouer", "Bloquer"];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
          return (<MenuItem key={index} onClick={handleClose}>{item}</MenuItem>)
        })}
      </Menu>
    </div>
  );
}