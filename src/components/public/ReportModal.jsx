import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Flag } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, FormError, Select, TextArea } from "../ui/Form";

const REASONS = [
  "Misleading or false information",
  "Spam, scam, or impersonation",
  "Inappropriate or harmful content",
  "Intellectual property concern",
  "Something else",
];

export default function ReportModal({ targetType, targetId, label = "Report" }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/reports", { targetType, targetId, reason, details });
      toast.success("Report submitted", "An administrator will review it.");
      setOpen(false);
      setDetails("");
    } catch (submitError) {
      setError(getApiMessage(submitError, "The report could not be submitted."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-rose-300"
      >
        <Flag size={11} />
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Report this content"
        description="Reports go to platform administrators. Abuse of reporting may affect your account."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={submit} loading={loading}>
              Submit report
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          {error ? <FormError>{error}</FormError> : null}
          <Field label="Reason" htmlFor="report-reason" required>
            <Select id="report-reason" value={reason} onChange={(event) => setReason(event.target.value)}>
              {REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="What should we know?" htmlFor="report-details" hint="Optional. Do not include passwords or sensitive personal data.">
            <TextArea
              id="report-details"
              rows={4}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={2000}
              placeholder="Add useful context for the moderator…"
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
