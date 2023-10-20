import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

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

      // Cleanup the timeout if the component unmounts or winnerMessage changes
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
    setWinnerMessage(winner);
  };

  return <div style={{ position: "absolute", top: "26rem" }}>{winnerMessage}</div>;
};

export default PrintWinner;
