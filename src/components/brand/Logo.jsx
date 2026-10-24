import { Link } from "react-router-dom";

export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="bb-mark" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C4B5FD" />
            <stop offset="0.55" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="rgba(139,92,246,0.12)" stroke="rgba(167,139,250,0.32)" />
        <path
          d="M9.5 26.5c0-5.5 4.5-10 10-10h2.75V11l8.25 4.25L22.25 19.5v-5.5H19.5c-4.14 0-7.5 3.36-7.5 7.5v5H9.5v-5z"
          fill="url(#bb-mark)"
        />
        <circle cx="29.5" cy="28.5" r="2.5" fill="#5EEAD4" />
      </svg>
    </span>
  );
}

export default function Logo({ compact = false, className = "" }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="BuildBridge home">
      <LogoMark />
      {!compact ? (
        <span className="text-[17px] font-bold tracking-[-0.035em] text-white">
          BuildBridge<span className="text-brand-400">.</span>
        </span>
      ) : null}
    </Link>
  );
}
