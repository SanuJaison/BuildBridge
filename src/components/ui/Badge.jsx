import { Star } from "lucide-react";
import { AVAILABILITY, humanize } from "../../lib/format";

const TONES = {
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  mint: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
  amber: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  red: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  blue: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  slate: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  white: "border-white/20 bg-white/10 text-white",
};

export function Badge({ tone = "slate", dot = false, children, className = "" }) {
  return (
    <span className={`chip ${TONES[tone] || TONES.slate} ${className}`}>
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status, map, className = "" }) {
  const config = map?.[status] || { label: humanize(status || "unknown"), tone: "slate" };
  return (
    <Badge tone={config.tone} dot className={className}>
      {config.label}
    </Badge>
  );
}

export function AvailabilityBadge({ value = "available", className = "" }) {
  const config = AVAILABILITY[value] || AVAILABILITY.unavailable;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
        value === "available" ? "text-emerald-300" : value === "limited" ? "text-amber-300" : "text-slate-400"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          value === "available" ? "bg-emerald-400" : value === "limited" ? "bg-amber-400" : "bg-slate-500"
        }`}
      />
      {config.label}
    </span>
  );
}

export function Rating({ value = 0, count, size = 13, showValue = true, className = "" }) {
  const rating = Math.round(Number(value) * 10) / 10;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= Math.round(rating) ? "fill-amber-300 text-amber-300" : "fill-slate-700 text-slate-700"}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-[11px] font-medium text-slate-300">
          {rating > 0 ? rating.toFixed(1) : "New"}
          {count !== undefined && count > 0 ? <span className="text-slate-500"> ({count})</span> : null}
        </span>
      ) : null}
    </span>
  );
}

export function RatingInput({ value = 0, onChange, disabled = false }) {
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          className="rounded-md p-0.5 transition hover:scale-110 disabled:cursor-not-allowed"
        >
          <Star
            size={24}
            className={star <= value ? "fill-amber-300 text-amber-300" : "fill-slate-800 text-slate-600"}
          />
        </button>
      ))}
    </div>
  );
}
