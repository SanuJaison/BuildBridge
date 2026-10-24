import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldAlert, UserCog } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import useListing from "../../hooks/useListing";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Badge, Rating, StatusBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/ui/Feedback";
import { Field, Select, TextArea } from "../../components/ui/Form";
import Modal from "../../components/ui/Modal";
import { PageHeader } from "../../components/dashboard/DashboardUI";
import {
  EmptyCell,
  SearchField,
  TableFooter,
  TableShell,
  TableState,
  tdClass,
  thClass,
} from "../../components/admin/AdminBits";
import {
  PROVIDER_TYPE_LABELS,
  formatDate,
  formatDateTime,
  humanize,
  timeAgo,
} from "../../lib/format";

const USER_STATUS = {
  active: { label: "Active", tone: "mint" },
  suspended: { label: "Suspended", tone: "red" },
};

const PROVIDER_STATUS = {
  draft: { label: "Draft", tone: "amber" },
  published: { label: "Published", tone: "mint" },
  suspended: { label: "Suspended", tone: "red" },
};

const ROLE_TONES = { customer: "blue", provider: "violet", admin: "amber" };

export default function AdminUsers() {
  usePageTitle("Accounts");
  const toast = useToast();
  const listing = useListing("/admin/users", "Accounts could not be loaded.");
  const { searchParams, update } = listing;
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(query, 300);
  const [manager, setManager] = useState({ open: false, loading: false, error: "", data: null });
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (debouncedQuery === urlQuery) return;
    update({ q: debouncedQuery });
  }, [debouncedQuery, urlQuery, update]);

  const openManager = async (userId) => {
    setManager({ open: true, loading: true, error: "", data: null });
    setReason("");
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      setManager({ open: true, loading: false, error: "", data });
    } catch (error) {
      setManager({ open: true, loading: false, error: getApiMessage(error, "Account details could not be loaded."), data: null });
    }
  };

  const closeManager = () => setManager({ open: false, loading: false, error: "", data: null });

  const changeStatus = async (status) => {
    const user = manager.data?.user;
    if (!user) return;
    const userId = user.id || user._id;
    setBusy(true);
    try {
      await api.patch(`/admin/users/${userId}`, {
        status,
        ...(status === "suspended" ? { suspensionReason: reason.trim() || "Policy violation" } : {}),
      });
      const { data } = await api.get(`/admin/users/${userId}`);
      toast.success(
        status === "suspended" ? "Account suspended" : "Account reactivated",
        status === "suspended"
          ? `${user.name} can no longer sign in or use the marketplace.`
          : `${user.name} can sign in again.`
      );
      setManager({ open: true, loading: false, error: "", data });
      setReason("");
      listing.reload();
    } catch (error) {
      toast.error("Account not updated", getApiMessage(error, "Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const user = manager.data?.user;
  const providerProfile = manager.data?.providerProfile;
  const memberships = manager.data?.memberships || [];

  return (
    <div>
      <PageHeader
        eyebrow="Community"
        title="Accounts"
        description="Review every customer, provider, and administrator. Suspension immediately blocks access; reactivation restores it."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Search by name or email…" />
        <Select
          value={searchParams.get("role") || ""}
          onChange={(event) => update({ role: event.target.value })}
          aria-label="Filter by role"
          className="py-2 text-xs sm:w-40"
        >
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="provider">Providers</option>
          <option value="admin">Administrators</option>
        </Select>
        <Select
          value={searchParams.get("status") || ""}
          onChange={(event) => update({ status: event.target.value })}
          aria-label="Filter by status"
          className="py-2 text-xs sm:w-40"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      <TableShell minWidth={880}>
        <thead className="border-b border-white/8 bg-white/[0.02]">
          <tr>
            <th className={thClass}>Account</th>
            <th className={thClass}>Role</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Provider profile</th>
            <th className={thClass}>Joined</th>
            <th className={thClass}>Last sign-in</th>
            <th className={`${thClass} text-right`}>Action</th>
          </tr>
        </thead>
        <TableState
          colSpan={7}
          loading={listing.loading}
          error={listing.error}
          onRetry={listing.reload}
          empty={!listing.items.length}
          emptyContent={
            <EmptyState
              icon={UserCog}
              title="No accounts match"
              description="Clear the filters or search another name."
              className="border-0 py-4"
            />
          }
        >
          {listing.items.map((account) => (
              <tr key={account._id} className="border-t border-white/5 transition hover:bg-white/[0.02]">
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <Avatar src={account.avatar} name={account.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-200">{account.name}</p>
                      <p className="truncate text-[10px] text-slate-500">{account.email}</p>
                    </div>
                  </div>
                </td>
                <td className={tdClass}>
                  <Badge tone={ROLE_TONES[account.role] || "slate"}>{humanize(account.role)}</Badge>
                </td>
                <td className={tdClass}>
                  <StatusBadge status={account.status} map={USER_STATUS} />
                  {account.suspensionReason ? (
                    <p className="mt-1 max-w-[180px] truncate text-[10px] text-slate-500">{account.suspensionReason}</p>
                  ) : null}
                </td>
                <td className={tdClass}>
                  {account.providerProfile ? (
                    <div>
                      <p className="text-xs text-slate-300">{account.providerProfile.displayName}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {PROVIDER_TYPE_LABELS[account.providerProfile.type] || humanize(account.providerProfile.type)} ·{" "}
                        {humanize(account.providerProfile.status)}
                      </p>
                    </div>
                  ) : (
                    <EmptyCell>—</EmptyCell>
                  )}
                </td>
                <td className={tdClass}>
                  <span className="text-[11px] text-slate-400">{formatDate(account.createdAt)}</span>
                </td>
                <td className={tdClass}>
                  <span className="text-[11px] text-slate-400">
                    {account.lastLoginAt ? timeAgo(account.lastLoginAt) : "Never"}
                  </span>
                </td>
                <td className={`${tdClass} text-right`}>
                  <Button variant="secondary" size="sm" icon={UserCog} onClick={() => openManager(account.id || account._id)}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))
          }
        </TableState>
        <tfoot>
          <tr>
            <td colSpan={7} className="p-0">
              <TableFooter
                total={listing.total}
                page={listing.page}
                pages={listing.pages}
                label="accounts"
                onChange={(page) => listing.update({ page }, { resetPage: false })}
              />
            </td>
          </tr>
        </tfoot>
      </TableShell>

      <Modal
        open={manager.open}
        onClose={busy ? () => {} : closeManager}
        title={user ? user.name : "Account details"}
        description={user ? user.email : "Review account activity and moderation controls."}
        size="lg"
        footer={
          <Button variant="ghost" onClick={closeManager} disabled={busy}>
            Close
          </Button>
        }
      >
        {manager.loading ? (
          <p className="py-10 text-center text-xs text-slate-500">Loading account…</p>
        ) : manager.error ? (
          <ErrorState message={manager.error} />
        ) : user ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={ROLE_TONES[user.role] || "slate"}>{humanize(user.role)}</Badge>
              <StatusBadge status={user.status} map={USER_STATUS} />
              <span className="text-[10px] text-slate-500">Joined {formatDate(user.createdAt)}</span>
              <span className="text-[10px] text-slate-500">
                Last sign-in {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "never"}
              </span>
            </div>

            <dl className="grid gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-600">Name</dt>
                <dd className="mt-0.5 text-slate-300">{user.name}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-600">Email</dt>
                <dd className="mt-0.5 break-all text-slate-300">{user.email}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-600">Phone</dt>
                <dd className="mt-0.5 text-slate-300">{user.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-600">Company</dt>
                <dd className="mt-0.5 text-slate-300">{user.company || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-600">Location</dt>
                <dd className="mt-0.5 text-slate-300">{user.location || "—"}</dd>
              </div>
            </dl>

            {user.bio ? (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600">About</p>
                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-400">{user.bio}</p>
              </div>
            ) : null}

            {providerProfile ? (
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">Provider profile</p>
                    <p className="mt-1 text-sm font-medium text-white">{providerProfile.displayName}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {PROVIDER_TYPE_LABELS[providerProfile.type] || humanize(providerProfile.type)}
                      {providerProfile.primaryCategory?.name ? ` · ${providerProfile.primaryCategory.name}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={providerProfile.status} map={PROVIDER_STATUS} />
                    {providerProfile.featured ? <Badge tone="amber">Featured</Badge> : null}
                    {providerProfile.verified ? <Badge tone="mint">Verified</Badge> : null}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3">
                  <Rating value={providerProfile.ratingAvg} count={providerProfile.ratingCount} />
                  <Link
                    to={`/providers/${providerProfile.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200"
                  >
                    Public profile <ArrowUpRight size={11} />
                  </Link>
                </div>
              </div>
            ) : null}

            {memberships.length ? (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600">Organization memberships</p>
                <ul className="mt-2 space-y-2">
                  {memberships.map((membership) => (
                    <li
                      key={membership._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-[11px]"
                    >
                      <span className="text-slate-300">{membership.organization?.name || "Organization"}</span>
                      <span className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Badge tone="slate">{humanize(membership.role)}</Badge>
                        {humanize(membership.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {user.role === "admin" ? (
              <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.05] px-3.5 py-3 text-[11px] leading-relaxed text-amber-100/80">
                Administrator accounts cannot be suspended or edited from the console.
              </div>
            ) : user.status === "suspended" ? (
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-xs font-medium text-slate-200">Reactivate this account</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  The account will be able to sign in again. A provider profile suspended separately must be republished from the provider page if eligible.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  loading={busy}
                  onClick={() => changeStatus("active")}
                >
                  Reactivate account
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.04] p-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-200">
                  <ShieldAlert size={13} /> Suspend this account
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Suspension blocks sign-in immediately and takes a provider profile offline. Explain the reason for the record.
                </p>
                <Field label="Suspension reason" htmlFor="suspension-reason" className="mt-3">
                  <TextArea
                    id="suspension-reason"
                    rows={3}
                    maxLength={500}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Policy violation, fraudulent activity, or another clear reason…"
                  />
                </Field>
                <Button variant="danger" size="sm" className="mt-3" loading={busy} onClick={() => changeStatus("suspended")}>
                  Suspend account
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
