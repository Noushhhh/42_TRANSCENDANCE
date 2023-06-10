import React, { useState } from "react";
import GamePhysics from "./GamePhysics";
import ScoreBoard from "./ScoreBoard";
import "../styles/GameContainer.css";

function GameContainer() {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  return (
    <div className="GameContainer">
      <ScoreBoard p1Score={p1Score} p2Score={p2Score} />
      <GamePhysics
        setP1Score={setP1Score}
        setP2Score={setP2Score}
        isPaused={isPaused}
      />
      <button
        style={{ position: "absolute", top: "5%", right: "15%" }}
        onClick={() => setIsPaused(!isPaused)}
      >
        {isPaused ? "Play" : "Pause"}
      </button>
    </div>
  );
}

export default GameContainer;
