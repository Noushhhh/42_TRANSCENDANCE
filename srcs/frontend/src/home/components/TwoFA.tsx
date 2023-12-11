import React, { FC, useEffect, useState } from "react";
import { getMyUserId } from "../../chat/components/ChannelUtils";

const TwoFaPopUpStyle: React.CSSProperties = {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  top: "30%",
  width: "10rem",
  border: "2rem solid black",
  backgroundColor: "black",
  gap: "1rem",
};

const TwoFA: FC = () => {
  const [userId, setUserId] = useState<number>(0);
  const [qrcode, setQrcode] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [is2FaActivated, setIs2FaActivated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getMyId = async () => {
      const id = await getMyUserId();
      setUserId(id);
    };

    getMyId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const is2FaActivated = async () => {
      const response = await fetch(
        "http://localhost:4000/api/auth/is2FaActivated",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) return Promise.reject(await response.json());

      const formattedRes = await response.json();

      setIs2FaActivated(formattedRes.res);
    };

    is2FaActivated().catch((e) => console.log(e));
  }, [userId]);

  const enable2FA = async () => {
    const response = await fetch("http://localhost:4000/api/auth/enable2FA", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return Promise.reject(await response.json());

    const formattedRes = await response.json();
    setQrcode(formattedRes.qrcode);
  };

  const disable2FA = async () => {
    const response = await fetch("http://localhost:4000/api/auth/disable2FA", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return Promise.reject(await response.json());

    setIs2FaActivated(false);
  };

  const validateTwoFA = async () => {
    const response = await fetch(
      "http://localhost:4000/api/auth/validating2FA",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    if (!response.ok) return Promise.reject(await response.json());

    const formattedRes = await response.json();

    if (formattedRes.res === true) {
      setQrcode("");
      setError("");
      setIs2FaActivated(true);
    } else {
      setError("Wrong code, please try again...");
    }
  };

  if (userId === 0) return <></>;

  if (is2FaActivated === true)
    return (
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => disable2FA().catch((e) => console.log(e))}>
          Deactivate 2FA
        </button>
      </div>
    );

  return (
    <div>
      <button
        style={{ marginTop: "1rem" }}
        onClick={() => enable2FA().catch((e) => console.log(e))}
      >
        Enable 2FA
      </button>
      {qrcode.length === 0 ? null : (
        <div style={TwoFaPopUpStyle}>
          <img src={qrcode} alt="qrcode" style={{ maxWidth: "100%" }} />
          <p style={{ fontSize: ".75rem" }}>
            Please, enter code to validate 2FA
          </p>
          {error ? (
            <p style={{ color: "red", fontSize: ".55rem" }}>{error}</p>
          ) : null}
          <input
            onChange={(e) => setToken(e.target.value)}
            type="text"
            value={token}
          />
          <button onClick={() => validateTwoFA().catch((e) => console.log(e))}>
            Submit!
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFA;
