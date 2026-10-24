import { useEffect, useState } from "react";

export function FilterGroup({ title, children, className = "" }) {
  return (
    <div className={`border-b border-white/[0.07] py-5 first:pt-0 last:border-b-0 last:pb-0 ${className}`}>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

export function CommitInput({ value = "", onCommit, placeholder = "", prefix, type = "text", className = "" }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const commit = () => {
    const clean = type === "number" ? local.replace(/[^\d.]/g, "") : local;
    onCommit(clean);
  };

  return (
    <div className={`relative ${className}`}>
      {prefix ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">{prefix}</span>
      ) : null}
      <input
        type="text"
        inputMode={type === "number" ? "decimal" : undefined}
        value={local}
        onChange={(event) => setLocal(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        className={`input-base py-2 text-xs ${prefix ? "pl-6" : ""}`}
      />
    </div>
  );
}

export function ActiveFilters({ filters = [], onClear }) {
  const active = filters.filter((filter) => filter.value);
  if (!active.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {active.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={filter.onRemove}
          className="chip border-brand-300/20 bg-brand-500/10 py-1 text-[10px] text-brand-200 transition hover:border-brand-300/40"
        >
          {filter.label}
          <span aria-hidden="true" className="text-brand-300/70">
            ×
          </span>
        </button>
      ))}
      <button type="button" onClick={onClear} className="ml-1 text-[10px] text-slate-500 underline underline-offset-2 transition hover:text-white">
        Clear all
      </button>
    </div>
  );
}
