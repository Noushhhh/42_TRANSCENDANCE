import { createContext, useContext } from "react";

interface ChannelContextProps{
    channelId: number;
    setChannelId: (id: number) => void;
}

export const ChannelIdContext = createContext<ChannelContextProps | undefined>(undefined);

export function useChannelIdContext(){
    const instance = useContext(ChannelIdContext);

    if (instance === undefined){
        throw new Error("ChannelIdContext must be used with ChannelIdContext.Provider")
    }

    return instance.channelId;
}

export function useSetChannelIdContext(){
    const instance = useContext(ChannelIdContext);

    if (instance === undefined){
        throw new Error("ChannelIdContext must be used with ChannelIdContext.Provider")
    }

    return instance.setChannelId;
}