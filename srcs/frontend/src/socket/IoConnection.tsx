import React, { useEffect, FC } from "react";
import { Socket, io } from "socket.io-client";

interface IoConnectionProps {
  setSocket: React.Dispatch<React.SetStateAction<Socket | undefined>>;
  socketRef: React.MutableRefObject<Socket | undefined>;
}

const IoConnection: FC<IoConnectionProps> = ({ setSocket, socketRef }) => {
  useEffect(() => {
    console.log("RENDER");
  }, []);

  useEffect(() => {
    const fetchAccessToken = async () => {
      const response = await fetch("http://localhost:4000/api/auth/token", {
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

        console.log("SOCKET ID = ", newSocket.id);
      }
    };

    fetchAccessToken();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = undefined;
        setSocket(undefined);
      }
      console.log("RETURN");
    };
  }, []);

  return <></>;
};

export default IoConnection;
