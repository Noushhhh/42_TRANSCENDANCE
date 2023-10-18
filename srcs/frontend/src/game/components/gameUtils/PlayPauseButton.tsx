import React, { FC } from "react";
import Button from "../common/Button";

interface PlayPauseButtonProps {
  isPaused: boolean;
  handlePlayPause: () => void;
}

const buttonStyle: React.CSSProperties = {
  fontSize: "0.5rem",
};

const PlayPauseButton: FC<PlayPauseButtonProps> = ({
  isPaused,
  handlePlayPause,
}) => {
  return (
    <div>
      <Button onClick={() => handlePlayPause()} style={buttonStyle}>
        {isPaused ? "Play" : "Pause"}
      </Button>
    </div>
  );
};

export default PlayPauseButton;
