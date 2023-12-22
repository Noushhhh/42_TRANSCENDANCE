import React, { useEffect, useState } from "react";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { useSocketContext } from "../contexts/socketContext";
import { Socket } from "socket.io-client";
import { isChannelIsLive } from "./ChannelUtils";
import { useChannelIdContext } from "../contexts/channelIdContext";
import { useUserIdContext } from "../contexts/userIdContext";

function IsConnected(): JSX.Element{

    const [isConnected, setIsConnected] = useState<boolean>(false);

    const socket: Socket = useSocketContext();
    const channelId: number = useChannelIdContext();
    const userId: number = useUserIdContext();

    const callIsChannelIsLive = async () => {
        console.log("is Channel is live is triggered");
        try {
            const res: boolean = await isChannelIsLive(channelId, userId, socket);
            console.log(`res is = ${res}`);
            setIsConnected(res);
        } catch (errors){
            console.log(errors);
        }
    }

    useEffect(() => {
        socket.on("channelNumberMembersChanged", callIsChannelIsLive);
        return () => {
          socket.off("channelNumberMembersChanged", callIsChannelIsLive);
        };
      }, []);

    useEffect(() => {
        const isLive = async () => {
            console.log("call is Live here");
            try {
                const res: boolean = await isChannelIsLive(channelId, userId, socket);
                console.log(`res is = ${res}`);
                setIsConnected(res);
            } catch (errors){console.log(errors)};
        }

        isLive();
    }, [])

    return (
        <div className="logoIsConnected">
            {isConnected ? ( <Brightness1Icon style={{"color": "green"}}/>) : (<RadioButtonUncheckedIcon/>)}
        </div>
    )
}
export default IsConnected;