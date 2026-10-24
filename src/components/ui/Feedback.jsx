import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import Button from "./Button";

export function Spinner({ size = 18, className = "" }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function LoadingBlock({ label = "Loading", className = "" }) {
  return (
    <div className={`flex min-h-48 flex-col items-center justify-center gap-3 py-14 text-center ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Spinner className="text-brand-300" />
      </div>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center ${className}`}>
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400">
          <Icon size={22} />
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "We couldn't load this", message, onRetry, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] px-6 py-14 text-center ${className}`}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {message ? <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">{message}</p> : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry} className="mt-5">
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function CardSkeleton({ count = 6, className = "" }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-white/5" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/5" />
          </div>
          <div className="mt-5 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-white/5" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
