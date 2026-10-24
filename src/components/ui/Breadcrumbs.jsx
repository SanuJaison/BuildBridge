import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [], className = "" }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 ${className}`}>
      <Link to="/" className="transition hover:text-slate-300">
        Home
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight size={11} className="text-slate-700" />
          {item.to ? (
            <Link to={item.to} className="transition hover:text-slate-300">
              {item.label}
            </Link>
          ) : (
            <span className="max-w-[240px] truncate text-slate-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
