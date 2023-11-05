import { useRef, useEffect } from "react";
import { Socket, io } from "socket.io-client";

export const useConnectSocket = (tokenUrl: string, socketUrl: string) => {
  const socketRef = useRef<Socket | undefined>();

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch(tokenUrl, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        const accessToken = data.accessToken;

        if (!socketRef.current) {
          const newSocket = io(socketUrl, {
            auth: {
              token: accessToken,
            },
            autoConnect: false,
          });

          socketRef.current = newSocket;
          newSocket.connect();
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
      }
    };

    fetchAccessToken();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [socketUrl, tokenUrl]);

  return socketRef.current;
};
