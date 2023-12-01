import React, { FC, useEffect, useState } from "react";
import { getMyUserId } from "../../chat/components/ChannelUtils";

// Have to check if two FA is enabled for the user so I'll change the UI

const TwoFA: FC = () => {
  const [userId, setUserId] = useState<number>(0);
  const [qrcode, setQrcode] = useState<string>("");

  useEffect(() => {
    const getMyId = async () => {
      try {
        const id = await getMyUserId();
        setUserId(id);
      } catch (error: any){
        console.log(error.message);
      }
    };

    getMyId();
  }, []);

  const enable2FA = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/enable2FA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) return Promise.reject(await response.json());

      const formattedRes = await response.json();
      setQrcode(formattedRes.qrcode);
    } catch (error) {
      console.log(error);
    }
  };

  if (userId === 0) return <></>;

  return (
    <div>
      <button onClick={() => enable2FA()}>Enable 2FA</button>
      {qrcode.length === 0 ? null : (
        <img src={qrcode} alt="qrcode" style={{ maxWidth: "100%" }} />
      )}
    </div>
  );
};

export default TwoFA;
