import React, { FC, useEffect, useState } from "react";
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
  // const [error, setError] = useState<string>("");
  // const [errorStatus, setErrorStatus] = useState<number>(0);

  useEffect(() => {
    socket?.on("error", handleError);

    return () => {
      socket?.off("error", handleError);
    };
  });

  // const handleError = (error: SocketErrorObj) => {
  //   setError(error.message);
  //   console.error("error %d : %s", error.statusCode, error.message);
  //   setTimeout(() => {
  //     setError("");
  //   }, 1500);
  // };

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
