"use client";

/**
 * The berry-superhero mark (cape, mask, chest star). Rendered inside a 0..220 x 0..240
 * local box. `idp` keeps gradient ids unique per instance. This is the guide, not a child avatar.
 */
export function BerryHeroMark({ idp }: { idp: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${idp}-cape`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id={`${idp}-berry`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ff7aa2" />
          <stop offset="45%" stopColor="#ff2d6a" />
          <stop offset="100%" stopColor="#d40e50" />
        </linearGradient>
        <linearGradient id={`${idp}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5ee98a" />
          <stop offset="100%" stopColor="#12a150" />
        </linearGradient>
        <linearGradient id={`${idp}-mask`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <radialGradient id={`${idp}-star`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#fff6cf" />
          <stop offset="55%" stopColor="#ffd93d" />
          <stop offset="100%" stopColor="#f6a609" />
        </radialGradient>
        <filter id={`${idp}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#3b0764" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter={`url(#${idp}-shadow)`}>
        {/* Flowing cape behind the berry */}
        <path
          d="M40 96 C 2 120 2 196 34 228 C 40 190 66 168 92 160 C 66 150 46 126 40 96 Z"
          fill={`url(#${idp}-cape)`}
        />
        <path
          d="M180 96 C 218 120 218 196 186 228 C 180 190 154 168 128 160 C 154 150 174 126 180 96 Z"
          fill={`url(#${idp}-cape)`}
        />

        {/* Leafy crown + stem */}
        <path
          d="M62 84 L 82 54 L 100 78 L 118 52 L 138 84 C 122 96 78 96 62 84 Z"
          fill={`url(#${idp}-leaf)`}
        />
        <rect x="95" y="46" width="10" height="18" rx="5" fill="#0f7a3d" />

        {/* Berry body */}
        <path
          d="M46 92 C 46 66 154 66 154 92 C 154 140 120 206 100 206 C 80 206 46 140 46 92 Z"
          fill={`url(#${idp}-berry)`}
        />

        {/* Seeds */}
        {[
          [72, 110],
          [100, 104],
          [128, 110],
          [84, 132],
          [116, 132],
          [100, 150],
          [80, 166],
          [120, 166],
        ].map(([sx, sy], i) => (
          <ellipse
            key={i}
            cx={sx}
            cy={sy}
            rx="3.4"
            ry="5.2"
            fill="#ffe27a"
            transform={`rotate(${(i % 2 === 0 ? -18 : 18)} ${sx} ${sy})`}
          />
        ))}

        {/* Superhero mask */}
        <path
          d="M56 108 C 70 98 130 98 144 108 C 150 118 148 130 140 136 C 128 132 120 128 100 128 C 80 128 72 132 60 136 C 52 130 50 118 56 108 Z"
          fill={`url(#${idp}-mask)`}
        />

        {/* Eyes */}
        <ellipse cx="82" cy="118" rx="9" ry="10" fill="#ffffff" />
        <ellipse cx="118" cy="118" rx="9" ry="10" fill="#ffffff" />
        <circle cx="84" cy="119" r="4.4" fill="#1e293b" />
        <circle cx="120" cy="119" r="4.4" fill="#1e293b" />
        <circle cx="82.5" cy="116.5" r="1.6" fill="#ffffff" />
        <circle cx="118.5" cy="116.5" r="1.6" fill="#ffffff" />

        {/* Cheeks + smile */}
        <circle cx="70" cy="150" r="6" fill="#ff86ad" opacity="0.7" />
        <circle cx="130" cy="150" r="6" fill="#ff86ad" opacity="0.7" />
        <path
          d="M84 150 Q 100 164 116 150"
          fill="none"
          stroke="#7a0d33"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Chest star emblem */}
        <path
          d="M100 168 l 6.5 13.2 14.6 2.1 -10.5 10.3 2.5 14.5 -13.1 -6.9 -13.1 6.9 2.5 -14.5 -10.5 -10.3 14.6 -2.1 Z"
          fill={`url(#${idp}-star)`}
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
      </g>
    </>
  );
}
