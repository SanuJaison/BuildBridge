import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "../components/brand/Logo";

const SIGNALS = [
  { icon: BadgeCheck, label: "Profile-led discovery" },
  { icon: ShieldCheck, label: "Private project briefs" },
  { icon: Sparkles, label: "Reviews from real completed work" },
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-ink-950 lg:grid lg:grid-cols-[1fr_1.05fr]">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={13} />
            Back to marketplace
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </main>
        <footer className="px-5 pb-6 text-center text-[10px] leading-relaxed text-slate-600 sm:px-8">
          Demo environment · Sample marketplace data · No payment processing
        </footer>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-white/8 bg-ink-900 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="aurora absolute -right-24 top-10 h-80 w-80 rounded-full bg-violet-600/30" />
          <div className="aurora absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-sky-500/20" />
          <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
          <div className="absolute left-1/2 top-1/2 h-[580px] w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
        </div>

        <div className="relative z-10 flex justify-end p-10">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-slate-400">
            A calmer way to build
          </span>
        </div>

        <div className="relative z-10 px-12 pb-4 xl:px-20">
          <p className="eyebrow">The BuildBridge standard</p>
          <h2 className="mt-5 max-w-lg font-serif text-4xl italic leading-[1.08] tracking-tight text-white xl:text-5xl">
            The right people make ambitious work feel possible.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
            Thoughtful profiles. Clear proposals. Every review tied to a completed engagement. BuildBridge is designed to
            make finding a trusted partner feel considered, not transactional.
          </p>

          <div className="mt-9 space-y-3">
            {SIGNALS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-xs text-slate-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand-300">
                  <Icon size={14} />
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-sm">
            <div className="flex -space-x-2.5">
              {[1, 3, 5, 7].map((index) => (
                <img
                  key={index}
                  src={`/static/demo/avatar-${index}.svg`}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-ink-900 bg-ink-800"
                />
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              <span className="font-semibold text-white">A marketplace of specialists.</span> Across engineering, design,
              games, marketing, and AI.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/8 px-12 py-6 text-[10px] text-slate-600 xl:px-20">
          <span>Profiles are sampled for this demo.</span>
          <Link to="/trust" className="inline-flex items-center gap-1 transition hover:text-slate-300">
            How trust works <ArrowUpRight size={11} />
          </Link>
        </div>
      </aside>
    </div>
  );
}
