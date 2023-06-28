import React, { useState, SetStateAction, Dispatch } from "react";
import { TextField } from "@mui/material";

interface SearchBarProps{
    setDisplayResults: Dispatch<SetStateAction<boolean>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
}

function SearchBar( {setDisplayResults, inputValue, setInputValue}: SearchBarProps ){
    const handleInputValue = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter')
        {
            console.log(inputValue);
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        event.target.value.length > 2 ? setDisplayResults(true) : setDisplayResults(false);
      };

    return (
         <div className="searchBar">
            <input value={inputValue} onChange={handleChange} onKeyDown={handleInputValue} type="text" placeholder="Search/create new channel"/>
         </div>
    )
}
export default SearchBar;

