import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  Inbox,
  Layers,
  MessageSquare,
  Plus,
  Star,
  Users,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Badge, Rating, StatusBadge } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { PageHeader, Panel, SetupStep, StatCard } from "../../components/dashboard/DashboardUI";
import { INQUIRY_STATUS, timeAgo } from "../../lib/format";

function profileReadiness(profile) {
  return [
    {
      key: "name",
      label: "Add your display name",
      done: Boolean(profile?.displayName && profile.displayName.trim().length >= 2),
    },
    {
      key: "headline",
      label: "Write a headline (8+ characters)",
      done: Boolean(profile?.headline && profile.headline.trim().length >= 8),
    },
    {
      key: "bio",
      label: "Add a biography of at least 80 characters",
      done: Boolean(profile?.bio && profile.bio.trim().length >= 80),
    },
    { key: "category", label: "Choose a primary category", done: Boolean(profile?.primaryCategory) },
    { key: "skills", label: "List at least one skill", done: Boolean(profile?.skills?.length) },
    { key: "location", label: "Add your location", done: Boolean(profile?.location) },
  ];
}

export default function ProviderOverview() {
  const { refresh, providerProfile } = useAuth();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, error: "", overview: null, profile: null });
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [overview, profile] = await Promise.all([
        api.get("/provider/overview"),
        api.get("/provider/profile"),
      ]);
      setState({ loading: false, error: "", overview: overview.data, profile: profile.data.provider });
    } catch (error) {
      setState({
        loading: false,
        error: getApiMessage(error, "Your provider workspace could not be loaded."),
        overview: null,
        profile: null,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePageTitle("Provider dashboard");

  const publish = async () => {
    setPublishing(true);
    try {
      await api.post("/provider/publish");
      toast.success("Profile published", "Your marketplace profile is now visible to customers.");
      await refresh();
      await load();
    } catch (error) {
      toast.error("Profile not published", getApiMessage(error));
    } finally {
      setPublishing(false);
    }
  };

  if (state.loading) return <LoadingBlock label="Loading your provider workspace" />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const { overview, profile } = state;
  const stats = overview.stats;
  const provider = overview.provider;
  const readiness = profileReadiness(profile);
  const publishReady = readiness.every((item) => item.done);
  const displayName = profile?.displayName || providerProfile?.displayName || "your workspace";
  const setupSteps = [
    {
      done: publishReady,
      title: "Complete your marketplace profile",
      description: "Customers see this information when they evaluate your work.",
      to: "/dashboard/provider/profile",
      actionLabel: "Complete",
    },
    {
      done: provider.status === "published",
      title: "Publish your profile",
      description: "Draft profiles are hidden from search and discovery.",
      to: "/dashboard/provider/profile",
      actionLabel: "Publish",
    },
    {
      done: stats.publishedServices > 0,
      title: "Publish your first service",
      description: "Show a packaged offer with a clear scope and starting price.",
      to: "/dashboard/provider/services",
      actionLabel: "Add service",
    },
    {
      done: stats.publishedProjects > 0,
      title: "Add a portfolio project",
      description: "Concrete work samples make your profile more credible.",
      to: "/dashboard/provider/portfolio",
      actionLabel: "Add project",
    },
  ];
  if (profile?.organization) {
    setupSteps.push({
      done: stats.teamMembers > 1,
      title: "Invite your team",
      description: "Owners and admins can invite teammates to help manage this workspace.",
      to: "/dashboard/team",
      actionLabel: "Invite",
    });
  }
  const setupComplete = setupSteps.every((step) => step.done);

  return (
    <div>
      <PageHeader
        eyebrow="Provider workspace"
        title={`Welcome, ${displayName}`}
        description="Manage your storefront, respond to demand, and keep your services sharp."
        actions={
          <>
            {provider.status === "published" && profile?.slug ? (
              <Link to={`/providers/${profile.slug}`} className={buttonClass("secondary", "md")}>
                <Eye size={14} />
                View public profile
              </Link>
            ) : null}
            <Link to="/dashboard/provider/services" className={buttonClass("primary", "md")}>
              <Plus size={15} />
              New service
            </Link>
          </>
        }
      />

      {provider.status === "suspended" ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-400/[0.06] px-4 py-3.5">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-rose-300" />
          <div>
            <p className="text-sm font-semibold text-rose-200">Your provider profile is suspended</p>
            <p className="mt-0.5 text-xs leading-relaxed text-rose-200/70">
              Your public listing and services are unavailable while an administrator reviews the account. Contact
              support if you believe this is a mistake.
            </p>
          </div>
        </div>
      ) : provider.status !== "published" ? (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-200" />
            <div>
              <p className="text-sm font-semibold text-amber-100">Your profile is still in draft</p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-100/60">
                {publishReady
                  ? "Everything required is in place. Publish when you are ready to appear in discovery."
                  : "Finish the required details, then publish to appear in search and category pages."}
              </p>
            </div>
          </div>
          {publishReady ? (
            <button type="button" onClick={publish} disabled={publishing} className={buttonClass("primary", "sm", "shrink-0")}>
              {publishing ? "Publishing…" : "Publish profile"}
            </button>
          ) : (
            <Link to="/dashboard/provider/profile" className={buttonClass("secondary", "sm", "shrink-0")}>
              Complete profile
            </Link>
          )}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="New inquiries"
          value={stats.newInquiries}
          hint="Waiting for your first response"
          tone="brand"
          to="/dashboard/inquiries?status=new"
        />
        <StatCard
          icon={Briefcase}
          label="Active engagements"
          value={stats.activeInquiries}
          hint="In discussion or accepted"
          tone="mint"
          to="/dashboard/inquiries?status=in_discussion,proposal_sent,accepted"
        />
        <StatCard
          icon={MessageSquare}
          label="Unread messages"
          value={stats.unreadMessages}
          hint={`${stats.conversations} conversation${stats.conversations === 1 ? "" : "s"} total`}
          tone="sky"
          to="/dashboard/messages"
        />
        <StatCard icon={Eye} label="Profile views" value={stats.profileViews} hint="Recorded marketplace visits" tone="amber" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <Panel
            title="Recent inquiries"
            description="The newest customers who reached out."
            action={
              <Link to="/dashboard/inquiries" className="text-[11px] font-medium text-brand-300 transition hover:text-brand-200">
                View all
              </Link>
            }
            padded={false}
          >
            {overview.recentInquiries?.length ? (
              <ul className="divide-y divide-white/[0.06]">
                {overview.recentInquiries.map((inquiry) => (
                  <li key={inquiry._id}>
                    <Link
                      to={`/dashboard/inquiries/${inquiry._id}`}
                      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.025] sm:px-5"
                    >
                      <Avatar src={inquiry.customer?.avatar} name={inquiry.customer?.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-slate-100">{inquiry.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {inquiry.customer?.name || "Customer"} · {timeAgo(inquiry.createdAt)}
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
                  icon={Inbox}
                  title="No inquiries yet"
                  description="A complete, published profile helps customers find and contact you."
                  action={
                    <Link to="/dashboard/provider/profile" className={buttonClass("primary", "sm")}>
                      Polish your profile
                    </Link>
                  }
                />
              </div>
            )}
          </Panel>

          <Panel title="Storefront health" description="How your public presence is performing.">
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Published services",
                  value: `${stats.publishedServices} of ${stats.services}`,
                  to: "/dashboard/provider/services",
                },
                {
                  label: "Published projects",
                  value: `${stats.publishedProjects} of ${stats.projects}`,
                  to: "/dashboard/provider/portfolio",
                },
                { label: "Saved by customers", value: stats.favoritesReceived, to: "/dashboard" },
                { label: "Completed engagements", value: stats.completedInquiries },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3">
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-600">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Rating value={provider.ratingAvg} count={provider.ratingCount} />
              {provider.verified ? <Badge tone="mint">Verified</Badge> : null}
              {provider.featured ? <Badge tone="violet">Featured</Badge> : null}
              <Badge tone={provider.status === "published" ? "mint" : "amber"} dot>
                {provider.status === "published" ? "Live profile" : provider.status === "suspended" ? "Suspended" : "Draft profile"}
              </Badge>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-600">
              Ratings come only from customers with completed engagements. BuildBridge does not process payments.
            </p>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel
            title={setupComplete ? "Storefront checklist complete" : "Finish your storefront"}
            description={
              setupComplete
                ? "Your public presence is live. Keep services and availability current."
                : "These steps make your profile useful to buyers."
            }
          >
            <div className="space-y-2">
              {setupSteps.map((step) => (
                <SetupStep
                  key={step.title}
                  done={step.done}
                  title={step.title}
                  description={step.description}
                  to={step.to}
                  actionLabel={step.actionLabel}
                />
              ))}
            </div>
            {setupComplete ? (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-mint-300">
                <CheckCircle2 size={13} />
                Everything looks ready.
              </p>
            ) : null}
          </Panel>

          <Panel title="Quick moves">
            <div className="space-y-2">
              {[
                { icon: Plus, label: "Add a service package", to: "/dashboard/provider/services" },
                { icon: Layers, label: "Show a portfolio project", to: "/dashboard/provider/portfolio" },
                { icon: MessageSquare, label: "Open conversations", to: "/dashboard/messages" },
                { icon: Users, label: "Manage your team", to: "/dashboard/team" },
                { icon: Eye, label: "Update profile and availability", to: "/dashboard/provider/profile" },
              ].map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
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

          <div className="surface rounded-2xl p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-white">
              <Star size={13} className="text-amber-300" />
              Reputation builds over time
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
              Complete engagements honestly and ask satisfied customers to leave a review. Ratings cannot be bought or
              edited by providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
