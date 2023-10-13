import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { GameConfig, gameConfig } from "../../assets/gameConfig";
import { ChangeEvent } from "react";

interface GameCustomizationMenuProps {
  socket: Socket;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const colorInputStyle = {
  width: "4rem",
  height: "2rem",
  marginBottom: "0.5rem",
};

const GameCustomizationMenu: FC<GameCustomizationMenuProps> = ({ socket, setShowMenu }) => {
  const [color, setColor] = useState<string>("#FFFFFF");

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  const sendColor = () => {
    socket.emit("getColor", color);
    setShowMenu(false);
  };

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "1",
        margin: "0px",
        padding: "0.5rem",
        backgroundColor: "white",
        borderRadius: "0.3rem",
        color: "black",
      }}
    >
      <p>Paddle color!</p>
      <input
        style={colorInputStyle}
        type="color"
        name="color"
        id="color"
        value={color}
        onChange={handleColorChange}
      />
      <button onClick={sendColor}>Ok!</button>
    </div>
  );
};

export default GameCustomizationMenu;
