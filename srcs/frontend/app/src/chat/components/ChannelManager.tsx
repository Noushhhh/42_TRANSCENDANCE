import React from "react";
import CreateChannel from "./CreateChannel";
import JoinChannel from "./JoinChannel";
// import "../styles/ChannelManager.css";
import CreateChannelPopup from "./CreateChannelPopup";

interface ChannelManagerProps {
    display: boolean[];
    setStateMessageToClick: React.Dispatch<React.SetStateAction<boolean[]>>;
    displayState: string;
}

function ChannelManager({ display,setStateMessageToClick, displayState }: ChannelManagerProps) {

    return (
        <div style={{height:"calc(100% - 60px)"}}>
            {display[0] ? <CreateChannelPopup displayState={displayState} /> : null}
            {display[1] ? <JoinChannel setStateMessageToClick={setStateMessageToClick}/> : null}
        </div>
    )

} export default ChannelManager;