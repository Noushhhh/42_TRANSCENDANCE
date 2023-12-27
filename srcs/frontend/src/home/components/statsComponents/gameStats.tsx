import React, { FC, useEffect, useState } from "react";
import MatchHistory from "./MatchHistory";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface GamePlayedProps {
  userId: number;
}

const GamePlayed: FC<GamePlayedProps> = ({ userId }) => {
  const [gamePlayed, setGamePlayed] = useState<number>(0);
  const [winPercentage, setWinPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchGameStats = async () => {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/stats/getGameStats`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        setIsLoading(false);
        return Promise.reject(await response.json());
      }

      const formattedResponse = await response.json();
      const winPercentage_ = parseFloat(
        (
          (100 * formattedResponse.gameStats.gameWon) /
          formattedResponse.gameStats.gamePlayed
        ).toFixed(2)
      );
      setGamePlayed(formattedResponse.gameStats.gamePlayed);
      if (formattedResponse.gameStats.gamePlayed === 0) setWinPercentage(0);
      else setWinPercentage(winPercentage_);

      setIsLoading(false);
    };

    fetchGameStats().catch((e) => {
      setError(e);
    });
  }, []);

  if (isLoading) return <>Loading...</>;

  if (error) return <>Something went wrong... Please try again!</>;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        gap: "2rem",
        width: "100%",
        marginBottom: "1rem",
      }}
    >
      <div>{gamePlayed} game played</div>
      <div>{winPercentage}% of win</div>
    </div>
  );
};

export default GamePlayed;
