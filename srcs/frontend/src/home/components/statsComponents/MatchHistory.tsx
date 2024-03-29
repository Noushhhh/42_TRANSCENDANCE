import React, { FC, useEffect, useState } from "react";
import MatchCard from "./MatchCard";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface MatchHistoryProps {
  userId: number;
}

interface MatchHistoryType {
  id: number;
  date: Date;
  playerId: number;
  opponentName: string;
  selfScore: number;
  opponentScore: number;
  playerLeft: boolean;
  opponentLeft: boolean;
}

const MatchHistory: FC<MatchHistoryProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [matchHistory, setMatchHistory] = useState<
    MatchHistoryType[] | undefined
  >();

  useEffect(() => {
    const fetchGameStats = async () => {
      setIsLoading(true);

      setTimeout(async () => {
        const response = await fetch(
          `${API_BASE_URL}/api/stats/getMatchHistory`,
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

        setMatchHistory(formattedResponse.matchHistory.reverse());

        setIsLoading(false);
      }, 100);
    };

    fetchGameStats().catch((e) => {
      setError(e);
    });
  }, []);

  if (isLoading) return <>Loading...</>;

  if (error) return <>Something went wrong... Please try again!</>;

  if (matchHistory === undefined)
    return <div>You have no match history...</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        overflow: "scroll",
        maxHeight: "50vh",
        width: "40%",
        border: "2px solid white",
        padding: "0.5rem",
      }}
    >
      {matchHistory.map((match, id) => (
        <MatchCard
          key={id}
          p1="Me"
          p2={match.opponentName}
          p1Score={match.selfScore}
          p2Score={match.opponentScore}
          p1Leaves={match.playerLeft}
          p2Leaves={match.opponentLeft}
        />
      ))}
    </div>
  );
};

export default MatchHistory;
