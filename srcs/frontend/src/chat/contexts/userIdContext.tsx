import { createContext, useContext } from "react";

interface UserIdContextProps{
    userId: number;
    setUserId: (id: number) => void;
}

export const UserIdContext = createContext<UserIdContextProps | undefined>(undefined);

export const useUserIdContext = () => {

    const instance = useContext(UserIdContext);

    if (instance === undefined){
        throw new Error("UserIdContext must be used with userIdContext.Provider")
    }

    return instance.userId;
}

export function useSetChannelHeaderContext(){
    const instance = useContext(UserIdContext);

    if (instance === undefined){
        throw new Error("UserIdContext must be used with ChannelIdContext.Provider")
    }

    return instance.setUserId;
}