import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface SocketErrorProps {
  socket: Socket | undefined;
}

interface SocketErrorObj {
  statusCode: number;
  message: string;
}

const SocketError: FC<SocketErrorProps> = ({ socket }) => {
  const [error, setError] = useState<string>("");
  const [errorStatus, setErrorStatus] = useState<number>(0);

  useEffect(() => {
    socket?.on("error", handleError);
    console.log("socket.id = ", socket?.id);

    return () => {
      socket?.off("error", handleError);
    };
  });

  const handleError = (error: SocketErrorObj) => {
    setError(error.message);
    setErrorStatus(error.statusCode);
    console.error("error %d : %s", error.statusCode, error.message);
    setTimeout(() => {
      setError("");
      setErrorStatus(0);
    }, 1500);
  };

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
