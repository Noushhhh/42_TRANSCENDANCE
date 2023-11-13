import React, { FC } from "react";

interface MatchCardProps {
  p1: string;
  p2: string;
  p1Score: number;
  p2Score: number;
  p1Leaves: boolean;
  p2Leaves: boolean;
}

const MatchCard: FC<MatchCardProps> = ({
  p1,
  p2,
  p1Score,
  p2Score,
  p1Leaves,
  p2Leaves,
}) => {
  let backgroundColor = "red";

  if (p1Leaves === false && p1Score >= p2Score) backgroundColor = "green";

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        borderRadius: "5px",
        color: "white",
      }}
    >
      <div>
        {p1} vs {p2}
      </div>
      <div>
        {p1Score} - {p2Score}
      </div>
    </div>
  );
};

export default MatchCard;
