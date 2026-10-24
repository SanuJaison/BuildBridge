import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  Bookmark,
  FileText,
  Images,
  LayoutDashboard,
  Layers,
  Menu,
  MessageSquare,
  PanelTop,
  Settings,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import Logo from "../components/brand/Logo";
import AccountMenu from "../components/layout/AccountMenu";
import NotificationBell from "../components/layout/NotificationBell";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";
import { PROVIDER_TYPE_LABELS } from "../lib/format";

const ACTIVITY = [
  { to: "/dashboard/inquiries", label: "Inquiries", icon: FileText },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const PROVIDER_WORKSPACE = [
  { to: "/dashboard/provider/profile", label: "Marketplace profile", icon: PanelTop },
  { to: "/dashboard/provider/services", label: "Services", icon: Layers },
  { to: "/dashboard/provider/portfolio", label: "Portfolio", icon: Images },
  { to: "/dashboard/team", label: "Team", icon: Users },
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
      {item.badge ? (
        <span className="rounded-full bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-200">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  const { user, providerProfile, organization, isProvider, workspace } = useAuth();
  const displayName = providerProfile?.displayName || user?.name || "BuildBridge";
  const avatar = providerProfile?.avatar || user?.avatar;

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Logo />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
          {isProvider ? "Provider workspace" : "Customer workspace"}
        </p>
      </div>

      <div className="mx-4 mb-5 rounded-xl border border-white/8 bg-white/[0.025] p-3">
        <div className="flex items-center gap-2.5">
          <Avatar src={avatar} name={displayName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{displayName}</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {isProvider
                ? organization?.name || PROVIDER_TYPE_LABELS[providerProfile?.type] || "Provider"
                : user?.email}
            </p>
          </div>
        </div>
        {isProvider ? (
          providerProfile ? (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={providerProfile.status === "published" ? "mint" : providerProfile.status === "suspended" ? "red" : "amber"} dot>
                {providerProfile.status === "published" ? "Live profile" : providerProfile.status === "suspended" ? "Suspended" : "Draft profile"}
              </Badge>
              {workspace?.canManage === false ? <Badge tone="slate">Team member</Badge> : null}
            </div>
          ) : (
            <Badge tone="amber" dot className="mt-2.5">
              Teammate account
            </Badge>
          )
        ) : (
          <Badge tone="blue" dot className="mt-2.5">
            Customer
          </Badge>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-6" aria-label="Dashboard">
        <div className="space-y-1">
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Overview</p>
          <SidebarLink
            item={
              isProvider
                ? { to: "/dashboard/provider", label: "Dashboard", icon: LayoutDashboard, end: true }
                : { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true }
            }
            onClick={onNavigate}
          />
        </div>

        {isProvider ? (
          <div className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Provider workspace
            </p>
            {(providerProfile ? PROVIDER_WORKSPACE : PROVIDER_WORKSPACE.filter((item) => item.to === "/dashboard/team")).map(
              (item) => (
                <SidebarLink key={item.to} item={item} onClick={onNavigate} />
              )
            )}
          </div>
        ) : null}

        <div className="space-y-1">
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Activity</p>
          {ACTIVITY.map((item) => (
            <SidebarLink key={item.to} item={item} onClick={onNavigate} />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Account</p>
          <SidebarLink item={{ to: "/dashboard/favorites", label: "Saved talent", icon: Bookmark }} onClick={onNavigate} />
          {isProvider ? null : (
            <SidebarLink item={{ to: "/dashboard/reviews", label: "My reviews", icon: Star }} onClick={onNavigate} />
          )}
          <SidebarLink item={{ to: "/dashboard/settings", label: "Settings", icon: Settings }} onClick={onNavigate} />
        </div>
      </nav>

      <div className="border-t border-white/8 p-4">
        <Link
          to={isProvider && providerProfile?.status === "published" ? `/providers/${providerProfile.slug}` : "/"}
          target={isProvider && providerProfile?.status === "published" ? "_blank" : undefined}
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-[11px] text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <ArrowUpRight size={13} />
            {isProvider && providerProfile?.status === "published" ? "View public profile" : "Browse marketplace"}
          </span>
        </Link>
        {user?.role === "admin" ? (
          <Link
            to="/admin"
            className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] text-amber-200/80 transition hover:bg-amber-300/5 hover:text-amber-100"
          >
            <ShieldCheck size={13} />
            Admin console
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isProvider, providerProfile } = useAuth();

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
              aria-label="Open workspace menu"
            >
              <Menu size={17} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-slate-500">
                {isProvider ? "Provider workspace" : "Customer workspace"}
              </p>
              <p className="hidden truncate text-[10px] text-slate-600 sm:block">
                {isProvider && !providerProfile
                  ? "Accept a team invitation to unlock your provider workspace."
                  : isProvider && providerProfile?.status === "draft"
                    ? "Your profile is in draft — publish it to appear in search."
                    : "Signed in securely to BuildBridge."}
              </p>
            </div>
            <Link
              to="/"
              className="hidden items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] text-slate-400 transition hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              Marketplace
              <ArrowUpRight size={12} />
            </Link>
            <NotificationBell />
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
            aria-label="Close workspace menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[292px] max-w-[86vw] overflow-y-auto border-r border-white/10 bg-ink-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400"
              aria-label="Close workspace menu"
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
