import React, { useState } from "react";
import Button from "../common/Button";

const GameRules = () => {
  const [showRules, setShowRules] = useState<boolean>(false);

  const handleButtonClick = () => {
    setShowRules((curr) => !curr);
  };

  return (
    <div>
      <Button onClick={handleButtonClick} style={{ fontSize: "0.5rem" }}>
        Rules
      </Button>
      {showRules === true ? (
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "1",
            margin: "0px",
            padding: "0.5rem",
            backgroundColor: "white",
            borderRadius: "0.3rem",
            color: "black",
          }}
        >
          <p>First to 3 points wins.</p>
          <p>If a player leaves the game, the other one wins.</p>
        </div>
      ) : null}
    </div>
  );
};

export default GameRules;
