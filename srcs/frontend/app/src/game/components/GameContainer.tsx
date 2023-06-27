import React, { useEffect, useState } from "react";
import GamePhysics from "./GamePhysics";
import "../styles/GameContainer.css";
import ScoreBoard from "./ScoreBoard";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function GameContainer() {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  socket.on("connect", () => {
    console.log("Well connected to socket server");
  });

  useEffect(() => {
    socket.on("play", () => {
      setIsPaused(true);
    })
    
    socket.on("pause", () => {
      setIsPaused(false);
    })

    return () => {
      socket.off("play");
      socket.off("pause");
    }
  }, [])
  
  const handlePlayPause = () => {
    socket.emit("getIsPaused", !isPaused)
    setIsPaused(!isPaused);
  }

  return (
    <div className="GameContainer">
      <ScoreBoard p1Score={p1Score} p2Score={p2Score} />
      <GamePhysics
        socket={socket}
        setP1Score={setP1Score}
        setP2Score={setP2Score}
        isPaused={isPaused}
      />
      <button
        style={{ position: "absolute", top: "5%", right: "15%" }}
        onClick={() => handlePlayPause()}
      >
        {isPaused ? "Play" : "Pause"}
      </button>
    </div>
  );
}

export default GameContainer;
