import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  CheckCircle2,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Star,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar } from "../../components/ui/Avatar";
import { StatusBadge } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { PageHeader, Panel, StatCard } from "../../components/dashboard/DashboardUI";
import { INQUIRY_STATUS, timeAgo } from "../../lib/format";

const ACTIVE_STATUSES = ["new", "in_discussion", "proposal_sent", "accepted"];

function CustomerDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: "", data: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [recent, active, completed, favorites, notifications, reviews] = await Promise.all([
        api.get("/inquiries", { params: { limit: 5 } }),
        api.get("/inquiries", { params: { status: ACTIVE_STATUSES.join(","), limit: 1 } }),
        api.get("/inquiries", { params: { status: "completed", limit: 1 } }),
        api.get("/favorites"),
        api.get("/notifications", { params: { limit: 5 } }),
        api.get("/reviews/mine"),
      ]);
      setState({
        loading: false,
        error: "",
        data: {
          recent: recent.data.items || [],
          total: recent.data.total || 0,
          active: active.data.total || 0,
          completed: completed.data.total || 0,
          favorites: favorites.data.items || [],
          notifications: notifications.data.items || [],
          unread: notifications.data.unreadCount || 0,
          reviews: reviews.data.items || [],
        },
      });
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "Your dashboard could not be loaded."), data: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePageTitle("Dashboard");

  if (state.loading) return <LoadingBlock label="Loading your workspace" />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const { recent, total, active, completed, favorites, notifications, unread, reviews } = state.data;
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div>
      <PageHeader
        eyebrow="Customer workspace"
        title={`Welcome back, ${firstName}`}
        description="Pick up conversations, revisit saved specialists, and keep your projects moving."
        actions={
          <>
            <Link to="/providers" className={buttonClass("secondary", "md")}>
              <Search size={14} />
              Explore talent
            </Link>
            <Link to="/start-project" className={buttonClass("primary", "md")}>
              <Plus size={15} />
              Start a project
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Active engagements" value={active} hint={`${total} total inquir${total === 1 ? "y" : "ies"}`} to="/dashboard/inquiries?status=new,in_discussion,proposal_sent,accepted" />
        <StatCard icon={CheckCircle2} label="Completed projects" value={completed} tone="mint" to="/dashboard/inquiries?status=completed" />
        <StatCard icon={Bookmark} label="Saved specialists" value={favorites.length} tone="sky" to="/dashboard/favorites" />
        <StatCard icon={Star} label="Reviews written" value={reviews.length} tone="amber" to="/dashboard/reviews" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Panel
          title="Recent inquiries"
          description="Your latest project conversations."
          action={
            <Link to="/dashboard/inquiries" className="text-[11px] font-medium text-brand-300 transition hover:text-brand-200">
              View all
            </Link>
          }
          padded={false}
        >
          {recent.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {recent.map((inquiry) => (
                <li key={inquiry._id}>
                  <Link
                    to={`/dashboard/inquiries/${inquiry._id}`}
                    className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.025] sm:px-5"
                  >
                    <Avatar
                      src={inquiry.provider?.avatar}
                      name={inquiry.provider?.displayName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-slate-100">{inquiry.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {inquiry.provider?.displayName || "Provider"} · updated {timeAgo(inquiry.lastActivityAt)}
                      </p>
                    </div>
                    <StatusBadge status={inquiry.status} map={INQUIRY_STATUS} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={Briefcase}
                title="No project inquiries yet"
                description="Find a specialist or share a brief to start your first conversation."
                action={
                  <Link to="/start-project" className={buttonClass("primary", "sm")}>
                    Start a project
                  </Link>
                }
              />
            </div>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel
            title="Notifications"
            action={
              <Link to="/dashboard/notifications" className="text-[11px] font-medium text-brand-300 transition hover:text-brand-200">
                {unread > 0 ? `${unread} unread` : "View all"}
              </Link>
            }
            padded={false}
          >
            {notifications.length ? (
              <ul className="divide-y divide-white/[0.06]">
                {notifications.map((notification) => (
                  <li key={notification._id}>
                    <Link
                      to={notification.link || "/dashboard/notifications"}
                      className="flex gap-2.5 px-4 py-3 transition hover:bg-white/[0.025]"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          notification.readAt ? "bg-slate-700" : "bg-brand-400"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className={`truncate text-xs ${notification.readAt ? "text-slate-400" : "font-medium text-slate-200"}`}>
                          {notification.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-600">{timeAgo(notification.createdAt)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-xs text-slate-500">You have no notifications yet.</p>
            )}
          </Panel>

          <Panel title="Quick moves">
            <div className="space-y-2">
              {[
                { icon: Plus, label: "Send a new project brief", to: "/start-project" },
                { icon: MessageSquare, label: "Open your messages", to: "/dashboard/messages" },
                { icon: Bookmark, label: "Review saved talent", to: "/dashboard/favorites" },
                { icon: ArrowUpRight, label: "Browse open services", to: "/services" },
              ].map(({ icon: Icon, label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-xs text-slate-300 transition hover:border-brand-400/25 hover:bg-white/[0.04] hover:text-white"
                >
                  <Icon size={14} className="text-brand-300" />
                  <span className="flex-1">{label}</span>
                  <ArrowRight size={12} className="text-slate-600" />
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {favorites.length ? (
        <Panel
          title="Saved specialists"
          className="mt-5"
          action={
            <Link to="/dashboard/favorites" className="text-[11px] font-medium text-brand-300 transition hover:text-brand-200">
              View all
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.slice(0, 4).map((favorite) => {
              const provider = favorite.provider;
              if (!provider) return null;
              return (
                <Link
                  key={favorite._id}
                  to={`/providers/${provider.slug}`}
                  className="surface-hover rounded-xl border border-white/8 bg-white/[0.02] p-3.5"
                >
                  <Avatar src={provider.avatar} name={provider.displayName} size="md" />
                  <p className="mt-2.5 truncate text-xs font-semibold text-white">{provider.displayName}</p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">{provider.headline || provider.primaryCategory?.name || "Digital specialist"}</p>
                </Link>
              );
            })}
          </div>
        </Panel>
      ) : null}

      <p className="mt-6 text-center text-[10px] leading-relaxed text-slate-600">
        BuildBridge stores its own records for this demo. No payments are processed, and reviews only come from completed engagements.
      </p>
    </div>
  );
}

export default function DashboardHome() {
  const { isProvider, providerProfile } = useAuth();
  if (isProvider) return <Navigate to={providerProfile ? "/dashboard/provider" : "/dashboard/team"} replace />;
  return <CustomerDashboard />;
}
