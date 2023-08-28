import React from "react";
import { useState, ChangeEvent } from "react";

interface SimulatedUserIdProps{
    setSimulatedUserId: React.Dispatch<React.SetStateAction<number>>;
}

function SimulateUserId( {setSimulatedUserId}: SimulatedUserIdProps ){

    const [userIdValue, setUserIdValue] = useState<string>("");

    const handleClick = () => {
        setSimulatedUserId(Number(userIdValue));
        setUserIdValue("");
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setUserIdValue(event.target.value)
    }

    return (
        <div>
            <p>userId setter(as the auth is not finished) make sure to entend a valid ID</p>
            <input type="text" onChange={handleChange}/>
            <button style={{ backgroundColor: "blue", color: "white" }} onClick={handleClick}>SET</button>
        </div>
    )

} 

export default SimulateUserId;