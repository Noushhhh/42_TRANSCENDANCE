import React, { useState, useEffect } from "react";
import Konva from "konva";
import { Rect } from "react-konva";
import { Height } from "@mui/icons-material";

const traitStyle = {
  width: "30px",
  minHeight: "1px",
  height: "100%",
  backgroundColor: "white",
}

const MiddleLine = () => {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "75%",
        gap: "6rem"
      }}
    >
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      {/* <div style={{width: "30px", height: "200px", backgroundColor: "white"}}></div>
      <div style={{width: "30px", height: "200px", backgroundColor: "white"}}></div>
      <div style={{width: "30px", height: "200px", backgroundColor: "white"}}></div>
      <div style={{width: "30px", height: "200px", backgroundColor: "white"}}></div>
      <div style={{width: "30px", height: "200px", backgroundColor: "white"}}></div> */}
    </div>
  );
};

export default MiddleLine;
