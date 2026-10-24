import { Loader2 } from "lucide-react";

const SIZES = {
  sm: "px-3 py-2 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3.5 text-sm rounded-xl",
  icon: "p-2.5 rounded-lg",
};

export function buttonClass(variant = "primary", size = "md", extra = "") {
  return `btn btn-${variant} ${SIZES[size] || SIZES.md} ${extra}`.trim();
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  children,
  className = "",
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin" /> : null}
      {!loading && Icon ? <Icon size={size === "sm" ? 13 : 15} /> : null}
      {children}
      {!loading && IconRight ? <IconRight size={size === "sm" ? 13 : 15} /> : null}
    </button>
  );
}
