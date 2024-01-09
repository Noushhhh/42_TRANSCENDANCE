import React, { FC, useEffect } from "react";
import { Socket } from "socket.io-client";

interface SocketErrorProps {
  socket: Socket | undefined;
  error: string;
  handleError: (error: SocketErrorObj) => void;
}

interface SocketErrorObj {
  statusCode: number;
  message: string;
}

const SocketError: FC<SocketErrorProps> = ({ socket, error, handleError }) => {
  useEffect(() => {
    socket?.on("error", handleError);

    return () => {
      socket?.off("error", handleError);
    };
  });

  return (
    <div
      style={{
        position: "absolute",
        color: "red",
        top: "10px",
        left: "6px",
        fontSize: "0.75rem",
        background: "white",
        borderRadius: "5px",
        padding: "0 4px",
        fontWeight: "600",
      }}
    >
      {error}
    </div>
  );
};

export default SocketError;
