import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/GoBackButton.css'

const GoBackButton: React.FC = () => {
    const navigate = useNavigate();

    const handleButton = () => {
        navigate('/authchoice');
    }

    return (
        <div style={{alignSelf: 'center'}}>
            <button  className="buttonGoBack" onClick={handleButton}>Go Back</button>
        </div>
    )
}

export default GoBackButton;
