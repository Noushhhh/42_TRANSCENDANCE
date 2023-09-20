import { createContext, useContext } from "react";

interface ChannelheaderProps{
    channelHeader: Channel[];
    setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>
}

export const ChannelHeaderContext = createContext<ChannelheaderProps | undefined>(undefined);

export function useChannelHeaderContext(){
    const channelHeader = useContext(ChannelHeaderContext);

    if (channelHeader === undefined){
        throw new Error("ChannelHeaderContext must be used with ChannelIdContext.Provider")
    }

    return channelHeader.channelHeader;
}

export function useSetChannelHeaderContext(){
    const channelHeader = useContext(ChannelHeaderContext);

    if (channelHeader === undefined){
        throw new Error("ChannelHeaderContext must be used with ChannelIdContext.Provider")
    }

    return channelHeader.setChannelHeader;
}