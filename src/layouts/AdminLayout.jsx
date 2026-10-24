import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Flag,
  LayoutDashboard,
  Layers,
  Mail,
  Menu,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Store,
  Users,
  X,
} from "lucide-react";
import Logo from "../components/brand/Logo";
import AccountMenu from "../components/layout/AccountMenu";
import { useAuth } from "../contexts/AuthContext";

const NAV = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Command center", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Community",
    items: [
      { to: "/admin/users", label: "Accounts", icon: Users },
      { to: "/admin/providers", label: "Provider profiles", icon: Store },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { to: "/admin/categories", label: "Categories", icon: Layers },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
      { to: "/admin/reports", label: "Reports", icon: Flag },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/messages", label: "Contact inbox", icon: Mail },
      { to: "/admin/audit-logs", label: "Audit log", icon: ScrollText },
      { to: "/admin/settings", label: "Platform settings", icon: Settings },
    ],
  },
];

function SidebarLink({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
          isActive
            ? "border border-brand-400/25 bg-brand-500/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
        }`
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  const { user } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Logo />
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-200">
            <ShieldCheck size={10} />
            Admin console
          </span>
        </div>
      </div>

      <div className="mx-4 mb-5 rounded-xl border border-white/8 bg-white/[0.025] p-3">
        <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
        <p className="mt-0.5 truncate text-[10px] text-slate-500">{user?.email}</p>
        <p className="mt-2 text-[9px] leading-relaxed text-slate-600">
          Changes made here are recorded in the audit log.
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-6" aria-label="Admin">
        {NAV.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              {group.label}
            </p>
            {group.items.map((item) => (
              <SidebarLink key={item.to} item={item} onClick={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 p-4">
        <Link
          to="/"
          className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-[11px] text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <ArrowUpRight size={13} />
            View marketplace
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-ink-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-white/[0.07] bg-ink-900 lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl">
          <div className="flex h-[64px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={17} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-slate-500">Administration</p>
              <p className="hidden truncate text-[10px] text-slate-600 sm:block">
                Moderation, configuration, and platform oversight.
              </p>
            </div>
            <Link
              to="/"
              className="hidden items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] text-slate-400 transition hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              Marketplace
              <ArrowUpRight size={12} />
            </Link>
            <AccountMenu />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/75 backdrop-blur-sm"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[292px] max-w-[86vw] overflow-y-auto border-r border-white/10 bg-ink-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400"
              aria-label="Close admin menu"
            >
              <X size={16} />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
