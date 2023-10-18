import "../../styles/ScoreBoard.css";
import React, { FC, useEffect, useState } from "react";
import { ScoreBoardProps, GameState } from "../../assets/data";

const ScoreBoard: FC<ScoreBoardProps> = ({ socket }) => {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Name, setP1Name] = useState<string>("");
  const [p2Name, setP2Name] = useState<string>("");

  useEffect(() => {
    fetch(`http://localhost:4000/api/game/playerName?clientId=${socket.id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    socket.on("updateGameState", updateGameStateListener);
    return () => {
      socket.off("updateGameState", updateGameStateListener);
    };
  }, [socket]);

  const updateGameStateListener = (gameState: GameState) => {
    setP1Score(gameState.score.p1Score);
    setP2Score(gameState.score.p2Score);
    setP1Name(gameState.p1Name);
    setP2Name(gameState.p2Name);
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
      <div style={{ display: "flex", flexDirection: "column", color: "white" }}>
        <p style={{ color: "#368D2F" }}>{p1Name}</p>
        <div style={{ color: "white" }}>{p1Score}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", color: "white" }}>
        <p style={{ color: "#CC4CD7" }}>{p2Name}</p>
        <div style={{ color: "white" }}>{p2Score}</div>
      </div>
    </div>
  );
};

export default ScoreBoard;
