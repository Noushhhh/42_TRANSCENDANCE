import React from "react";
import styled, { keyframes } from "styled-components";

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const dotAnimation = keyframes`
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(0.5);
  }
`;

const StyledDiv = styled.div`
  animation: ${fadeInAnimation} 1s ease-in-out;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: white;
  animation: ${dotAnimation} 1s infinite;
`;

const WaitingForPlayer = () => {
  return (
    <div
      className="waiting-screen"
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "3rem",
      }}
    >
      <StyledDiv>
        <div
          className="dots-container"
          style={{ display: "flex",alignItems: "baseline", gap: "10px", color: "white" }}
        >
          <p>Waiting for player</p>
          <Dot />
          <Dot />
          <Dot />
        </div>
      </StyledDiv>
    </div>
  );
};

export default WaitingForPlayer;
