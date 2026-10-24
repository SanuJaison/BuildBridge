import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck, Star, Store } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import useListing from "../../hooks/useListing";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Badge, Rating, StatusBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { Checkbox, Field, Select } from "../../components/ui/Form";
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
import { PROVIDER_TYPE_LABELS, PROVIDER_TYPES, formatDate, humanize } from "../../lib/format";

const PROVIDER_STATUS = {
  draft: { label: "Draft", tone: "amber" },
  published: { label: "Published", tone: "mint" },
  suspended: { label: "Suspended", tone: "red" },
};

export default function AdminProviders() {
  usePageTitle("Provider profiles");
  const toast = useToast();
  const listing = useListing("/admin/providers", "Provider profiles could not be loaded.");
  const { searchParams, update } = listing;
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(query, 300);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: "draft", featured: false, verified: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (debouncedQuery === urlQuery) return;
    update({ q: debouncedQuery });
  }, [debouncedQuery, urlQuery, update]);

  const openEditor = (provider) => {
    setSelected(provider);
    setForm({
      status: provider.status || "draft",
      featured: Boolean(provider.featured),
      verified: Boolean(provider.verified),
    });
  };

  const closeEditor = () => {
    if (busy) return;
    setSelected(null);
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await api.patch(`/admin/providers/${selected._id}`, form);
      toast.success("Provider updated", `${selected.displayName} was updated and the change was audited.`);
      setSelected(null);
      listing.reload();
    } catch (error) {
      toast.error("Provider not updated", getApiMessage(error, "Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const accountSuspended = selected?.user?.status === "suspended";

  return (
    <div>
      <PageHeader
        eyebrow="Community"
        title="Provider profiles"
        description="Publish, feature, verify, or suspend marketplace profiles. Account-level suspension is managed from Accounts."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Search by provider name…" />
        <Select
          value={searchParams.get("status") || ""}
          onChange={(event) => update({ status: event.target.value })}
          aria-label="Filter by profile status"
          className="py-2 text-xs sm:w-40"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Select
          value={searchParams.get("type") || ""}
          onChange={(event) => update({ type: event.target.value })}
          aria-label="Filter by provider type"
          className="py-2 text-xs sm:w-40"
        >
          <option value="">All types</option>
          {PROVIDER_TYPES.map((type) => (
            <option key={type} value={type}>
              {PROVIDER_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <Select
          value={searchParams.get("featured") || ""}
          onChange={(event) => update({ featured: event.target.value })}
          aria-label="Filter featured profiles"
          className="py-2 text-xs sm:w-40"
        >
          <option value="">Featured: any</option>
          <option value="true">Featured only</option>
        </Select>
      </div>

      <TableShell minWidth={900}>
        <thead className="border-b border-white/8 bg-white/[0.02]">
          <tr>
            <th className={thClass}>Provider</th>
            <th className={thClass}>Type</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Rating</th>
            <th className={thClass}>Flags</th>
            <th className={thClass}>Created</th>
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
              icon={Store}
              title="No provider profiles match"
              description="Try a different status, type, or search term."
              className="border-0 py-4"
            />
          }
        >
          {listing.items.map((provider) => (
            <tr key={provider._id} className="border-t border-white/5 transition hover:bg-white/[0.02]">
              <td className={tdClass}>
                <div className="flex items-center gap-3">
                  <Avatar src={provider.avatar} name={provider.displayName} size="sm" />
                  <div className="min-w-0">
                    <Link
                      to={`/providers/${provider.slug}`}
                      className="truncate text-xs font-medium text-slate-200 hover:text-brand-200"
                    >
                      {provider.displayName}
                    </Link>
                    <p className="truncate text-[10px] text-slate-500">
                      {provider.user?.email || "No owner account"}
                      {provider.user?.status === "suspended" ? " · account suspended" : ""}
                    </p>
                  </div>
                </div>
              </td>
              <td className={tdClass}>
                <span className="text-[11px] text-slate-400">
                  {PROVIDER_TYPE_LABELS[provider.type] || humanize(provider.type)}
                </span>
              </td>
              <td className={tdClass}>
                <StatusBadge status={provider.status} map={PROVIDER_STATUS} />
              </td>
              <td className={tdClass}>
                {provider.ratingCount ? (
                  <Rating value={provider.ratingAvg} count={provider.ratingCount} size={11} />
                ) : (
                  <EmptyCell>No reviews</EmptyCell>
                )}
              </td>
              <td className={tdClass}>
                <div className="flex flex-wrap gap-1">
                  {provider.featured ? <Badge tone="amber">Featured</Badge> : null}
                  {provider.verified ? (
                    <Badge tone="mint">
                      <BadgeCheck size={10} />
                      Verified
                    </Badge>
                  ) : null}
                  {!provider.featured && !provider.verified ? <EmptyCell>—</EmptyCell> : null}
                </div>
              </td>
              <td className={tdClass}>
                <span className="text-[11px] text-slate-400">{formatDate(provider.createdAt)}</span>
              </td>
              <td className={`${tdClass} text-right`}>
                <Button variant="secondary" size="sm" icon={Star} onClick={() => openEditor(provider)}>
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </TableState>
        <tfoot>
          <tr>
            <td colSpan={7} className="p-0">
              <TableFooter
                total={listing.total}
                page={listing.page}
                pages={listing.pages}
                label="profiles"
                onChange={(page) => listing.update({ page }, { resetPage: false })}
              />
            </td>
          </tr>
        </tfoot>
      </TableShell>

      <Modal
        open={Boolean(selected)}
        onClose={closeEditor}
        title={selected?.displayName || "Provider profile"}
        description={selected?.headline || "Moderate this marketplace profile."}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeEditor} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={save} loading={busy}>
              Save changes
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selected.status} map={PROVIDER_STATUS} />
              <span className="text-[10px] text-slate-500">
                {PROVIDER_TYPE_LABELS[selected.type] || humanize(selected.type)} · {selected.user?.email || "No owner"}
              </span>
              <Link
                to={`/providers/${selected.slug}`}
                className="ml-auto inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200"
              >
                Public profile <ArrowUpRight size={11} />
              </Link>
            </div>

            <Field label="Profile status" htmlFor="provider-status" hint="Published profiles are visible in the marketplace.">
              <Select
                id="provider-status"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="suspended">Suspended</option>
              </Select>
            </Field>

            {accountSuspended ? (
              <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.05] px-3.5 py-3 text-[11px] leading-relaxed text-amber-100/80">
                The owning account is suspended. Reactivate the account before publishing this profile.
              </div>
            ) : null}

            <div className="space-y-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <Checkbox
                label="Featured profile"
                description="Highlights this provider in featured marketplace sections."
                checked={form.featured}
                onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
              />
              <Checkbox
                label="Verified by BuildBridge"
                description="Reserved for profiles whose business details have been checked."
                checked={form.verified}
                onChange={(event) => setForm((current) => ({ ...current, verified: event.target.checked }))}
              />
            </div>

            <p className="text-[10px] leading-relaxed text-slate-600">
              This action is recorded in the audit log. Publishing notifies the provider.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
