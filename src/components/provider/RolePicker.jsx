import { Check, Star } from "lucide-react";
import { PROVIDER_ROLES, ROLE_TONES, roleMeta } from "../../lib/providerRoles";

export function RoleBadge({ value, className = "" }) {
  const role = roleMeta(value);
  if (!role) return null;
  const Icon = role.icon;
  return (
    <span className={`chip border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-slate-300 ${className}`}>
      <Icon size={11} className="text-brand-200" />
      {role.label}
    </span>
  );
}

export default function RolePicker({
  value = [],
  onChange,
  primary = "",
  onPrimaryChange,
  max = 3,
  columns = "sm:grid-cols-2",
  disabled = false,
}) {
  const toggle = (roleValue) => {
    if (disabled) return;
    const selected = value.includes(roleValue);
    if (selected) {
      const next = value.filter((item) => item !== roleValue);
      onChange(next);
      if (primary === roleValue) onPrimaryChange?.(next[0] || "");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, roleValue]);
    if (!primary) onPrimaryChange?.(roleValue);
  };

  return (
    <div>
      <div className={`grid gap-2 ${columns}`}>
        {PROVIDER_ROLES.map((role) => {
          const Icon = role.icon;
          const selected = value.includes(role.value);
          const atLimit = !selected && value.length >= max;
          return (
            <div
              key={role.value}
              className={`group relative overflow-hidden rounded-xl border p-3 transition ${
                selected
                  ? "border-brand-400/45 bg-brand-500/[0.09]"
                  : atLimit
                    ? "border-white/[0.06] bg-white/[0.01] opacity-45"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.035]"
              }`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition ${ROLE_TONES[role.value]} ${selected ? "opacity-100" : "group-hover:opacity-60"}`} />
              <div className="relative flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => toggle(role.value)}
                  disabled={disabled}
                  aria-pressed={selected}
                  className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                      selected ? "border-brand-300/40 bg-brand-400/15 text-brand-100" : "border-white/10 bg-white/[0.03] text-slate-400"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                      {role.label}
                      {selected ? <Check size={11} className="text-mint-300" /> : null}
                    </span>
                    <span className="mt-0.5 block text-[9.5px] leading-snug text-slate-500">{role.blurb}</span>
                  </span>
                </button>
                {selected && value.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onPrimaryChange?.(role.value)}
                    disabled={disabled}
                    className={`shrink-0 rounded-md p-1 transition ${
                      primary === role.value
                        ? "text-amber-300"
                        : "text-slate-600 hover:text-amber-200"
                    }`}
                    aria-label={`Make ${role.label} your primary role`}
                    title="Primary role"
                  >
                    <Star size={11} className={primary === role.value ? "fill-amber-300" : ""} />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
        Choose up to {max}. The starred role leads your public profile. {value.length}/{max} selected.
      </p>
    </div>
  );
}
