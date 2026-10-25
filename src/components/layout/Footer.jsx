import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import Logo from "../brand/Logo";
import { useBranding } from "../../contexts/BrandingContext";

const COLUMNS = [
  {
    title: "Discover",
    links: [
      { label: "Explore talent", to: "/providers" },
      { label: "Browse services", to: "/services" },
      { label: "Portfolio work", to: "/portfolio" },
      { label: "All categories", to: "/categories" },
    ],
  },
  {
    title: "BuildBridge",
    links: [
      { label: "How it works", to: "/how-it-works" },
      { label: "About us", to: "/about" },
      { label: "Trust & safety", to: "/trust" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "For talent",
    links: [
      { label: "Join as a provider", to: "/register?role=provider" },
      { label: "Provider dashboard", to: "/dashboard/provider" },
      { label: "Team workspaces", to: "/dashboard/team" },
      { label: "Community guidelines", to: "/trust#guidelines" },
    ],
  },
];

export default function Footer() {
  const { branding } = useBranding();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-ink-900">
      <div className="aurora pointer-events-none absolute -top-40 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-brand-600/20" />
      <div className="container-page relative py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.4fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-slate-400">{branding.tagline}</p>
            <div className="mt-6 space-y-2.5 text-xs text-slate-500">
              {branding.supportEmail ? (
                <a href={`mailto:${branding.supportEmail}`} className="flex items-center gap-2 transition hover:text-slate-300">
                  <Mail size={13} className="text-brand-400" />
                  {branding.supportEmail}
                </a>
              ) : null}
              {branding.location ? (
                <span className="flex items-center gap-2">
                  <MapPin size={13} className="text-brand-400" />
                  {branding.location}
                </span>
              ) : null}
            </div>
            <Link
              to="/register?role=provider"
              className="mt-7 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 transition hover:text-brand-200"
            >
              Show what you can build <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-xs text-slate-400 transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {branding.showDemoNotice ? (
          <div className="mt-12 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3 text-[11px] leading-relaxed text-amber-200/70">
            <span className="font-semibold text-amber-200">Demo marketplace.</span> Provider profiles, portfolio items,
            reviews, and engagement records are fictional sample data created for demonstration. BuildBridge does not
            process payments in this build.
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 border-t border-white/8 pt-7 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {branding.siteName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/terms" className="transition hover:text-slate-300">
              Terms
            </Link>
            <Link to="/privacy" className="transition hover:text-slate-300">
              Privacy
            </Link>
            <Link to="/trust" className="transition hover:text-slate-300">
              Trust & safety
            </Link>
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="h-1 w-1 rounded-full bg-mint-400" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
