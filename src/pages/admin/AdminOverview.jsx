import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  FileText,
  Flag,
  Mail,
  RefreshCw,
  ScrollText,
  Store,
  Users,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { Avatar } from "../../components/ui/Avatar";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { PageHeader, Panel, StatCard } from "../../components/dashboard/DashboardUI";
import { INQUIRY_STATUS, formatDateTime, humanize, timeAgo } from "../../lib/format";

const PIPELINE = ["new", "in_discussion", "proposal_sent", "accepted", "completed", "declined", "cancelled"];

const PIPELINE_COLORS = {
  new: "bg-sky-400",
  in_discussion: "bg-amber-300",
  proposal_sent: "bg-violet-400",
  accepted: "bg-emerald-300",
  completed: "bg-emerald-400",
  declined: "bg-rose-400",
  cancelled: "bg-slate-500",
};

const ROLE_TONES = { customer: "blue", provider: "violet", admin: "amber" };

function actionLabel(action = "") {
  return humanize(String(action).replace(/\./g, " "));
}

function lastSevenDays(series = []) {
  const counts = new Map(series.map((row) => [row.date, row.count]));
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - offset);
    const key = date.toISOString().slice(0, 10);
    days.push({
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      count: counts.get(key) || 0,
    });
  }
  return days;
}

export default function AdminOverview() {
  usePageTitle("Admin overview");
  const [state, setState] = useState({ loading: true, error: "", data: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/admin/stats");
      setState({ loading: false, error: "", data });
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "Platform statistics could not be loaded."), data: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading && !state.data) {
    return <LoadingBlock label="Loading command center" />;
  }
  if (state.error) {
    return <ErrorState message={state.error} onRetry={load} />;
  }
  if (!state.data) return null;

  const { counts, inquiryByStatus = {}, recentUsers = [], recentInquiries = [], audits = [], signupSeries = [] } =
    state.data;
  const totalInquiries = counts.totalInquiries || 0;
  const days = lastSevenDays(signupSeries);
  const peak = Math.max(1, ...days.map((day) => day.count));

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Command center"
        description="A live view of marketplace activity. Every moderation action you take is written to the audit log."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load} loading={state.loading}>
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          value={counts.customers + counts.providerUsers + counts.admins}
          label="Total accounts"
          hint={`${counts.customers} customers · ${counts.providerUsers} providers · ${counts.admins} ${counts.admins === 1 ? "admin" : "admins"}`}
          to="/admin/users"
        />
        <StatCard
          icon={Store}
          value={counts.publishedProviders}
          label="Live provider profiles"
          hint={`${counts.draftProviders} in draft · ${counts.featuredProviders} featured`}
          tone="mint"
          to="/admin/providers"
        />
        <StatCard
          icon={FileText}
          value={totalInquiries}
          label="Inquiries recorded"
          hint={`${counts.completedInquiries} completed · ${counts.proposals} proposals`}
          tone="sky"
          to="/admin/reports"
        />
        <StatCard
          icon={Flag}
          value={counts.openReports + counts.newContactMessages}
          label="Needs attention"
          hint={`${counts.openReports} open ${counts.openReports === 1 ? "report" : "reports"} · ${counts.newContactMessages} new contact ${counts.newContactMessages === 1 ? "message" : "messages"}`}
          tone="amber"
          to="/admin/reports"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Panel title="Inquiry pipeline" description="Where every brief currently sits in the engagement flow.">
          <div className="space-y-3.5">
            {PIPELINE.map((status) => {
              const value = inquiryByStatus[status] || 0;
              const percent = totalInquiries ? Math.round((value / totalInquiries) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge status={status} map={INQUIRY_STATUS} />
                    <span className="text-[11px] text-slate-400">
                      {value}
                      <span className="ml-1.5 text-[10px] text-slate-600">{percent}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${PIPELINE_COLORS[status]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!totalInquiries ? <p className="text-xs text-slate-500">No inquiries have been recorded yet.</p> : null}
          </div>
        </Panel>

        <Panel title="New accounts" description="Signups over the last seven days.">
          <div className="flex h-40 items-end gap-2">
            {days.map((day) => (
              <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-medium text-slate-400">{day.count}</span>
                <div className="flex h-24 w-full items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-600/70 to-brand-400"
                    style={{ height: `${Math.max(day.count ? 8 : 2, (day.count / peak) * 100)}%` }}
                    title={`${day.count} signups`}
                  />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-600">{day.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
              <Activity size={11} />
              Real account creation events
            </span>
            <span className="text-[10px] text-slate-400">
              {days.reduce((sum, day) => sum + day.count, 0)} this week
            </span>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          title="Newest accounts"
          action={
            <Link to="/admin/users" className="inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200">
              All accounts <ArrowUpRight size={11} />
            </Link>
          }
        >
          <ul className="space-y-3">
            {recentUsers.map((user) => (
              <li key={user._id} className="flex items-center gap-3">
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{user.name}</p>
                  <p className="truncate text-[10px] text-slate-500">{user.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge tone={ROLE_TONES[user.role] || "slate"}>{humanize(user.role)}</Badge>
                  {user.status === "suspended" ? <Badge tone="red">Suspended</Badge> : null}
                </div>
              </li>
            ))}
            {!recentUsers.length ? <li className="text-xs text-slate-500">No accounts yet.</li> : null}
          </ul>
        </Panel>

        <Panel
          title="Latest inquiries"
          action={
            <Link to="/admin/reports" className="inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200">
              Reports <ArrowUpRight size={11} />
            </Link>
          }
        >
          <ul className="space-y-3">
            {recentInquiries.map((inquiry) => (
              <li key={inquiry._id} className="flex items-start gap-3">
                <Avatar src={inquiry.customer?.avatar} name={inquiry.customer?.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{inquiry.title}</p>
                  <p className="truncate text-[10px] text-slate-500">
                    {inquiry.customer?.name || "Customer"} · {timeAgo(inquiry.createdAt)}
                  </p>
                </div>
                <StatusBadge status={inquiry.status} map={INQUIRY_STATUS} className="shrink-0" />
              </li>
            ))}
            {!recentInquiries.length ? <li className="text-xs text-slate-500">No inquiries yet.</li> : null}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Recent moderation activity"
          action={
            <Link
              to="/admin/audit-logs"
              className="inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200"
            >
              Full audit log <ArrowUpRight size={11} />
            </Link>
          }
        >
          <ul className="space-y-3">
            {audits.map((entry) => (
              <li key={entry._id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] text-slate-400">
                  <ScrollText size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-slate-200">{actionLabel(entry.action)}</p>
                  <p className="truncate text-[10px] text-slate-500">
                    {entry.admin?.name || "Administrator"} · {entry.details || "No additional detail"}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-600">{timeAgo(entry.createdAt)}</span>
              </li>
            ))}
            {!audits.length ? <li className="text-xs text-slate-500">No moderation activity yet.</li> : null}
          </ul>
        </Panel>

        <Panel title="Operations snapshot">
          <dl className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-2 text-slate-500">
                <Store size={12} /> Published services
              </dt>
              <dd className="text-slate-200">
                {counts.publishedServices} <span className="text-slate-600">of {counts.services}</span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-2 text-slate-500">
                <FileText size={12} /> Portfolio projects
              </dt>
              <dd className="text-slate-200">{counts.publishedProjects}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-2 text-slate-500">
                <Flag size={12} /> Suspended accounts
              </dt>
              <dd className="text-slate-200">{counts.suspendedUsers}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-2 text-slate-500">
                <Mail size={12} /> New contact messages
              </dt>
              <dd className="text-slate-200">{counts.newContactMessages}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-2 text-slate-500">
                <ScrollText size={12} /> Platform reviews
              </dt>
              <dd className="text-slate-200">{counts.reviews}</dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-white/8 pt-3 text-[10px] leading-relaxed text-slate-600">
            Snapshot generated {formatDateTime(new Date())}. Figures come directly from the platform database.
          </p>
        </Panel>
      </div>
    </div>
  );
}
