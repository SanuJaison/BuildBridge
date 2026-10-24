import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../ui/Avatar";
import { humanize } from "../../lib/format";

export default function AccountMenu({ compact = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const dashboardPath = user.role === "admin" ? "/admin" : "/dashboard";
  const dashboardLabel = user.role === "admin" ? "Admin console" : "Dashboard";

  const handleLogout = async () => {
    setLeaving(true);
    try {
      await logout();
      toast.success("Signed out", "Your session has ended safely.");
      navigate("/");
    } finally {
      setLeaving(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 pr-2 transition hover:border-white/20 hover:bg-white/[0.07]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name || "your account"}`}
      >
        <Avatar src={user.avatar} name={user.name} size="sm" />
        {!compact ? (
          <span className="hidden max-w-[110px] truncate text-xs font-medium text-slate-200 sm:block">
            {user.name.split(" ")[0]}
          </span>
        ) : null}
        <ChevronDown size={13} className={`text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-ink-850 shadow-2xl"
        >
          <div className="border-b border-white/8 px-4 py-3.5">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
              {user.role === "admin" ? <ShieldCheck size={10} /> : <UserRound size={10} />}
              {user.role === "provider" ? "Provider account" : humanize(user.role)}
            </span>
          </div>
          <div className="p-1.5">
            <Link
              to={dashboardPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
              role="menuitem"
            >
              <LayoutDashboard size={14} />
              {dashboardLabel}
            </Link>
            {user.role !== "admin" ? (
              <Link
                to="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
                role="menuitem"
              >
                <Settings size={14} />
                Account settings
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              disabled={leaving}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
              role="menuitem"
            >
              <LogOut size={14} />
              {leaving ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
