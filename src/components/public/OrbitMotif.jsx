import { useId } from "react";

export default function OrbitMotif({ className = "" }) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg
      viewBox="0 0 720 520"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      data-svg-trigger
    >
      <defs>
        <linearGradient id={`${uid}-violet`} x1="74" y1="70" x2="632" y2="446" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ddd6fe" stopOpacity="0.95" />
          <stop offset="0.48" stopColor="#8b5cf6" stopOpacity="0.42" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={`${uid}-mint`} x1="130" y1="438" x2="620" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5eead4" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#38bdf8" stopOpacity="0.32" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0.12" />
        </linearGradient>
        <radialGradient id={`${uid}-core`}>
          <stop stopColor="#f5f3ff" />
          <stop offset="0.45" stopColor="#c4b5fd" stopOpacity="0.8" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g data-orbit-spin data-orbit-duration="54" opacity="0.65">
        <ellipse
          cx="360"
          cy="260"
          rx="316"
          ry="146"
          stroke={`url(#${uid}-violet)`}
          strokeOpacity="0.4"
          strokeDasharray="1 11"
          transform="rotate(-17 360 260)"
        />
        <ellipse
          cx="360"
          cy="260"
          rx="248"
          ry="102"
          stroke={`url(#${uid}-mint)`}
          strokeOpacity="0.34"
          transform="rotate(31 360 260)"
        />
      </g>

      <g data-orbit-counter data-orbit-duration="46" opacity="0.85">
        <path
          data-svg-draw
          d="M92 312C158 162 356 89 592 188"
          stroke={`url(#${uid}-violet)`}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          data-svg-draw
          d="M124 382C294 474 536 416 626 268"
          stroke={`url(#${uid}-mint)`}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle
          data-svg-draw
          cx="592"
          cy="188"
          r="4"
          fill="#5eead4"
          stroke="#99f6e4"
          strokeOpacity="0.7"
        />
        <circle
          data-svg-draw
          cx="124"
          cy="382"
          r="3"
          fill="#c4b5fd"
          stroke="#ddd6fe"
          strokeOpacity="0.6"
        />
        <circle
          data-svg-draw
          cx="360"
          cy="260"
          r="188"
          stroke="rgba(196,181,253,0.2)"
          strokeDasharray="2 15"
        />
      </g>

      <circle cx="360" cy="260" r="36" fill={`url(#${uid}-core)`} opacity="0.22" />
      <circle cx="360" cy="260" r="3.5" fill="#f5f3ff" />
      <circle
        data-orbit-pulse
        cx="360"
        cy="260"
        r="13"
        stroke="rgba(196,181,253,0.25)"
        strokeWidth="1"
      />
    </svg>
  );
}
