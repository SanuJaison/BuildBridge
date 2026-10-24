import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export function PageHeader({ eyebrow, title, description, actions, backTo, backLabel = "Back" }) {
  return (
    <div className="mb-7">
      {backTo ? (
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-1.5 text-[11px] text-slate-500 transition hover:text-slate-300"
        >
          <ArrowLeft size={12} />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

const TONES = {
  brand: "border-brand-400/20 bg-brand-500/10 text-brand-300",
  mint: "border-mint-400/20 bg-mint-400/10 text-mint-300",
  sky: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
};

export function StatCard({ icon: Icon, label, value, hint, tone = "brand", to }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${TONES[tone] || TONES.brand}`}>
          {Icon ? <Icon size={16} /> : null}
        </span>
        {to ? <ArrowUpRight size={14} className="text-slate-600 transition group-hover:text-slate-300" /> : null}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{label}</p>
      {hint ? <p className="mt-1 text-[10px] text-slate-600">{hint}</p> : null}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="surface surface-hover group block rounded-2xl p-4 sm:p-5"
      >
        {content}
      </Link>
    );
  }

  return <div className="surface rounded-2xl p-4 sm:p-5">{content}</div>;
}

export function Panel({ title, description, action, children, className = "", padded = true }) {
  return (
    <section className={`surface overflow-hidden rounded-2xl ${className}`}>
      {title || action ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {description ? <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={padded ? "p-4 sm:p-5" : ""}>{children}</div>
    </section>
  );
}

export function InlineMeta({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
      {Icon ? <Icon size={12} className="shrink-0" /> : null}
      {children}
    </span>
  );
}

export function SetupStep({ done, title, description, to, actionLabel }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
          done
            ? "border-mint-400/30 bg-mint-400/15 text-mint-300"
            : "border-white/15 bg-white/[0.03] text-slate-500"
        }`}
      >
        {done ? "✓" : "·"}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-medium ${done ? "text-slate-400 line-through decoration-slate-600" : "text-slate-200"}`}>
          {title}
        </p>
        {description ? <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{description}</p> : null}
      </div>
      {!done && to ? (
        <Link to={to} className="shrink-0 text-[11px] font-medium text-brand-300 transition hover:text-brand-200">
          {actionLabel || "Start"}
        </Link>
      ) : null}
    </div>
  );
}
