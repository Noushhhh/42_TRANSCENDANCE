import React, { useEffect, useState } from "react";
import GamePhysics from "./GamePhysics";
import "../styles/GameContainer.css";
import ScoreBoard from "./ScoreBoard";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const p1Direction = {
  up: Boolean,
  down: Boolean,
};

const p2Direction = {
  up: Boolean,
  down: Boolean,
};

const ballDirection = {
  right: Boolean,
  left: Boolean,
};

const isPausedStatus = {
  isPaused: Boolean,
};

const ScoreBoardStatus = {
  p1ScoreIncrement: Boolean,
  p2ScoreIncrement: Boolean,
};

function GameContainer() {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  socket.on("connect", () => {
    console.log("Well connected to socket server");
  });

  /* ----------------------------- */
  //     PLAY/PAUSE SOCKET LOGIC
  /* ----------------------------- */
  useEffect(() => {
    socket.on("play", () => {
      setIsPaused(true);
    });

    socket.on("pause", () => {
      setIsPaused(false);
    });

    return () => {
      socket.off("play");
      socket.off("pause");
    };
  }, []);

  const handlePlayPause = () => {
    socket.emit("getIsPaused", !isPaused);
    setIsPaused(!isPaused);
    if (isPaused === true) start();
    else stop();
  };

  const start = () => {
    fetch("http://localhost:4000/api/game/play")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const stop = () => {
    fetch("http://localhost:4000/api/game/stop")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
