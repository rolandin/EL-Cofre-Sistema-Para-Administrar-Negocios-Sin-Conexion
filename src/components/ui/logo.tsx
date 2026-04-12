interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 48, className = "" }: LogoProps) {
  const w = height * 2.4;
  const iconSize = height * 0.7;
  const iconY = (height - iconSize) / 2;
  const textX = iconSize + height * 0.25;
  const fontSize1 = height * 0.32;
  const fontSize2 = height * 0.28;

  return (
    <svg
      width={w}
      height={height}
      viewBox={`0 0 ${w} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Safe/Vault Icon */}
      <g transform={`translate(${height * 0.1}, ${iconY})`}>
        {/* Vault body */}
        <rect
          x="0"
          y="0"
          width={iconSize}
          height={iconSize}
          rx={iconSize * 0.12}
          className="fill-slate-800 dark:fill-slate-200"
        />
        {/* Inner panel */}
        <rect
          x={iconSize * 0.1}
          y={iconSize * 0.1}
          width={iconSize * 0.8}
          height={iconSize * 0.8}
          rx={iconSize * 0.06}
          className="fill-slate-700 dark:fill-slate-300"
        />
        {/* Dial circle */}
        <circle
          cx={iconSize * 0.5}
          cy={iconSize * 0.48}
          r={iconSize * 0.22}
          className="fill-slate-800 dark:fill-slate-200 stroke-sky-500"
          strokeWidth={iconSize * 0.03}
        />
        {/* Dial center dot */}
        <circle
          cx={iconSize * 0.5}
          cy={iconSize * 0.48}
          r={iconSize * 0.06}
          className="fill-sky-500"
        />
        {/* Dial hand up */}
        <line
          x1={iconSize * 0.5}
          y1={iconSize * 0.48}
          x2={iconSize * 0.5}
          y2={iconSize * 0.3}
          className="stroke-sky-500"
          strokeWidth={iconSize * 0.025}
          strokeLinecap="round"
        />
        {/* Dial hand right */}
        <line
          x1={iconSize * 0.5}
          y1={iconSize * 0.48}
          x2={iconSize * 0.66}
          y2={iconSize * 0.48}
          className="stroke-sky-500"
          strokeWidth={iconSize * 0.025}
          strokeLinecap="round"
        />
        {/* Handle bar */}
        <rect
          x={iconSize * 0.7}
          y={iconSize * 0.35}
          width={iconSize * 0.06}
          height={iconSize * 0.26}
          rx={iconSize * 0.03}
          className="fill-sky-500"
        />
        {/* Hinges */}
        <circle cx={iconSize * 0.12} cy={iconSize * 0.2} r={iconSize * 0.03} className="fill-sky-500" />
        <circle cx={iconSize * 0.12} cy={iconSize * 0.8} r={iconSize * 0.03} className="fill-sky-500" />
      </g>

      {/* Text */}
      <text
        x={textX}
        y={height * 0.45}
        className="fill-slate-800 dark:fill-slate-100"
        fontSize={fontSize1}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
      >
        El
      </text>
      <text
        x={textX}
        y={height * 0.78}
        className="fill-sky-500"
        fontSize={fontSize2}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        letterSpacing="1"
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
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Vault body */}
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        rx={size * 0.12}
        className="fill-slate-800 dark:fill-slate-200"
      />
      {/* Inner panel */}
      <rect
        x={size * 0.1}
        y={size * 0.1}
        width={size * 0.8}
        height={size * 0.8}
        rx={size * 0.06}
        className="fill-slate-700 dark:fill-slate-300"
      />
      {/* Dial circle */}
      <circle
        cx={size * 0.5}
        cy={size * 0.48}
        r={size * 0.22}
        fill="none"
        className="stroke-sky-500"
        strokeWidth={size * 0.03}
      />
      <circle
        cx={size * 0.5}
        cy={size * 0.48}
        r={size * 0.22}
        className="fill-slate-800 dark:fill-slate-200"
      />
      <circle
        cx={size * 0.5}
        cy={size * 0.48}
        r={size * 0.22}
        fill="none"
        className="stroke-sky-500"
        strokeWidth={size * 0.03}
      />
      {/* Dial center */}
      <circle cx={size * 0.5} cy={size * 0.48} r={size * 0.06} className="fill-sky-500" />
      {/* Dial hands */}
      <line x1={size * 0.5} y1={size * 0.48} x2={size * 0.5} y2={size * 0.3} className="stroke-sky-500" strokeWidth={size * 0.025} strokeLinecap="round" />
      <line x1={size * 0.5} y1={size * 0.48} x2={size * 0.66} y2={size * 0.48} className="stroke-sky-500" strokeWidth={size * 0.025} strokeLinecap="round" />
      {/* Handle */}
      <rect x={size * 0.7} y={size * 0.35} width={size * 0.06} height={size * 0.26} rx={size * 0.03} className="fill-sky-500" />
      {/* Hinges */}
      <circle cx={size * 0.12} cy={size * 0.2} r={size * 0.03} className="fill-sky-500" />
      <circle cx={size * 0.12} cy={size * 0.8} r={size * 0.03} className="fill-sky-500" />
    </svg>
  );
}
