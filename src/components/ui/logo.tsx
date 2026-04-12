interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 48, className = "" }: LogoProps) {
  const scale = height / 50;
  const w = Math.round(220 * scale);

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 220 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Shield/vault mark */}
      <g transform="translate(0, 3)">
        {/* Shield shape */}
        <path
          d="M22 2 L40 8 L40 22 C40 34 32 40 22 44 C12 40 4 34 4 22 L4 8 Z"
          fill="url(#logo-gradient)"
        />
        {/* Keyhole */}
        <circle cx="22" cy="18" r="5" className="fill-white dark:fill-slate-900" />
        <rect x="20" y="21" width="4" height="8" rx="1" className="fill-white dark:fill-slate-900" />
      </g>

      {/* "el" — lowercase, light weight */}
      <text
        x="52"
        y="24"
        className="fill-slate-400 dark:fill-slate-500"
        fontSize="16"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="500"
        letterSpacing="2"
      >
        el
      </text>

      {/* "cofre" — uppercase, bold */}
      <text
        x="52"
        y="43"
        fill="url(#logo-gradient)"
        fontSize="24"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        letterSpacing="4"
      >
        COFRE
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
