import React, { FC, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface MobileControlsProps {
  socket: Socket;
}

const MobileControls: FC<MobileControlsProps> = ({ socket }) => {
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleButtonPress = (buttonValue: string) => {
    setIsButtonPressed(true);
    intervalRef.current = window.setInterval(() => {
      if (buttonValue === "up") {
        socket.emit("getPlayerPos", "up");
      }
      if (buttonValue === "down") {
        socket.emit("getPlayerPos", "down");
      }
    }, 8);
  };

  const handleButtonRelease = () => {
    setIsButtonPressed(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "0.5rem",
        width: "85%",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <button
        onTouchStart={() => handleButtonPress("up")}
        onTouchEnd={handleButtonRelease}
      >
        Up
      </button>
      <button
        onTouchStart={() => handleButtonPress("down")}
        onTouchEnd={handleButtonRelease}
      >
        Down
      </button>
    </div>
  );
};

export default MobileControls;
