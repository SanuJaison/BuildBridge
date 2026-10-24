import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import Logo from "../brand/Logo";
import { useAuth } from "../../contexts/AuthContext";
import AccountMenu from "./AccountMenu";
import NotificationBell from "./NotificationBell";
import { buttonClass } from "../ui/Button";

const LINKS = [
  { label: "Explore talent", to: "/providers" },
  { label: "Services", to: "/services" },
  { label: "Work", to: "/portfolio" },
  { label: "Categories", to: "/categories" },
  { label: "How it works", to: "/how-it-works" },
];

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const solid = scrolled || !isHome;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          solid ? "border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="container-page flex h-[74px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/services"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:text-white sm:inline-flex"
              aria-label="Search services"
            >
              <Search size={15} />
            </Link>

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className={buttonClass("secondary", "sm", "hidden sm:inline-flex")}>
                  Dashboard
                </Link>
                <AccountMenu />
              </>
            ) : (
              <>
                <Link to="/login" className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}>
                  Sign in
                </Link>
                <Link to="/register" className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
                  Join BuildBridge
                  <ArrowUpRight size={13} />
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-white/20 hover:text-white lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto border-b border-white/10 bg-ink-900 px-5 pb-8 pt-5">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col" aria-label="Mobile">
              {LINKS.map((link, index) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between border-b border-white/[0.07] py-4 text-lg tracking-tight transition ${
                      isActive ? "text-white" : "text-slate-300"
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <span className="text-[10px] font-medium text-slate-600">0{index + 1}</span>
                </NavLink>
              ))}
            </nav>
            <div className="mt-7 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <>
                  <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className={buttonClass("primary", "lg", "w-full")}>
                    Go to dashboard
                  </Link>
                  <Link to="/dashboard/settings" className={buttonClass("secondary", "lg", "w-full")}>
                    Account settings
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className={buttonClass("primary", "lg", "w-full")}>
                    Join BuildBridge
                  </Link>
                  <Link to="/login" className={buttonClass("secondary", "lg", "w-full")}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
            <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-600">
              BuildBridge demo · sample profiles, projects, and reviews
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
