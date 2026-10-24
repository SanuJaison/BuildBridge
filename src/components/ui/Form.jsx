import { forwardRef, useState } from "react";
import { ChevronDown, Eye, EyeOff, X } from "lucide-react";

export function Field({ label, htmlFor, hint, error, required, children, className = "", action }) {
  return (
    <div className={className}>
      {label || action ? (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label ? (
            <label htmlFor={htmlFor} className="label-base mb-0">
              {label}
              {required ? <span className="ml-0.5 text-brand-400">*</span> : null}
            </label>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ className = "", invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`input-base ${invalid ? "input-error" : ""} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

export const TextArea = forwardRef(function TextArea({ className = "", invalid, rows = 5, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`input-base resize-y ${invalid ? "input-error" : ""} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

export const PasswordInput = forwardRef(function PasswordInput({ className = "", invalid, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={`input-base pr-11 ${invalid ? "input-error" : ""} ${className}`}
        aria-invalid={invalid || undefined}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-300"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
});

export const Select = forwardRef(function Select({ className = "", invalid, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`input-base appearance-none pr-9 ${invalid ? "input-error" : ""} ${className}`}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
});

export function Checkbox({ label, description, className = "", ...props }) {
  return (
    <label className={`flex cursor-pointer items-start gap-2.5 ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-600 bg-ink-900 accent-violet-500"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm text-slate-300">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}

export function TagInput({ value = [], onChange, placeholder = "Type and press Enter", max = 20, id }) {
  const [draft, setDraft] = useState("");

  const addTag = (raw) => {
    const next = String(raw).trim().replace(/,$/, "");
    if (!next) return;
    if (value.some((tag) => tag.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, next]);
    setDraft("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    }
    if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="input-base flex min-h-[46px] flex-wrap items-center gap-1.5 p-2 focus-within:border-brand-400/65">
      {value.map((tag) => (
        <span key={tag} className="chip bg-brand-500/10 text-brand-200">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            className="rounded-full p-0.5 transition hover:bg-white/10 hover:text-white"
            aria-label={`Remove ${tag}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={value.length ? "Add more…" : placeholder}
        className="min-w-[120px] flex-1 border-0 bg-transparent px-1.5 py-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
      />
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-3 text-xs leading-relaxed text-rose-300">
      {children}
    </div>
  );
}

export function FormSuccess({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-xl border border-mint-400/20 bg-mint-400/5 px-3.5 py-3 text-xs leading-relaxed text-mint-300">
      {children}
    </div>
  );
}
