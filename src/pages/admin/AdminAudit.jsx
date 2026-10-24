import { ScrollText } from "lucide-react";
import useListing from "../../hooks/useListing";
import usePageTitle from "../../hooks/usePageTitle";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/Feedback";
import { PageHeader } from "../../components/dashboard/DashboardUI";
import {
  EmptyCell,
  TableFooter,
  TableShell,
  TableState,
  tdClass,
  thClass,
} from "../../components/admin/AdminBits";
import { formatDateTime, humanize } from "../../lib/format";

function actionLabel(action = "") {
  return humanize(String(action).replace(/\./g, " "));
}

export default function AdminAudit() {
  usePageTitle("Audit log");
  const listing = useListing("/admin/audit-logs", "The audit log could not be loaded.");

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Audit log"
        description="Every administrative change is recorded with the responsible administrator, target, and timestamp. Entries are append-only."
      />

      <TableShell minWidth={900}>
        <thead className="border-b border-white/8 bg-white/[0.02]">
          <tr>
            <th className={thClass}>Administrator</th>
            <th className={thClass}>Action</th>
            <th className={thClass}>Target</th>
            <th className={thClass}>Detail</th>
            <th className={thClass}>IP</th>
            <th className={thClass}>When</th>
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
              icon={ScrollText}
              title="No audit entries yet"
              description="Moderation and configuration changes will appear here automatically."
              className="border-0 py-4"
            />
          }
        >
          {listing.items.map((entry) => (
            <tr key={entry._id} className="border-t border-white/5">
              <td className={tdClass}>
                <div className="flex items-center gap-2.5">
                  <Avatar src={entry.admin?.avatar} name={entry.admin?.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs text-slate-200">{entry.admin?.name || "Administrator"}</p>
                    <p className="truncate text-[10px] text-slate-500">{entry.admin?.email || ""}</p>
                  </div>
                </div>
              </td>
              <td className={tdClass}>
                <span className="text-xs text-slate-300">{actionLabel(entry.action)}</span>
              </td>
              <td className={tdClass}>
                {entry.targetType ? (
                  <div className="flex flex-col gap-1">
                    <Badge tone="slate">{humanize(entry.targetType)}</Badge>
                    {entry.targetId ? (
                      <span className="max-w-[150px] truncate font-mono text-[9px] text-slate-600">{entry.targetId}</span>
                    ) : null}
                  </div>
                ) : (
                  <EmptyCell>—</EmptyCell>
                )}
              </td>
              <td className={tdClass}>
                <span className="line-clamp-2 max-w-[260px] text-[11px] leading-relaxed text-slate-400">
                  {entry.details || "—"}
                </span>
              </td>
              <td className={tdClass}>
                <span className="font-mono text-[10px] text-slate-600">{entry.ip || "—"}</span>
              </td>
              <td className={tdClass}>
                <span className="text-[11px] text-slate-400">{formatDateTime(entry.createdAt)}</span>
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
                label="entries"
                onChange={(page) => listing.update({ page }, { resetPage: false })}
              />
            </td>
          </tr>
        </tfoot>
      </TableShell>
    </div>
  );
}
