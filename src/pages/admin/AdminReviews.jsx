import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MessageSquare, Star } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import useListing from "../../hooks/useListing";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Badge, Rating, StatusBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { Field, Select, TextArea } from "../../components/ui/Form";
import Modal from "../../components/ui/Modal";
import { PageHeader } from "../../components/dashboard/DashboardUI";
import {
  TableFooter,
  TableShell,
  TableState,
  tdClass,
  thClass,
} from "../../components/admin/AdminBits";
import { REVIEW_STATUS, formatDate } from "../../lib/format";

export default function AdminReviews() {
  usePageTitle("Review moderation");
  const toast = useToast();
  const listing = useListing("/admin/reviews", "Reviews could not be loaded.");
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("published");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const openEditor = (review) => {
    setSelected(review);
    setStatus(review.status);
    setNote(review.moderationNote || "");
  };

  const closeEditor = () => {
    if (busy) return;
    setSelected(null);
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await api.patch(`/admin/reviews/${selected._id}`, { status, moderationNote: note.trim() });
      toast.success("Review moderated", `The review is now ${status}. Provider ratings were recalculated.`);
      setSelected(null);
      listing.reload();
    } catch (error) {
      toast.error("Review not updated", getApiMessage(error, "Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Marketplace"
        title="Review moderation"
        description="Reviews are written only for completed engagements. Hiding or removing a review immediately recalculates the provider's public rating."
        actions={
          <Select
            value={listing.searchParams.get("status") || ""}
            onChange={(event) => listing.update({ status: event.target.value })}
            aria-label="Filter reviews by status"
            className="py-2 text-xs"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
            <option value="removed">Removed</option>
          </Select>
        }
      />

      <TableShell minWidth={900}>
        <thead className="border-b border-white/8 bg-white/[0.02]">
          <tr>
            <th className={thClass}>Customer</th>
            <th className={thClass}>Provider</th>
            <th className={thClass}>Rating</th>
            <th className={thClass}>Review</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Date</th>
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
              icon={Star}
              title="No reviews match"
              description="Adjust the status filter to see other reviews."
              className="border-0 py-4"
            />
          }
        >
          {listing.items.map((review) => (
            <tr key={review._id} className="border-t border-white/5 transition hover:bg-white/[0.02]">
              <td className={tdClass}>
                <div className="flex items-center gap-2.5">
                  <Avatar src={review.customer?.avatar} name={review.customer?.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs text-slate-200">{review.customer?.name || "Customer"}</p>
                    <p className="truncate text-[10px] text-slate-500">{review.customer?.email || ""}</p>
                  </div>
                </div>
              </td>
              <td className={tdClass}>
                {review.provider ? (
                  <Link
                    to={`/providers/${review.provider.slug}`}
                    className="text-xs text-slate-300 hover:text-brand-200"
                  >
                    {review.provider.displayName}
                  </Link>
                ) : (
                  <span className="text-slate-500">Provider removed</span>
                )}
              </td>
              <td className={tdClass}>
                <Rating value={review.rating} showValue={false} size={11} />
                <span className="ml-1 text-[10px] text-slate-500">{review.rating}/5</span>
              </td>
              <td className={tdClass}>
                <div className="max-w-[300px]">
                  <p className="truncate text-xs text-slate-300">{review.title || "Untitled review"}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">{review.comment}</p>
                  <div className="mt-1 flex gap-1">
                    {review.isDemo ? <Badge tone="slate">Demo content</Badge> : null}
                    {review.moderationNote ? <Badge tone="amber">Moderator note</Badge> : null}
                  </div>
                </div>
              </td>
              <td className={tdClass}>
                <StatusBadge status={review.status} map={REVIEW_STATUS} />
              </td>
              <td className={tdClass}>
                <span className="text-[11px] text-slate-400">{formatDate(review.createdAt)}</span>
              </td>
              <td className={`${tdClass} text-right`}>
                <Button variant="secondary" size="sm" icon={MessageSquare} onClick={() => openEditor(review)}>
                  Moderate
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
                label="reviews"
                onChange={(page) => listing.update({ page }, { resetPage: false })}
              />
            </td>
          </tr>
        </tfoot>
      </TableShell>

      <Modal
        open={Boolean(selected)}
        onClose={closeEditor}
        title="Moderate review"
        description={selected?.title || "Review the content and choose its visibility."}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeEditor} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={save} loading={busy}>
              Save moderation
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar src={selected.customer?.avatar} name={selected.customer?.name} size="sm" />
                  <div>
                    <p className="text-xs text-slate-200">{selected.customer?.name || "Customer"}</p>
                    <p className="text-[10px] text-slate-500">{formatDate(selected.createdAt)}</p>
                  </div>
                </div>
                <Rating value={selected.rating} size={12} />
              </div>
              <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-slate-300">{selected.comment}</p>
              {selected.provider ? (
                <Link
                  to={`/providers/${selected.provider.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200"
                >
                  {selected.provider.displayName} <ArrowUpRight size={11} />
                </Link>
              ) : null}
            </div>

            <Field label="Visibility" htmlFor="review-status" hint="Hidden reviews stay internal; removed reviews are permanently excluded from ratings.">
              <Select id="review-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
                <option value="removed">Removed</option>
              </Select>
            </Field>

            <Field
              label="Moderation note"
              htmlFor="review-note"
              hint="Internal only. Explain the decision for the audit trail."
            >
              <TextArea
                id="review-note"
                rows={3}
                maxLength={500}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Reason for this moderation decision…"
              />
            </Field>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
