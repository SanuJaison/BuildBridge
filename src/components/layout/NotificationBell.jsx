import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function NotificationBell({ className = "" }) {
  const { user, socket } = useAuth();
  const toast = useToast();
  const [unread, setUnread] = useState(0);

  const loadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications", { params: { limit: 1 } });
      setUnread(data.unreadCount || 0);
    } catch {
      // A missing count should never block the rest of the interface.
    }
  }, [user]);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = (notification) => {
      setUnread((current) => current + 1);
      if (notification?.title) toast.info(notification.title, notification.message || "");
      loadCount();
    };
    const onChanged = () => loadCount();
    socket.on("notification:new", onNew);
    window.addEventListener("bb:notifications-changed", onChanged);
    return () => {
      socket.off("notification:new", onNew);
      window.removeEventListener("bb:notifications-changed", onChanged);
    };
  }, [socket, loadCount, toast]);

  if (!user) return null;

  return (
    <Link
      to="/dashboard/notifications"
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:text-white ${className}`}
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
    >
      <Bell size={16} />
      {unread > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white shadow-lg shadow-brand-500/40">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
