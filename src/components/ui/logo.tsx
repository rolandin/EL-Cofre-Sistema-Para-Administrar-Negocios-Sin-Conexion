interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 48, className = "" }: LogoProps) {
  // Fixed aspect ratio: 5.2:1
  const w = Math.round(height * 5.2);

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 260 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* "EL" text */}
      <text
        x="0"
        y="37"
        className="fill-slate-700 dark:fill-slate-200"
        fontSize="38"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        letterSpacing="-1"
      >
        EL
      </text>

      {/* "C" */}
      <text
        x="55"
        y="37"
        className="fill-sky-500"
        fontSize="38"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        letterSpacing="-1"
      >
        C
      </text>

      {/* Vault door replacing "O" */}
      <g transform="translate(80, 5)">
        {/* Outer ring */}
        <circle
          cx="18"
          cy="18"
          r="17"
          className="fill-slate-700 dark:fill-slate-200"
          strokeWidth="2"
        />
        {/* Inner ring */}
        <circle
          cx="18"
          cy="18"
          r="13"
          fill="none"
          className="stroke-sky-500"
          strokeWidth="2.5"
        />
        {/* Tick marks around dial */}
        <line x1="18" y1="5" x2="18" y2="8" className="stroke-sky-500" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="28" x2="18" y2="31" className="stroke-sky-500" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="18" x2="8" y2="18" className="stroke-sky-500" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="18" x2="31" y2="18" className="stroke-sky-500" strokeWidth="1.5" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx="18" cy="18" r="3" className="fill-sky-500" />
        {/* Dial hand — pointing to ~2 o'clock */}
        <line
          x1="18"
          y1="18"
          x2="27"
          y2="11"
          className="stroke-sky-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Dial hand — pointing to ~8 o'clock */}
        <line
          x1="18"
          y1="18"
          x2="10"
          y2="25"
          className="stroke-sky-400"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* "FRE" */}
      <text
        x="118"
        y="37"
        className="fill-sky-500"
        fontSize="38"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        letterSpacing="-1"
      >
        FRE
      </text>

      {/* Subtle lock icon accent after text */}
      <g transform="translate(195, 10)" className="fill-slate-400 dark:fill-slate-500">
        <rect x="4" y="12" width="14" height="12" rx="2" className="fill-sky-500" opacity="0.3" />
        <path
          d="M7 12V8a4 4 0 0 1 8 0v4"
          fill="none"
          className="stroke-sky-500"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </g>
    </svg>
  );
}

export function LogoIcon({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle */}
      <circle
        cx="18"
        cy="18"
        r="17"
        className="fill-slate-700 dark:fill-slate-200"
        strokeWidth="1"
      />
      {/* Inner ring */}
      <circle
        cx="18"
        cy="18"
        r="12"
        fill="none"
        className="stroke-sky-500"
        strokeWidth="2"
      />
      {/* Tick marks */}
      <line x1="18" y1="6" x2="18" y2="9" className="stroke-sky-500" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="27" x2="18" y2="30" className="stroke-sky-500" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="18" x2="9" y2="18" className="stroke-sky-500" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="18" x2="30" y2="18" className="stroke-sky-500" strokeWidth="1.5" strokeLinecap="round" />
      {/* Center */}
      <circle cx="18" cy="18" r="3" className="fill-sky-500" />
      {/* Dial hands */}
      <line x1="18" y1="18" x2="26" y2="12" className="stroke-sky-500" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="18" x2="11" y2="24" className="stroke-sky-400" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
