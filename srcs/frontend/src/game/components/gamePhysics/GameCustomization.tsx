import React, { FC, useState } from "react";
import GameCustomizationMenu from "./GameCustomizationMenu";
import { Socket } from "socket.io-client";

interface GameCustomizationProps {
  socket: Socket;
}

const GameCustomization: FC<GameCustomizationProps> = ({ socket }) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [paddleSizeValue, setPaddleSizeValue] = useState<number>(1.25);

  return (
    <div style={{ position: "absolute", top: "5%", left: "5%" }}>
      <button
        style={{ fontSize: "0.5rem" }}
        onClick={() => setShowMenu(!showMenu)}
      >
        Settings
      </button>
      {showMenu === true ? (
        <GameCustomizationMenu
          socket={socket}
          paddleSizeValue={paddleSizeValue}
          setPaddleSizeValue={setPaddleSizeValue}
        />
      ) : null}
    </div>
  );
};

export default GameCustomization;
