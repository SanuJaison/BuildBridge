import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Flag, ShieldAlert } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import useListing from "../../hooks/useListing";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Badge, StatusBadge } from "../../components/ui/Badge";
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
import { REPORT_STATUS, formatDate, humanize, timeAgo } from "../../lib/format";

const TARGET_TONES = {
  user: "blue",
  provider: "violet",
  review: "amber",
  portfolio: "mint",
  service: "mint",
  message: "slate",
};

export default function AdminReports() {
  usePageTitle("Reports");
  const toast = useToast();
  const listing = useListing("/admin/reports", "Reports could not be loaded.");
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("reviewing");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const openEditor = (report) => {
    setSelected(report);
    setStatus(report.status === "open" ? "reviewing" : report.status);
    setNote(report.resolutionNote || "");
  };

  const closeEditor = () => {
    if (busy) return;
    setSelected(null);
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await api.patch(`/admin/reports/${selected._id}`, {
        status,
        resolutionNote: note.trim(),
      });
      toast.success("Report updated", "The reporter was notified and the decision was audited.");
      setSelected(null);
      listing.reload();
    } catch (error) {
      toast.error("Report not updated", getApiMessage(error, "Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Marketplace"
        title="Reports"
        description="Review community reports on profiles, reviews, services, portfolio work, messages, and accounts. Every decision notifies the reporter."
        actions={
          <Select
            value={listing.searchParams.get("status") || ""}
            onChange={(event) => listing.update({ status: event.target.value })}
            aria-label="Filter reports by status"
            className="py-2 text-xs"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
        }
      />

      <TableShell minWidth={920}>
        <thead className="border-b border-white/8 bg-white/[0.02]">
          <tr>
            <th className={thClass}>Reporter</th>
            <th className={thClass}>Target</th>
            <th className={thClass}>Reason</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Reported</th>
            <th className={`${thClass} text-right`}>Action</th>
          </tr>
        </thead>
        <TableState
          colSpan={6}
          loading={listing.loading}
          error={listing.error}
          onRetry={listing.reload}
          empty={!listing.items.length}
          emptyContent={
            <EmptyState
              icon={Flag}
              title="No reports match"
              description="There is nothing to review with this status."
              className="border-0 py-4"
            />
          }
        >
          {listing.items.map((report) => (
            <tr key={report._id} className="border-t border-white/5 transition hover:bg-white/[0.02]">
              <td className={tdClass}>
                <div className="flex items-center gap-2.5">
                  <Avatar src={report.reporter?.avatar} name={report.reporter?.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs text-slate-200">{report.reporter?.name || "Community member"}</p>
                    <p className="truncate text-[10px] text-slate-500">{report.reporter?.email || ""}</p>
                  </div>
                </div>
              </td>
              <td className={tdClass}>
                <div className="flex max-w-[280px] flex-col gap-1">
                  <Badge tone={TARGET_TONES[report.targetType] || "slate"}>{humanize(report.targetType)}</Badge>
                  {report.targetPreview ? (
                    report.targetPreview.link ? (
                      <Link
                        to={report.targetPreview.link}
                        className="inline-flex items-center gap-1 truncate text-[11px] text-slate-300 hover:text-brand-200"
                      >
                        <span className="truncate">{report.targetPreview.label}</span>
                        <ArrowUpRight size={10} className="shrink-0" />
                      </Link>
                    ) : (
                      <span className="truncate text-[11px] text-slate-400">{report.targetPreview.label}</span>
                    )
                  ) : (
                    <span className="text-[11px] text-slate-600">Target unavailable</span>
                  )}
                </div>
              </td>
              <td className={tdClass}>
                <p className="max-w-[240px] truncate text-xs text-slate-300">{report.reason}</p>
                {report.details ? (
                  <p className="mt-0.5 max-w-[240px] truncate text-[10px] text-slate-500">{report.details}</p>
                ) : null}
              </td>
              <td className={tdClass}>
                <StatusBadge status={report.status} map={REPORT_STATUS} />
                {report.resolutionNote ? (
                  <p className="mt-1 max-w-[180px] truncate text-[10px] text-slate-500">{report.resolutionNote}</p>
                ) : null}
              </td>
              <td className={tdClass}>
                <span className="text-[11px] text-slate-400">{timeAgo(report.createdAt)}</span>
              </td>
              <td className={`${tdClass} text-right`}>
                <Button variant="secondary" size="sm" icon={ShieldAlert} onClick={() => openEditor(report)}>
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </TableState>
        <tfoot>
          <tr>
            <td colSpan={6} className="p-0">
              <TableFooter
                total={listing.total}
                page={listing.page}
                pages={listing.pages}
                label="reports"
                onChange={(page) => listing.update({ page }, { resetPage: false })}
              />
            </td>
          </tr>
        </tfoot>
      </TableShell>

      <Modal
        open={Boolean(selected)}
        onClose={closeEditor}
        title="Review report"
        description={selected ? `${humanize(selected.targetType)} · reported ${formatDate(selected.createdAt)}` : ""}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeEditor} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={save} loading={busy}>
              Save decision
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={TARGET_TONES[selected.targetType] || "slate"}>
                  {humanize(selected.targetType)}
                </Badge>
                <StatusBadge status={selected.status} map={REPORT_STATUS} />
              </div>
              {selected.targetPreview?.link ? (
                <Link
                  to={selected.targetPreview.link}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200"
                >
                  {selected.targetPreview.label} <ArrowUpRight size={11} />
                </Link>
              ) : (
                <p className="mt-3 text-xs text-slate-300">
                  {selected.targetPreview?.label || "The reported target is no longer available."}
                </p>
              )}
              <div className="mt-3 border-t border-white/8 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-600">Reason</p>
                <p className="mt-1 text-xs text-slate-300">{selected.reason}</p>
                {selected.details ? (
                  <>
                    <p className="mt-3 text-[10px] uppercase tracking-wider text-slate-600">Details</p>
                    <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-400">{selected.details}</p>
                  </>
                ) : null}
              </div>
              <p className="mt-3 border-t border-white/8 pt-3 text-[10px] text-slate-500">
                Reported by {selected.reporter?.name || "community member"}
                {selected.reporter?.email ? ` · ${selected.reporter.email}` : ""}
              </p>
            </div>

            <Field label="Decision" htmlFor="report-status" hint="The reporter receives a notification when you save.">
              <Select id="report-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </Select>
            </Field>

            <Field
              label="Resolution note"
              htmlFor="report-note"
              hint="Internal record of the outcome. Keep it factual and specific."
            >
              <TextArea
                id="report-note"
                rows={3}
                maxLength={1000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What action was taken, or why was the report dismissed?"
              />
            </Field>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
