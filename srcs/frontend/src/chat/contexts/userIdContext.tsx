import { createContext, useContext } from "react";

export const UserIdContext = createContext<number | undefined>(1);

export const useUserIdContext = () => {

    const instance = useContext(UserIdContext);

    if (instance === undefined){
        throw new Error("UserIdContext must be used with userIdContext.Provider")
    }

    return instance;

}