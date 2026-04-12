interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 48, className = "" }: LogoProps) {
  const scale = height / 40;
  const w = Math.round(200 * scale);

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 200 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Shield mark */}
      <g transform="translate(0, 1)">
        <path
          d="M19 1 L36 7 L36 19 C36 30 28 35 19 38 C10 35 2 30 2 19 L2 7 Z"
          fill="url(#logo-gradient)"
        />
        <circle cx="19" cy="15.5" r="4.5" className="fill-white dark:fill-slate-900" />
        <rect x="17.2" y="18.5" width="3.6" height="7" rx="1" className="fill-white dark:fill-slate-900" />
      </g>

      {/* EL COFRE — single line, all caps, bold, tight */}
      <text
        x="44"
        y="29"
        fill="url(#logo-gradient)"
        fontSize="28"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        letterSpacing="-0.5"
      >
        EL COFRE
      </text>
    </svg>
  );
}

export function LogoIcon({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <path
        d="M22 2 L40 8 L40 22 C40 34 32 40 22 44 C12 40 4 34 4 22 L4 8 Z"
        fill="url(#icon-gradient)"
      />
      <circle cx="22" cy="18" r="5" className="fill-white dark:fill-slate-900" />
      <rect x="20" y="21" width="4" height="8" rx="1" className="fill-white dark:fill-slate-900" />
    </svg>
  );
}
