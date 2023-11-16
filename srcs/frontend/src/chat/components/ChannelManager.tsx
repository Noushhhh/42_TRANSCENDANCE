import React from "react";
import JoinChannel from "./JoinChannel";
// import "../styles/ChannelManager.css";
import CreateChannelPopup from "./CreateChannelPopup";

interface ChannelManagerProps {
    display: boolean[];
    setStateMessageToClick: React.Dispatch<React.SetStateAction<boolean[]>>;
}

function ChannelManager({ display,setStateMessageToClick }: ChannelManagerProps) {

    return (
        <div style={{height:"calc(100% - 60px)"}}>
            {display[0] ? <CreateChannelPopup setIsDisplay={setStateMessageToClick}/> : null}
            {display[1] ? <JoinChannel setStateMessageToClick={setStateMessageToClick}/> : null}
        </div>
    )

} export default ChannelManager;