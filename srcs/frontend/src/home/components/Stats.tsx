// Prifile.tsx

// Will have to make API calls
//    - DTO's
//    - Try catch error handling
import React, { useEffect, useRef, useState } from "react";
import GameStats from "./statsComponents/gameStats";
import { getMyUserId } from "../../chat/components/ChannelUtils";
import MatchHistory from "./statsComponents/MatchHistory";

function Stats() {
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    getMyId();
  }, []);

  const getMyId = async () => {
    const id = await getMyUserId();

    setUserId(id);
  };

  return (
    <div>
      {userId === 0 ? (
        <>Loading ...</>
      ) : (
        <div>
          <GameStats userId={userId} />
          <MatchHistory userId={userId} />
        </div>
      )}
    </div>
  );
}

export default Stats;
