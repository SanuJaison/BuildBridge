import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  FileText,
  Handshake,
  Info,
  MessageSquare,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import Pagination from "../../components/ui/Pagination";
import { PageHeader, Panel } from "../../components/dashboard/DashboardUI";
import { timeAgo } from "../../lib/format";

const TYPE_ICONS = {
  inquiry: FileText,
  proposal: Handshake,
  message: MessageSquare,
  review: Star,
  status: CheckCheck,
  team: Users,
  admin: ShieldCheck,
  system: Info,
};

const TYPE_TONES = {
  inquiry: "border-brand-400/20 bg-brand-500/10 text-brand-300",
  proposal: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  message: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  review: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  status: "border-mint-400/20 bg-mint-400/10 text-mint-300",
  team: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  admin: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  system: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

export default function Notifications() {
  usePageTitle("Notifications");
  const { socket } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [state, setState] = useState({ loading: true, error: "", items: [], total: 0, pages: 1, unreadCount: 0 });
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (targetPage = page, onlyUnread = unreadOnly, quiet = false) => {
    if (!quiet) setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/notifications", {
        params: { page: targetPage, limit: 20, ...(onlyUnread ? { unread: "true" } : {}) },
      });
      setState({
        loading: false,
        error: "",
        items: data.items || [],
        total: data.total || 0,
        pages: data.pages || 1,
        unreadCount: data.unreadCount || 0,
      });
    } catch (error) {
      if (!quiet) {
        setState((current) => ({ ...current, loading: false, error: getApiMessage(error, "Notifications could not be loaded.") }));
      }
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    load(page, unreadOnly);
  }, [page, unreadOnly, load]);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = () => load(page, unreadOnly, true);
    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, [socket, page, unreadOnly, load]);

  const markRead = async (notification) => {
    if (notification.readAt) return;
    setState((current) => ({
      ...current,
      items: current.items.map((item) => (item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item)),
      unreadCount: Math.max(0, current.unreadCount - 1),
    }));
    try {
      await api.patch(`/notifications/${notification._id}/read`);
      window.dispatchEvent(new CustomEvent("bb:notifications-changed"));
    } catch {
      load(page, unreadOnly, true);
    }
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await api.post("/notifications/read-all");
      setState((current) => ({
        ...current,
        unreadCount: 0,
        items: current.items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })),
      }));
      window.dispatchEvent(new CustomEvent("bb:notifications-changed"));
      toast.success("All caught up", "Every notification is marked as read.");
    } catch (error) {
      toast.error("Could not update notifications", getApiMessage(error));
    } finally {
      setMarkingAll(false);
    }
  };

  const toggleUnread = () => {
    setPage(1);
    setUnreadOnly((current) => !current);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Activity feed"
        title="Notifications"
        description="Inquiry updates, proposals, messages, reviews, and team activity in one place."
        actions={
          <button
            type="button"
            onClick={markAll}
            disabled={markingAll || state.unreadCount === 0}
            className={buttonClass("secondary", "md")}
          >
            <CheckCheck size={14} />
            {markingAll ? "Marking…" : "Mark all read"}
          </button>
        }
      />

      <Panel padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleUnread}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                unreadOnly ? "bg-brand-500/15 text-brand-200 ring-1 ring-brand-400/30" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              Unread only
            </button>
            <span className="text-[10px] text-slate-600">
              {state.unreadCount} unread · {state.total} total
            </span>
          </div>
          <button
            type="button"
            onClick={() => load(page, unreadOnly, true)}
            className="text-[10px] text-slate-500 transition hover:text-slate-300"
          >
            Refresh
          </button>
        </div>

        {state.error ? (
          <div className="p-5">
            <ErrorState message={state.error} onRetry={() => load(page, unreadOnly)} />
          </div>
        ) : state.loading && !state.items.length ? (
          <LoadingBlock label="Loading notifications" />
        ) : state.items.length ? (
          <ul className="divide-y divide-white/[0.06]">
            {state.items.map((notification) => {
              const Icon = TYPE_ICONS[notification.type] || Info;
              const tone = TYPE_TONES[notification.type] || TYPE_TONES.system;
              const content = (
                <>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-xs ${notification.readAt ? "text-slate-300" : "font-semibold text-white"}`}>
                        {notification.title}
                      </p>
                      {!notification.readAt ? <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> : null}
                    </div>
                    {notification.message ? (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{notification.message}</p>
                    ) : null}
                    <p className="mt-1.5 text-[10px] text-slate-600">{timeAgo(notification.createdAt)}</p>
                  </div>
                </>
              );

              return (
                <li key={notification._id}>
                  {notification.link ? (
                    <Link
                      to={notification.link}
                      onClick={() => markRead(notification)}
                      className={`flex items-start gap-3 px-4 py-4 transition hover:bg-white/[0.025] sm:px-5 ${
                        notification.readAt ? "opacity-75" : ""
                      }`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markRead(notification)}
                      className={`flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-white/[0.025] sm:px-5 ${
                        notification.readAt ? "opacity-75" : ""
                      }`}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Bell}
              title={unreadOnly ? "Nothing unread" : "No notifications yet"}
              description={
                unreadOnly
                  ? "You have read everything in your activity feed."
                  : "Updates about inquiries, proposals, messages, and team activity will appear here."
              }
              action={
                unreadOnly ? (
                  <button type="button" onClick={toggleUnread} className={buttonClass("secondary", "sm")}>
                    Show all notifications
                  </button>
                ) : (
                  <Link to="/dashboard" className={buttonClass("secondary", "sm")}>
                    Back to dashboard
                  </Link>
                )
              }
            />
          </div>
        )}

        {state.pages > 1 ? (
          <div className="border-t border-white/8 px-4 py-3 sm:px-5">
            <Pagination page={page} pages={state.pages} onChange={setPage} />
          </div>
        ) : null}
      </Panel>

      <p className="mt-4 text-[10px] leading-relaxed text-slate-600">
        Notification emails are not sent in this demo. Preferences can be updated in account settings.
      </p>
    </div>
  );
}
