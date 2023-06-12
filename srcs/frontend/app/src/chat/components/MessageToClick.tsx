import React from "react";
import "../styles/MessageToClick.css";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

function MessageToClick() {

    const message1 = "Voici un message trop long qui va passer par substr pour le reduire";
    const message2 = "Hey mec ! Comment ca va depuis le temps ?? enorme !!!!";

    return (
        <div className="MessageToClick">
            <div className="logoIsConnected">
                <RadioButtonUncheckedIcon/>
            </div>
            <div className="ContainerPreview">
                <div className="MessageToClickTitle">
                    <p className="senderName">John Doe</p>
                    <p className="dateMessage">4 semaines</p>
                </div>
                <div className="ContentMessageTitle">
                    <p className="PreviewMessage">{message1}</p>
                </div>
            </div>
        </div>
    )   
}

export default MessageToClick;