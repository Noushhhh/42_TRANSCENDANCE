import React, { FC, useEffect, useState } from "react";
import { getMyUserId } from "../../chat/components/ChannelUtils";

// Have to check if two FA is enabled for the user so I'll change the UI

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
      try {
        const response = await fetch(
          "http://localhost:4000/api/auth/is2FaActivated",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "X-User-ID": userId.toString(),
            },
          }
        );

        if (!response.ok) return Promise.reject(await response.json());

        const formattedRes = await response.json();

        setIs2FaActivated(formattedRes.res);
      } catch (error) {
        console.log(error);
      }
    };

    is2FaActivated();
  }, [userId]);

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

  const disable2FA = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/disable2FA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) return Promise.reject(await response.json());

      setIs2FaActivated(false);
    } catch (error) {
      console.log(error);
    }
  };

  const validateTwoFA = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/validating2FA",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, token }),
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
    } catch (error) {
      console.log(error);
    }
  };

  if (userId === 0) return <></>;

  if (is2FaActivated === true)
    return (
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => disable2FA()}>Deactivate 2FA</button>
      </div>
    );

  return (
    <div>
      <button style={{ marginTop: "1rem" }} onClick={() => enable2FA()}>
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
          <button onClick={() => validateTwoFA()}>Submit!</button>
        </div>
      )}
    </div>
  );
};

export default TwoFA;
