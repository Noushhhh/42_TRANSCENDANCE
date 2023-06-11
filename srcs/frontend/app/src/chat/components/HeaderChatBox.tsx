import React from "react";
import "../styles/HeaderChatBox.css"
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

function HeaderChatBox() {
    return (
        <div className="HeaderChatBox">
            <div className="ContactName">
                <RadioButtonUncheckedIcon/>
                <p>John Doe</p>
            </div>
            <div className="HeaderChatBoxLogo">
                <DeleteOutlineIcon/>
            </div>
        </div>
    )   
}

export default HeaderChatBox;