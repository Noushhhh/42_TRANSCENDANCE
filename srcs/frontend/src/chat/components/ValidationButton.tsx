import React from "react";
import DoneIcon from '@mui/icons-material/Done';
import "../styles/ValidationButton.css";

interface ValidationButtonProps{
    action: (...args: any[]) => any;
    size:{
        height:number,
        width:number,
    }
    position:{
        top:number,
        left:number,
    }
}


function ValidationButton( { action, size, position }:ValidationButtonProps ) {

    return (
        <div className="validationButton"
            style={{height:`${size.height}px`, width:`${size.width}px`, 
                    top:`${position.top}px`, left:`${position.left}px`}}>
            <DoneIcon onClick={action} className="icon" />
        </div>
    )
} export default ValidationButton;
