import React from "react";
import "../styles/MessageToClick.css";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TimeElapsed from "./TimeElapsed";

interface Channel{
    name: string,
    lastMsg : string,
    dateLastMsg: Date,
  }


  interface MessageToClickProps {
    channel: Channel;
  }

function MessageToClick(props: MessageToClickProps) {

    
    const { channel } = props;
    const dateObject = new Date(channel.dateLastMsg);
    
    console.log(typeof(channel.dateLastMsg));

    return (
        <div className="MessageToClick">
            <div className="logoIsConnected">
                <RadioButtonUncheckedIcon/>
            </div>
            <div className="ContainerPreview">
                <div className="MessageToClickTitle">
                    <p className="senderName">{channel.name}</p>
                    <p className="dateMessage">{<TimeElapsed date={dateObject} />}</p>
                </div>
                <div className="ContentMessageTitle">
                    <p className="PreviewMessage">{channel.lastMsg}</p>
                </div>
            </div>
        </div>
    )   
}

export default MessageToClick;