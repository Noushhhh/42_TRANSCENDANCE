import React, { FC, useEffect } from "react";

interface AutoLaunchProps {
  start: () => void;
  setGameLaunchedRef: () => void;
  handlePlayPause: () => void;
}

const AutoLaunch: FC<AutoLaunchProps> = ({
  start,
  setGameLaunchedRef,
  handlePlayPause,
}) => {
  useEffect(() => {
    setTimeout(() => {
      start();
      setGameLaunchedRef();
      handlePlayPause();
    }, 1500);
  }, []);

  return true;
};

export default AutoLaunch;
