import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Command,
  CornerDownLeft,
  FolderKanban,
  Grid2X2,
  Layers,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import api from "../../lib/api";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { PROVIDER_ROLES, roleLabel } from "../../lib/providerRoles";
import { Avatar, Artwork } from "../ui/Avatar";

const QUICK_LINKS = [
  { label: "Explore talent", hint: "Browse specialists and teams", to: "/providers", icon: UserRound },
  { label: "Browse services", hint: "Packaged offers with clear scope", to: "/services", icon: Layers },
  { label: "See recent work", hint: "Portfolio projects and case studies", to: "/portfolio", icon: FolderKanban },
  { label: "All categories", hint: "11 disciplines, 115 specialties", to: "/categories", icon: Grid2X2 },
  { label: "Start a project brief", hint: "Tell us what you want to build", to: "/start-project", icon: Sparkles },
];

const EMPTY_RESULTS = { providers: [], services: [], projects: [], categories: [], roles: [] };

function ResultThumb({ src, label }) {
  return (
    <Artwork
      src={src}
      alt=""
      label={label}
      rounded="rounded-lg"
      className="h-11 w-14 shrink-0"
    />
  );
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 180);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("bb:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("bb:open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open || debouncedQuery.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    api
      .get("/marketplace/search", { params: { q: debouncedQuery.trim() }, signal: controller.signal })
      .then(({ data }) => {
        setResults({
          providers: data.providers || [],
          services: data.services || [],
          projects: data.projects || [],
          categories: data.categories || [],
          roles: data.roles || [],
        });
        setActive(0);
      })
      .catch((error) => {
        if (error.name !== "CanceledError" && error.code !== "ERR_CANCELED") setResults(EMPTY_RESULTS);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, open]);

  const groups = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      return [
        {
          key: "quick",
          label: "Jump to",
          items: QUICK_LINKS.map((item) => ({
            key: item.to,
            label: item.label,
            hint: item.hint,
            to: item.to,
            icon: item.icon,
          })),
        },
        {
          key: "roles",
          label: "Browse by role",
          items: PROVIDER_ROLES.slice(0, 6).map((role) => ({
            key: role.value,
            label: role.label,
            hint: role.short,
            to: `/providers?role=${role.value}`,
            icon: role.icon,
          })),
        },
      ];
    }

    const list = [];
    if (results.providers.length) {
      list.push({
        key: "providers",
        label: "Talent",
        items: results.providers.map((provider) => ({
          key: provider._id,
          label: provider.displayName,
          hint: provider.headline || (provider.primaryRole ? roleLabel(provider.primaryRole) : "Specialist"),
          to: `/providers/${provider.slug}`,
          avatar: provider.avatar,
          name: provider.displayName,
          thumb: provider.coverImage,
        })),
      });
    }
    if (results.services.length) {
      list.push({
        key: "services",
        label: "Services",
        items: results.services.map((service) => ({
          key: service._id,
          label: service.title,
          hint: service.provider?.displayName || service.category?.name,
          to: `/services/${service.slug}`,
          thumb: service.images?.[0],
        })),
      });
    }
    if (results.projects.length) {
      list.push({
        key: "projects",
        label: "Portfolio",
        items: results.projects.map((project) => ({
          key: project._id,
          label: project.title,
          hint: project.provider?.displayName || project.category?.name,
          to: `/portfolio/${project.slug}`,
          thumb: project.images?.[0],
        })),
      });
    }
    if (results.roles.length) {
      list.push({
        key: "roles",
        label: "Roles",
        items: results.roles.map((role) => ({
          key: role.value,
          label: role.label,
          hint: role.short,
          to: `/providers?role=${role.value}`,
          icon: PROVIDER_ROLES.find((item) => item.value === role.value)?.icon || Sparkles,
        })),
      });
    }
    if (results.categories.length) {
      list.push({
        key: "categories",
        label: "Categories",
        items: results.categories.map((category) => ({
          key: category._id,
          label: category.name,
          hint: "Category",
          to: `/categories/${category.slug}`,
          icon: Grid2X2,
        })),
      });
    }
    return list;
  }, [debouncedQuery, results]);

  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  useEffect(() => {
    if (active >= flatItems.length) setActive(0);
  }, [active, flatItems.length]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openItem = (item) => {
    if (!item?.to) return;
    navigate(item.to);
    close();
  };

  const onPanelKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (flatItems.length ? (current + 1) % flatItems.length : 0));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (flatItems.length ? (current - 1 + flatItems.length) % flatItems.length : 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      openItem(flatItems[active]);
    }
  };

  if (!open) return null;

  const searching = debouncedQuery.trim().length >= 2;
  let cursor = -1;

  return createPortal(
    <div className="fixed inset-0 z-[240] flex items-start justify-center px-4 pt-[9vh] sm:pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search BuildBridge">
      <button type="button" className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" onClick={close} aria-label="Close search" />
      <div
        ref={panelRef}
        onKeyDown={onPanelKeyDown}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/12 bg-ink-900/95 shadow-[0_50px_140px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent" />
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5">
          <Search size={18} className="shrink-0 text-brand-300" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search talent, services, projects, roles…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            aria-label="Search the marketplace"
          />
          {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/20 border-t-brand-300" /> : null}
          <button
            type="button"
            onClick={close}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 text-[10px] text-slate-400 transition hover:text-white"
          >
            <X size={11} />
            Esc
          </button>
        </div>

        <div ref={listRef} className="max-h-[56vh] overflow-y-auto px-2 py-2">
          {searching && !groups.length && !loading ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-white">No matches for “{query.trim()}”</p>
              <p className="mt-1.5 text-xs text-slate-500">Try a skill, a role like “game developer”, or a category.</p>
              <button
                type="button"
                onClick={() => openItem({ to: `/providers?q=${encodeURIComponent(query.trim())}` })}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-slate-300 transition hover:border-brand-300/30 hover:text-white"
              >
                Search all talent for “{query.trim()}”
                <ArrowUpRight size={12} />
              </button>
            </div>
          ) : null}

          {groups.map((group) => (
            <div key={group.key} className="mb-1.5">
              <p className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">{group.label}</p>
              {group.items.map((item) => {
                cursor += 1;
                const index = cursor;
                const Icon = item.icon;
                const isActive = index === active;
                return (
                  <button
                    key={`${group.key}-${item.key}`}
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => openItem(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"
                    }`}
                  >
                    {item.avatar !== undefined ? (
                      <Avatar src={item.avatar} name={item.name} size="sm" />
                    ) : item.thumb !== undefined ? (
                      <ResultThumb src={item.thumb} label={item.label} />
                    ) : (
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                          isActive ? "border-brand-300/35 bg-brand-500/15 text-brand-200" : "border-white/8 bg-white/[0.03] text-slate-400"
                        }`}
                      >
                        {Icon ? <Icon size={15} /> : <Search size={15} />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-slate-100">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.hint}</span>
                    </span>
                    <ArrowUpRight
                      size={13}
                      className={`shrink-0 transition ${isActive ? "text-brand-300" : "text-slate-700"}`}
                    />
                  </button>
                );
              })}
            </div>
          ))}

          {!searching ? (
            <p className="px-4 pb-3 pt-1 text-[10px] leading-relaxed text-slate-600">
              Search reads live marketplace records only. No invented results.
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-2.5 text-[10px] text-slate-600">
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-slate-400">↑</kbd>
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-slate-400">↓</kbd>
              to move
            </span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft size={10} />
              to open
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Command size={10} />
            K to search anywhere
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
