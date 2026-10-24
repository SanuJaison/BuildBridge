import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Briefcase, FileText, Search } from "lucide-react";
import useListing from "../../hooks/useListing";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar } from "../../components/ui/Avatar";
import { StatusBadge } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import Pagination from "../../components/ui/Pagination";
import { PageHeader, Panel } from "../../components/dashboard/DashboardUI";
import { INQUIRY_STATUS, PROPOSAL_STATUS, formatDate, humanize, money, timeAgo } from "../../lib/format";

const TABS = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "In discussion", value: "in_discussion" },
  { label: "Proposals", value: "proposal_sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
  { label: "Closed", value: "declined,cancelled" },
];

function budgetLabel(item) {
  if (item.budgetMin == null && item.budgetMax == null) return "Budget open";
  if (item.budgetMin != null && item.budgetMax != null) {
    return `${money(item.budgetMin)} – ${money(item.budgetMax)}`;
  }
  if (item.budgetMin != null) return `From ${money(item.budgetMin)}`;
  return `Up to ${money(item.budgetMax)}`;
}

export default function InquiriesList() {
  const { user, isProvider } = useAuth();
  usePageTitle("Inquiries");
  const [searchParams] = useSearchParams();
  const listing = useListing("/inquiries", "Your inquiries could not be loaded.");
  const { update } = listing;
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const status = searchParams.get("status") || "";

  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setSearch(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("q") || "";
      if (search.trim() !== current) update({ q: search.trim() });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, searchParams, update]);

  const unread = (item) => (isProvider ? !item.providerReadAt : !item.customerReadAt);

  return (
    <div>
      <PageHeader
        eyebrow={isProvider ? "Provider activity" : "Customer activity"}
        title={isProvider ? "Incoming inquiries" : "Your inquiries"}
        description={
          isProvider
            ? "Review new briefs, open discussions, and send clear proposals."
            : "Follow every conversation from first brief through completed engagement."
        }
        actions={
          isProvider ? (
            <Link to="/dashboard/provider" className={buttonClass("secondary", "md")}>
              Workspace overview
            </Link>
          ) : (
            <Link to="/start-project" className={buttonClass("primary", "md")}>
              Start a project
            </Link>
          )
        }
      />

      <Panel padded={false}>
        <div className="border-b border-white/8 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => listing.update({ status: tab.value })}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                    status === tab.value
                      ? "bg-brand-500/15 text-white ring-1 ring-brand-400/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-64">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search inquiry titles…"
                aria-label="Search inquiries"
                className="input-base py-2 pl-8 pr-3 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="px-4 py-2 text-[10px] text-slate-600 sm:px-5">
          {listing.loading ? "Loading inquiries…" : `${listing.total} inquir${listing.total === 1 ? "y" : "ies"}`}
        </div>

        {listing.error ? (
          <div className="p-5">
            <ErrorState message={listing.error} onRetry={listing.reload} />
          </div>
        ) : listing.loading && !listing.items.length ? (
          <LoadingBlock label="Loading inquiries" />
        ) : listing.items.length ? (
          <ul className="divide-y divide-white/[0.06]">
            {listing.items.map((inquiry) => {
              const participant = isProvider ? inquiry.customer : inquiry.provider;
              const name = isProvider ? participant?.name : participant?.displayName;
              return (
                <li key={inquiry._id}>
                  <Link
                    to={`/dashboard/inquiries/${inquiry._id}`}
                    className="group flex flex-col gap-3 px-4 py-4 transition hover:bg-white/[0.025] sm:px-5 lg:flex-row lg:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="relative">
                        <Avatar src={participant?.avatar} name={name || "BuildBridge"} size="md" />
                        {unread(inquiry) ? (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-400 ring-2 ring-ink-850" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[13px] font-medium text-slate-100 group-hover:text-white">
                            {inquiry.title}
                          </p>
                          {unread(inquiry) ? <span className="text-[9px] font-bold uppercase tracking-wider text-brand-300">Unread</span> : null}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {isProvider ? "From" : "With"} {name || "BuildBridge member"}
                          {isProvider ? "" : ` · ${humanize(participant?.type || "provider")}`}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
                          <span>{budgetLabel(inquiry)}</span>
                          <span>{inquiry.timeline || "Timeline open"}</span>
                          <span>Updated {timeAgo(inquiry.lastActivityAt)}</span>
                          <span>Opened {formatDate(inquiry.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-13 lg:shrink-0 lg:justify-end">
                      <StatusBadge status={inquiry.status} map={INQUIRY_STATUS} />
                      {inquiry.proposal ? (
                        <StatusBadge status={inquiry.proposal.status} map={PROPOSAL_STATUS} />
                      ) : null}
                      <span className="hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-500 transition group-hover:border-brand-400/25 group-hover:text-brand-300 sm:inline-flex">
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={isProvider ? Briefcase : FileText}
              title={status || search ? "No inquiries match these filters" : isProvider ? "No inquiries yet" : "No inquiries yet"}
              description={
                isProvider
                  ? "When a customer sends you a project brief, it will appear here with everything needed to respond."
                  : "Start with a brief, then keep the conversation, proposal, and completion in one place."
              }
              action={
                status || search ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      listing.clear(["q", "status", "page"]);
                    }}
                    className={buttonClass("secondary", "sm")}
                  >
                    Clear filters
                  </button>
                ) : isProvider ? (
                  <Link to="/dashboard/provider/profile" className={buttonClass("primary", "sm")}>
                    Polish your profile
                  </Link>
                ) : (
                  <Link to="/start-project" className={buttonClass("primary", "sm")}>
                    Start a project
                  </Link>
                )
              }
            />
          </div>
        )}

        {listing.pages > 1 ? (
          <div className="border-t border-white/8 px-4 py-3 sm:px-5">
            <Pagination page={listing.page} pages={listing.pages} onChange={(page) => listing.update({ page }, { resetPage: false })} />
          </div>
        ) : null}
      </Panel>

      {!isProvider ? (
        <p className="mt-4 text-[11px] leading-relaxed text-slate-600">
          Signed in as {user?.email}. Inquiries are private to you and the provider you contacted.
        </p>
      ) : null}
    </div>
  );
}
