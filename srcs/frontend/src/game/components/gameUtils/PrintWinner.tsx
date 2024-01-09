import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { formatPlayerName } from "../gameNetwork/ScoreBoard";

interface PrintWinnerProps {
  socket: Socket;
}

const PrintWinner: FC<PrintWinnerProps> = ({ socket }) => {
  const [winnerMessage, setWinnerMessage] = useState<string>("");

  useEffect(() => {
    if (winnerMessage) {
      const timeoutId = setTimeout(() => {
        setWinnerMessage("");
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [winnerMessage]);

  useEffect(() => {
    socket.on("printWinner", printWinnerEvent);

    return () => {
      socket.off("printWinner", printWinnerEvent);
    };
  });

  const printWinnerEvent = (winner: string) => {
    setWinnerMessage(formatPlayerName(winner) + " WON!");
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        zIndex: "1",
        backgroundColor: "black",
      }}
    >
      {winnerMessage}
    </div>
  );
};

export default PrintWinner;
