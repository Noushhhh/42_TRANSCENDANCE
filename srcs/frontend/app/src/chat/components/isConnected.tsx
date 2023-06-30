import React from "react";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Brightness1Icon from '@mui/icons-material/Brightness1';

interface isConnectedProps{
    isConnected: boolean;
}

function IsConnected({ isConnected }: isConnectedProps): JSX.Element{

    return (
        <div className="logoIsConnected">
            {isConnected ? ( <Brightness1Icon style={{"color": "green"}}/>) : (<RadioButtonUncheckedIcon/>)}
        </div>
    )
}
export default IsConnected;