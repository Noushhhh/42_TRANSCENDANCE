import React, { FC, useEffect } from "react";
import { Socket } from "socket.io-client";
import { toast, ToastContainer } from 'react-toastify';

interface SocketErrorProps {
  socket: Socket | undefined;
}

const SocketError: FC<SocketErrorProps> = ({ socket }) => {
  useEffect(() => {
    socket?.on("error", handleError1);

    return () => {
      socket?.off("error", handleError1);
    };
  });

  const handleError1 = (message: string) => {
    toast.error(message);
  }

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
      <ToastContainer />
    </div>
  );
};

export default SocketError;
