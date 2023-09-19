import React, { useState, useEffect } from "react";
import Konva from "konva";
import { Rect } from "react-konva";

const MiddleLine = () => {
  const [divSize, setDivSize] = useState<number>(window.innerWidth * (6 / 12));
  const [traitGap, setTraitGap] = useState<number>(
    (window.innerWidth * (6 / 12)) / 12
  );
  const [traitWidth, setTraitWidth] = useState<number>(
    (window.innerWidth * (6 / 12)) / 30
  );

  const traitStyle = {
    width: traitWidth,
    minHeight: "1px",
    height: "100%",
    backgroundColor: "white",
  };

  useEffect(() => {
    updateDivSize();
    window.addEventListener("resize", updateDivSize);
    return () => {
      window.removeEventListener("resize", updateDivSize);
    };
  });

  const updateDivSize = () => {
    const divSize = window.innerWidth * (6 / 12);
    const traitGap = (window.innerWidth * (6 / 12)) / 12;
    const traitWidth = (window.innerWidth * (6 / 12)) / 30;
    setDivSize(divSize);
    setTraitGap(traitGap);
    setTraitWidth(traitWidth);
  };

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: divSize,
        gap: traitGap,
      }}
    >
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
      <div style={traitStyle}></div>
    </div>
  );
};

export default MiddleLine;
