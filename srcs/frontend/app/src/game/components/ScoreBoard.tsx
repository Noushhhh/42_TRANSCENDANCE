import "../styles/ScoreBoard.css";
import React from "react";

function ScoreBoard({p1Score = 0, p2Score = 0}) {

  return (
    <div className="ScoreBoard">
      <div>{p1Score}</div>
      <div>{p2Score}</div>
    </div>
  );
}

export default ScoreBoard;
