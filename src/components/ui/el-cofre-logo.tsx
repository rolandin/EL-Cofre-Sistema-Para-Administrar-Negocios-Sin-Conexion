import React from "react";

const ElCofreLogo = ({ size = 200 }: { size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="200" height="200" rx="20" fill="#0F172A" />

      {/* Vault Body */}
      <rect
        x="40"
        y="60"
        width="120"
        height="90"
        rx="10"
        fill="#1E293B"
        stroke="#38BDF8"
        strokeWidth="2"
      />

      {/* Vault Door */}
      <circle
        cx="100"
        cy="105"
        r="28"
        fill="#0F172A"
        stroke="#38BDF8"
        strokeWidth="2"
      />

      {/* Lock Mechanism */}
      <circle cx="100" cy="105" r="6" fill="#38BDF8" />
      <line
        x1="100"
        y1="105"
        x2="100"
        y2="88"
        stroke="#38BDF8"
        strokeWidth="2"
      />
      <line
        x1="100"
        y1="105"
        x2="115"
        y2="105"
        stroke="#38BDF8"
        strokeWidth="2"
      />

      {/* Tech Circuit Lines */}
      <line
        x1="60"
        y1="150"
        x2="90"
        y2="170"
        stroke="#38BDF8"
        strokeWidth="1.5"
      />
      <circle cx="90" cy="170" r="2" fill="#38BDF8" />

      <line
        x1="140"
        y1="150"
        x2="110"
        y2="170"
        stroke="#38BDF8"
        strokeWidth="1.5"
      />
      <circle cx="110" cy="170" r="2" fill="#38BDF8" />

      {/* Text */}
      <text
        x="100"
        y="40"
        textAnchor="middle"
        fill="#E2E8F0"
        fontSize="18"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
      >
        El Cofre
      </text>
    </svg>
  );
};

export default ElCofreLogo;
