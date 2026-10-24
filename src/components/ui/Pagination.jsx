import { ChevronLeft, ChevronRight } from "lucide-react";

function pageWindow(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", pages];
  if (page >= pages - 3) return [1, "…", pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, "…", page - 1, page, page + 1, "…", pages];
}

export default function Pagination({ page = 1, pages = 1, onChange, className = "" }) {
  if (pages <= 1) return null;
  const items = pageWindow(page, pages);

  return (
    <nav className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-2.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
        <span className="hidden sm:inline">Previous</span>
      </button>
      {items.map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1.5 text-xs text-slate-600">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`h-9 min-w-9 rounded-lg border px-2.5 text-xs font-medium transition ${
              item === page
                ? "border-brand-400/40 bg-brand-500/15 text-white"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-2.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
