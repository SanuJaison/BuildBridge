import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Compass, Search } from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import { buttonClass } from "../../components/ui/Button";
import { POPULAR_SEARCHES } from "../../lib/format";

export default function NotFound() {
  usePageTitle("Page not found");
  const location = useLocation();

  return (
    <div className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="aurora absolute left-1/2 top-24 h-72 w-[640px] -translate-x-1/2 rounded-full bg-brand-600/20" />
      </div>
      <div className="container-page relative text-center">
        <p className="font-serif text-[clamp(5rem,16vw,11rem)] italic leading-none text-white/[0.07]">404</p>
        <div className="-mt-6 inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">
          <Compass size={11} />
          Path not found
        </div>
        <h1 className="mx-auto mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
          This page took a <span className="serif-accent text-gradient">different route.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
          The link may be out of date, or the profile or listing may have been unpublished. The work is still out there.
        </p>
        <p className="mt-3 truncate text-[10px] text-slate-600" title={location.pathname}>
          Requested: {location.pathname}
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/" className={buttonClass("primary", "md")}>
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <Link to="/providers" className={buttonClass("secondary", "md")}>
            <Search size={14} />
            Explore talent
          </Link>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">Popular searches</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {POPULAR_SEARCHES.map((term) => (
              <Link
                key={term}
                to={`/providers?q=${encodeURIComponent(term)}`}
                className="chip px-2.5 py-1.5 text-[10px] text-slate-400 transition hover:border-brand-300/30 hover:text-white"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-2 sm:grid-cols-3">
          {[
            { to: "/services", label: "Browse services" },
            { to: "/portfolio", label: "See portfolio work" },
            { to: "/contact", label: "Contact support" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[11px] text-slate-300 transition hover:border-brand-300/25 hover:text-white"
            >
              {link.label}
              <ArrowUpRight size={12} className="text-slate-600" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
