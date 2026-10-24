import { useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import useListing from "../../hooks/useListing";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../contexts/ToastContext";
import { StatusBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { Field, Select } from "../../components/ui/Form";
import Modal from "../../components/ui/Modal";
import { PageHeader } from "../../components/dashboard/DashboardUI";
import {
  TableFooter,
  TableShell,
  TableState,
  tdClass,
  thClass,
} from "../../components/admin/AdminBits";
import { formatDate, formatDateTime } from "../../lib/format";

const CONTACT_STATUS = {
  new: { label: "New", tone: "amber" },
  read: { label: "Read", tone: "blue" },
  resolved: { label: "Resolved", tone: "mint" },
};

export default function AdminMessages() {
  usePageTitle("Contact inbox");
  const toast = useToast();
  const listing = useListing("/admin/messages", "Contact messages could not be loaded.");
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("read");
  const [busy, setBusy] = useState(false);

  const openMessage = (message) => {
    setSelected(message);
    setStatus(message.status === "new" ? "read" : message.status);
  };

  const closeMessage = () => {
    if (busy) return;
    setSelected(null);
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await api.patch(`/admin/messages/${selected._id}`, { status });
      toast.success("Message updated", `Marked as ${status}.`);
      setSelected(null);
      listing.reload();
    } catch (error) {
      toast.error("Message not updated", getApiMessage(error, "Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Contact inbox"
        description="Messages submitted through the public contact form. Mark each message as read or resolved as you work through it."
        actions={
          <Select
            value={listing.searchParams.get("status") || ""}
            onChange={(event) => listing.update({ status: event.target.value })}
            aria-label="Filter contact messages by status"
            className="py-2 text-xs"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="resolved">Resolved</option>
          </Select>
        }
      />

      <TableShell minWidth={780}>
        <thead className="border-b border-white/8 bg-white/[0.02]">
          <tr>
            <th className={thClass}>From</th>
            <th className={thClass}>Subject</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Received</th>
            <th className={`${thClass} text-right`}>Action</th>
          </tr>
        </thead>
        <TableState
          colSpan={5}
          loading={listing.loading}
          error={listing.error}
          onRetry={listing.reload}
          empty={!listing.items.length}
          emptyContent={
            <EmptyState
              icon={Mail}
              title="No contact messages"
              description="Messages from the public contact form will appear here."
              className="border-0 py-4"
            />
          }
        >
          {listing.items.map((message) => (
            <tr key={message._id} className="border-t border-white/5 transition hover:bg-white/[0.02]">
              <td className={tdClass}>
                <p className="text-xs font-medium text-slate-200">{message.name}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{message.email}</p>
              </td>
              <td className={tdClass}>
                <p className="max-w-[320px] truncate text-xs text-slate-300">{message.subject}</p>
                <p className="mt-0.5 max-w-[320px] truncate text-[10px] text-slate-500">{message.message}</p>
              </td>
              <td className={tdClass}>
                <StatusBadge status={message.status} map={CONTACT_STATUS} />
              </td>
              <td className={tdClass}>
                <span className="text-[11px] text-slate-400">{formatDate(message.createdAt)}</span>
              </td>
              <td className={`${tdClass} text-right`}>
                <Button variant="secondary" size="sm" icon={MailOpen} onClick={() => openMessage(message)}>
                  Open
                </Button>
              </td>
            </tr>
          ))}
        </TableState>
        <tfoot>
          <tr>
            <td colSpan={5} className="p-0">
              <TableFooter
                total={listing.total}
                page={listing.page}
                pages={listing.pages}
                label="messages"
                onChange={(page) => listing.update({ page }, { resetPage: false })}
              />
            </td>
          </tr>
        </tfoot>
      </TableShell>

      <Modal
        open={Boolean(selected)}
        onClose={closeMessage}
        title={selected?.subject || "Contact message"}
        description={selected ? `From ${selected.name} · ${formatDateTime(selected.createdAt)}` : ""}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeMessage} disabled={busy}>
              Close
            </Button>
            <Button onClick={save} loading={busy}>
              Save status
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-200">{selected.name}</p>
                <a href={`mailto:${selected.email}`} className="text-[11px] text-brand-300 hover:text-brand-200">
                  {selected.email}
                </a>
              </div>
              <StatusBadge status={selected.status} map={CONTACT_STATUS} />
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">Message</p>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-300">{selected.message}</p>
            </div>

            <Field label="Status" htmlFor="contact-status" hint="Use resolved once the inquiry has been handled.">
              <Select id="contact-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                {Object.entries(CONTACT_STATUS).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </Field>

            <p className="text-[10px] leading-relaxed text-slate-600">
              BuildBridge does not send automated email replies from this console. Reply directly from your support mailbox.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
