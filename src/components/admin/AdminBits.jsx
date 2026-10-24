import { AlertTriangle, Search } from "lucide-react";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";

export const thClass =
  "whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500";
export const tdClass = "px-4 py-3.5 align-middle text-xs text-slate-300";

export function TableShell({ children, minWidth = 760 }) {
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableState({ colSpan, loading, error, empty, emptyContent, onRetry, children }) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="px-4 py-14 text-center text-xs text-slate-500">
            Loading…
          </td>
        </tr>
      </tbody>
    );
  }
  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="px-4 py-12">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <AlertTriangle size={20} className="text-rose-300" />
              <p className="mt-3 text-xs leading-relaxed text-slate-400">{error}</p>
              {onRetry ? (
                <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
                  Try again
                </Button>
              ) : null}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }
  if (empty) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="px-4 py-14 text-center text-xs text-slate-500">
            {emptyContent || "No records found."}
          </td>
        </tr>
      </tbody>
    );
  }
  return <tbody>{children}</tbody>;
}

export function TableFooter({ total, page, pages, onChange, label = "records" }) {
  return (
    <div className="flex flex-col gap-3 border-t border-white/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[10px] text-slate-500">
        {total} {label}
        {pages > 1 ? ` · page ${page} of ${pages}` : ""}
      </p>
      <Pagination page={page} pages={pages} onChange={onChange} />
    </div>
  );
}

export function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input-base py-2 pl-8 pr-3 text-xs"
      />
    </div>
  );
}

export function EmptyCell({ children }) {
  return <span className="text-slate-500">{children}</span>;
}
