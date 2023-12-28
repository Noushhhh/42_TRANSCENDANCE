import React, { useEffect, FC } from "react";
import { Socket, io } from "socket.io-client";

interface IoConnectionProps {
  setSocket: React.Dispatch<React.SetStateAction<Socket | undefined>>;
  socketRef: React.MutableRefObject<Socket | undefined>;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const IoConnection: FC<IoConnectionProps> = ({ setSocket, socketRef }) => {
  useEffect(() => {
    const fetchAccessToken = async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      const accessToken = data.accessToken;

      if (!socketRef.current) {
        const newSocket = io("http://localhost:4000", {
          auth: {
            token: accessToken,
          },
          autoConnect: false,
        });
        setSocket(newSocket);
        socketRef.current = newSocket;
        newSocket.connect();
      }
    };

    fetchAccessToken();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = undefined;
        setSocket(undefined);
      }
    };
  }, []);

  return <></>;
};

export default IoConnection;
