import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | undefined>(undefined);

export function useSocketContext(){
    const instance = useContext(SocketContext);

    if (instance === undefined){
        throw new Error("SocketContext must be used with SocketContext.Provider")
    }

    return instance;
}