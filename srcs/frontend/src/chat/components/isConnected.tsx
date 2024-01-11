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
        try {
            const res: boolean = await isChannelIsLive(channelId, userId, socket);
            setIsConnected(res);
        } catch (errors){}
    }

    useEffect(() => {
        socket.on("channelNumberMembersChanged", callIsChannelIsLive);
        return () => {
          socket.off("channelNumberMembersChanged", callIsChannelIsLive);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    useEffect(() => {
        const isLive = async () => {
            try {
                const res: boolean = await isChannelIsLive(channelId, userId, socket);
                setIsConnected(res);
            } catch (errors){console.log(errors)};
        }
        isLive();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="logoIsConnected">
            {isConnected ? ( <Brightness1Icon style={{"color": "green"}}/>) : (<RadioButtonUncheckedIcon/>)}
        </div>
    )
}
export default IsConnected;