import { useState } from "react";
import { ImageOff } from "lucide-react";
import { assetUrl } from "../../lib/api";
import { initials } from "../../lib/format";

const GRADIENTS = [
  "from-violet-500/80 via-indigo-500/70 to-sky-500/70",
  "from-fuchsia-500/80 via-purple-500/70 to-indigo-500/70",
  "from-emerald-400/70 via-teal-500/70 to-cyan-500/70",
  "from-amber-400/80 via-orange-500/70 to-rose-500/70",
  "from-sky-400/80 via-blue-500/70 to-indigo-500/70",
  "from-rose-400/80 via-pink-500/70 to-fuchsia-500/70",
];

function hashName(name = "") {
  return Array.from(String(name)).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

const SIZES = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
  "2xl": "h-28 w-28 text-3xl",
};

export function Avatar({ src, name = "", size = "md", className = "", ring = false }) {
  const [failed, setFailed] = useState(false);
  const gradient = GRADIENTS[hashName(name) % GRADIENTS.length];
  const showImage = src && !failed;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${gradient} font-bold text-white ${
        SIZES[size] || SIZES.md
      } ${ring ? "ring-2 ring-ink-900 ring-offset-2 ring-offset-white/10" : ""} ${className}`}
    >
      {showImage ? (
        <img
          src={assetUrl(src)}
          alt={name || "Profile"}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}

export function Artwork({ src, alt = "", label, className = "", icon: FallbackIcon = ImageOff, rounded = "rounded-xl" }) {
  const [failed, setFailed] = useState(false);
  const gradient = GRADIENTS[hashName(label || alt || "BuildBridge") % GRADIENTS.length];

  return (
    <div className={`relative overflow-hidden bg-ink-800 ${rounded} ${className}`}>
      {src && !failed ? (
        <img
          src={assetUrl(src)}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={`flex h-full min-h-24 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${gradient}`}>
          <FallbackIcon size={22} className="text-white/70" />
          {label ? <span className="px-3 text-center text-[11px] font-medium text-white/80">{label}</span> : null}
        </div>
      )}
    </div>
  );
}
