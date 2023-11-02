import React from "react";

interface InvitationStatusProps {
  invitationStatus: string;
}

function InvitationStatus({ invitationStatus }: InvitationStatusProps) {
  return (
    <div
      style={{
        position: "absolute",
        color: "red",
        backgroundColor: "white",
        borderRadius: "5px",
        fontSize: "0.75rem",
        width: "50%"
      }}
    >
      {invitationStatus}
    </div>
  );
}

export default InvitationStatus;
