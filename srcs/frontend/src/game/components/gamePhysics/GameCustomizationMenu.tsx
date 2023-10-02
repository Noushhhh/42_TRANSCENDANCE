import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { GameConfig, gameConfig } from "../../assets/gameConfig";

interface GameCustomizationMenuProps {
  setPaddleSizeValue: React.Dispatch<React.SetStateAction<number>>;
  paddleSizeValue: number;
  socket: Socket;
}

const elemStyle = {
  position: "absolute",
  margin: "0px",
  padding: "0.5rem",
  backgroundColor: "white",
  borderRadius: "0.3rem",
  color: "black",
};

const GameCustomizationMenu: FC<GameCustomizationMenuProps> = ({
  paddleSizeValue,
  setPaddleSizeValue,
  socket,
}) => {
  const handlePaddleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(event.target.value);
    console.log(num);
    setPaddleSizeValue(num);
    gameConfig.paddleHeight = 150 * num;
  };

  const updatePaddleSize = () => {
    socket.emit("updatePaddleSize", paddleSizeValue);
  };

  return (
    <div style={elemStyle}>
      <label>
        Paddle Size
        <input
          id="paddleSize"
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={paddleSizeValue}
          onChange={handlePaddleInput}
        />
      </label>
      <button onClick={updatePaddleSize}>Ok!</button>
    </div>
  );
};

export default GameCustomizationMenu;
