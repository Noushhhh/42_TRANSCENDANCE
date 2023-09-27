import "../../styles/ScoreBoard.css";
import React, { FC, useEffect, useState } from "react";
import { ScoreBoardProps, GameState } from "../../assets/data";

const ScoreBoard: FC<ScoreBoardProps> = ({ socket }) => {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  useEffect(() => {
    socket.on("updateGameState", updateGameStateListener);
    return () => {
      socket.off("updateGameState", updateGameStateListener);
    };
  }, [socket]);

  const updateGameStateListener = (gameState: GameState) => {
    setP1Score(gameState.score.p1Score);
    setP2Score(gameState.score.p2Score);
  };

  return (
    <div
      className="ScoreBoard"
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        fontSize: "1rem",
        width: "70%",
      }}
    >
      <div style={{ color: "white" }}>{p1Score}</div>
      <div style={{ color: "white" }}>{p2Score}</div>
    </div>
  );
};

export default ScoreBoard;
