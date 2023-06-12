import React from "react";
import "../styles/HeaderChatBox.css"
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

function HeaderChatBox() {
    return (
        <div className="HeaderChatBox">
            <div className="ContactName">
                <span className="ArrowBackPhone"><ArrowBackIosIcon /></span>
                <RadioButtonUncheckedIcon />
                <p>John Doe</p>
            </div>
            <div className="HeaderChatBoxLogo">
                <DeleteOutlineIcon />
            </div>
        </div>
    )   
}

export default HeaderChatBox;