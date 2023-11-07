import React, { FC, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface SocketErrorProps {
  socket: Socket;
}

interface SocketErrorObj {
  statusCode: number;
  message: string;
}

const SocketError: FC<SocketErrorProps> = ({ socket }) => {
  const [error, setError] = useState<string>("");
  const [errorStatus, setErrorStatus] = useState<number>();

  useEffect(() => {
    socket.on("error", handleError);

    return () => {
      socket.off("error", handleError);
    };
  }, []);

  const handleError = (error: SocketErrorObj) => {
    setError(error.message);
    setErrorStatus(error.statusCode);
    console.error("error %d : %s", error.statusCode, error.message);
  };

  return <div style={{color: "red"}}>{error}</div>;
};

export default SocketError;
