import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Handshake,
  MessageSquare,
  Paperclip,
  Pencil,
  Send,
  ShieldCheck,
  Star,
  Timer,
  Undo2,
  UserRound,
  XCircle,
} from "lucide-react";
import api, { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Rating, RatingInput, StatusBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/Modal";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { Field, FormError, Input, TagInput, TextArea } from "../../components/ui/Form";
import { PageHeader, Panel } from "../../components/dashboard/DashboardUI";
import {
  INQUIRY_STATUS,
  PROPOSAL_STATUS,
  PROVIDER_TYPE_LABELS,
  fileSize,
  formatDate,
  formatDateTime,
  humanize,
  money,
  timeAgo,
} from "../../lib/format";

const FLOW = ["new", "in_discussion", "proposal_sent", "accepted", "completed"];
const FLOW_LABELS = ["Brief sent", "In discussion", "Proposal", "Accepted", "Completed"];

const ACTION_CONFIG = {
  start_discussion: {
    title: "Open the discussion?",
    message: "This tells the customer you have read their brief and are ready to talk. You can send a proposal afterwards.",
    confirmLabel: "Start discussion",
    tone: "primary",
  },
  accept_proposal: {
    title: "Accept this proposal?",
    message:
      "This records an agreement in principle between you and the provider. BuildBridge does not process payments, so arrange delivery and payment directly.",
    confirmLabel: "Accept proposal",
    tone: "primary",
  },
  decline_proposal: {
    title: "Decline this proposal?",
    message: "The provider will be notified. The conversation remains available if you want to discuss alternatives.",
    confirmLabel: "Decline proposal",
    tone: "danger",
  },
  complete: {
    title: "Mark this engagement complete?",
    message:
      "This closes the engagement as completed and lets you publish one review. Only mark it complete when the work is finished.",
    confirmLabel: "Mark complete",
    tone: "primary",
  },
  withdraw_proposal: {
    title: "Withdraw your proposal?",
    message: "The proposal will be withdrawn and the inquiry returns to discussion. The customer will be notified.",
    confirmLabel: "Withdraw proposal",
    tone: "danger",
  },
  cancel: {
    title: "Cancel this inquiry?",
    message: "Both sides will be notified and the conversation will remain readable. A cancelled inquiry cannot be reopened.",
    confirmLabel: "Cancel inquiry",
    tone: "danger",
  },
};

function budgetLabel(inquiry) {
  if (inquiry.budgetMin == null && inquiry.budgetMax == null) return "Open to discussion";
  if (inquiry.budgetMin != null && inquiry.budgetMax != null) {
    return `${money(inquiry.budgetMin)} – ${money(inquiry.budgetMax)}`;
  }
  if (inquiry.budgetMin != null) return `From ${money(inquiry.budgetMin)}`;
  return `Up to ${money(inquiry.budgetMax)}`;
}

function proposalDefaults(proposal) {
  return proposal
    ? {
        message: proposal.message || "",
        estimatedCost: proposal.estimatedCost ?? "",
        currency: proposal.currency || "USD",
        timelineDays: proposal.timelineDays ?? "",
        deliverables: proposal.deliverables || [],
        assumptions: proposal.assumptions || "",
        validUntil: proposal.validUntil ? new Date(proposal.validUntil).toISOString().slice(0, 10) : "",
      }
    : {
        message: "",
        estimatedCost: "",
        currency: "USD",
        timelineDays: "",
        deliverables: [],
        assumptions: "",
        validUntil: "",
      };
}

export default function InquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { providerProfile } = useAuth();
  const toast = useToast();
  usePageTitle("Inquiry");

  const [state, setState] = useState({ loading: true, error: "", data: null });
  const [pendingAction, setPendingAction] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [conversationBusy, setConversationBusy] = useState(false);

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState(proposalDefaults(null));
  const [proposalErrors, setProposalErrors] = useState({});
  const [proposalError, setProposalError] = useState("");
  const [proposalBusy, setProposalBusy] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get(`/inquiries/${id}`);
      setState({ loading: false, error: "", data });
      return data;
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "This inquiry could not be loaded."), data: null });
      return null;
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const inquiry = state.data?.inquiry;
  const proposal = state.data?.proposal;
  const review = state.data?.review;
  const access = state.data?.access;
  const providerSide = access === "provider";

  const openConversation = async () => {
    setConversationBusy(true);
    try {
      if (state.data?.conversationId) {
        navigate(`/dashboard/messages/${state.data.conversationId}`);
        return;
      }
      const { data } = await api.post(`/inquiries/${id}/conversation`);
      navigate(`/dashboard/messages/${data.conversationId}`);
    } catch (error) {
      toast.error("Conversation unavailable", getApiMessage(error));
    } finally {
      setConversationBusy(false);
    }
  };

  const runAction = async () => {
    if (!pendingAction || !state.data) return;
    setActionBusy(true);
    try {
      let response;
      if (pendingAction === "start_discussion") {
        response = await api.patch(`/inquiries/${id}/status`, { status: "in_discussion" });
      } else if (pendingAction === "complete") {
        response = await api.patch(`/inquiries/${id}/status`, { status: "completed" });
      } else if (pendingAction === "cancel") {
        response = await api.patch(`/inquiries/${id}/status`, { status: "cancelled" });
      } else if (pendingAction === "accept_proposal") {
        response = await api.post(`/proposals/${proposal._id}/accept`);
      } else if (pendingAction === "decline_proposal") {
        response = await api.post(`/proposals/${proposal._id}/decline`);
      } else if (pendingAction === "withdraw_proposal") {
        response = await api.post(`/proposals/${proposal._id}/withdraw`);
      }
      toast.success("Inquiry updated", response?.data?.message || "The engagement record has been updated.");
      setPendingAction(null);
      setShowProposalForm(false);
      await load();
    } catch (error) {
      toast.error("Update failed", getApiMessage(error, "That action could not be completed."));
      setPendingAction(null);
    } finally {
      setActionBusy(false);
    }
  };

  const openProposalForm = () => {
    setProposalForm(proposalDefaults(proposal));
    setProposalErrors({});
    setProposalError("");
    setShowProposalForm(true);
  };

  const submitProposal = async (event) => {
    event.preventDefault();
    setProposalError("");
    const errors = {};
    if (proposalForm.message.trim().length < 20) errors.message = "Write at least 20 characters";
    if (proposalForm.estimatedCost === "" || Number(proposalForm.estimatedCost) < 0) {
      errors.estimatedCost = "Enter a valid estimated cost";
    }
    const days = Number(proposalForm.timelineDays);
    if (!Number.isInteger(days) || days < 1 || days > 730) errors.timelineDays = "Enter 1–730 days";
    setProposalErrors(errors);
    if (Object.keys(errors).length) return;

    const payload = {
      message: proposalForm.message.trim(),
      estimatedCost: Number(proposalForm.estimatedCost),
      currency: proposalForm.currency || "USD",
      timelineDays: days,
      deliverables: proposalForm.deliverables.map((item) => item.trim()).filter(Boolean),
      assumptions: proposalForm.assumptions.trim(),
      validUntil: proposalForm.validUntil || null,
    };

    setProposalBusy(true);
    try {
      const canUpdate = proposal && proposal.status === "sent";
      const { data } = canUpdate
        ? await api.put(`/proposals/${proposal._id}`, payload)
        : await api.post(`/inquiries/${id}/proposals`, payload);
      toast.success(canUpdate ? "Proposal updated" : "Proposal sent", data.message || "The customer has been notified.");
      setShowProposalForm(false);
      await load();
    } catch (error) {
      setProposalError(getApiMessage(error, "The proposal could not be saved."));
      setProposalErrors(getFieldErrors(error));
    } finally {
      setProposalBusy(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewError("");
    if (!reviewRating) {
      setReviewError("Choose a rating from 1 to 5 stars.");
      return;
    }
    if (reviewComment.trim().length < 10) {
      setReviewError("Write at least 10 characters about the engagement.");
      return;
    }
    setReviewBusy(true);
    try {
      await api.post("/reviews", {
        inquiryId: id,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      toast.success("Review published", "Thank you for sharing honest feedback.");
      setReviewRating(0);
      setReviewTitle("");
      setReviewComment("");
      await load();
    } catch (error) {
      setReviewError(getApiMessage(error, "The review could not be published."));
    } finally {
      setReviewBusy(false);
    }
  };

  if (state.loading) return <LoadingBlock label="Opening the inquiry" />;
  if (state.error) {
    return (
      <div>
        <PageHeader title="Inquiry" backTo="/dashboard/inquiries" backLabel="All inquiries" />
        <ErrorState message={state.error} onRetry={load} />
      </div>
    );
  }
  if (!inquiry) return null;

  const flowIndex = FLOW.indexOf(inquiry.status);
  const closed = ["declined", "cancelled"].includes(inquiry.status);

  const canStartDiscussion = providerSide && inquiry.status === "new";
  const canPropose =
    providerSide &&
    ["new", "in_discussion"].includes(inquiry.status) &&
    (!proposal || proposal.status === "withdrawn");
  const canEditProposal = providerSide && proposal?.status === "sent";
  const canRespond = access === "customer" && proposal?.status === "sent" && inquiry.status === "proposal_sent";
  const canComplete = access === "customer" && inquiry.status === "accepted";
  const canCancel = ["new", "in_discussion", "proposal_sent", "accepted"].includes(inquiry.status);
  const alreadyReviewed = Boolean(review);

  return (
    <div>
      <PageHeader
        eyebrow={`Inquiry #${String(inquiry.id || inquiry._id).slice(-6).toUpperCase()}`}
        title={inquiry.title}
        backTo="/dashboard/inquiries"
        backLabel="All inquiries"
        description={`Opened ${formatDate(inquiry.createdAt)} · Last activity ${timeAgo(inquiry.lastActivityAt)}`}
        actions={
          <>
            <StatusBadge status={inquiry.status} map={INQUIRY_STATUS} />
            <Button variant="secondary" icon={MessageSquare} loading={conversationBusy} onClick={openConversation}>
              Open conversation
            </Button>
          </>
        }
      />

      {closed ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-400/15 bg-rose-400/[0.04] px-4 py-3.5">
          <XCircle size={16} className="mt-0.5 shrink-0 text-rose-300" />
          <div>
            <p className="text-xs font-semibold text-rose-200">
              This inquiry was {inquiry.status === "declined" ? "declined" : "cancelled"}.
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              The record and conversation remain available for reference. Start a new inquiry if you would like to continue
              working together.
            </p>
          </div>
        </div>
      ) : (
        <div className="surface mb-5 overflow-x-auto rounded-2xl px-3 py-4 sm:px-5">
          <ol className="flex min-w-[560px] items-center">
            {FLOW.map((step, index) => {
              const complete = flowIndex >= index;
              const current = flowIndex === index;
              return (
                <li key={step} className="flex flex-1 items-center">
                  <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${
                        complete
                          ? "border-brand-400/35 bg-brand-500/20 text-brand-200"
                          : "border-white/10 bg-white/[0.02] text-slate-600"
                      } ${current ? "ring-4 ring-brand-500/10" : ""}`}
                    >
                      {complete && !current ? <CheckCircle2 size={13} /> : index + 1}
                    </span>
                    <span className={`whitespace-nowrap text-[10px] ${complete ? "text-slate-300" : "text-slate-600"}`}>
                      {FLOW_LABELS[index]}
                    </span>
                  </div>
                  {index < FLOW.length - 1 ? (
                    <span className={`mx-1 mb-5 h-px flex-1 ${flowIndex > index ? "bg-brand-400/40" : "bg-white/10"}`} />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <Panel title="Project brief">
            <p className="whitespace-pre-line text-[13px] leading-7 text-slate-300">{inquiry.description}</p>

            {inquiry.features ? (
              <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Key features</p>
                <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-300">{inquiry.features}</p>
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500">
                  <CircleDollarSign size={12} /> Budget
                </div>
                <p className="mt-1 text-sm font-medium text-white">{budgetLabel(inquiry)}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500">
                  <Timer size={12} /> Timeline
                </div>
                <p className="mt-1 text-sm font-medium text-white">{inquiry.timeline || "Open to discussion"}</p>
              </div>
            </div>

            {inquiry.referenceLinks?.length || inquiry.attachments?.length ? (
              <div className="mt-5 space-y-4">
                {inquiry.referenceLinks?.length ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Reference links</p>
                    <ul className="mt-2 space-y-1.5">
                      {inquiry.referenceLinks.map((link) => (
                        <li key={link}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-full items-center gap-1.5 text-xs text-brand-300 transition hover:text-brand-200"
                          >
                            <ExternalLink size={11} className="shrink-0" />
                            <span className="truncate">{link}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {inquiry.attachments?.length ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Private attachments</p>
                    <ul className="mt-2 space-y-2">
                      {inquiry.attachments.map((file, index) => {
                        const uploadId = file.upload?._id || file.upload;
                        return (
                          <li
                            key={`${uploadId}-${index}`}
                            className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2"
                          >
                            <FileText size={14} className="shrink-0 text-brand-300" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs text-slate-200">{file.name || "Attachment"}</p>
                              <p className="text-[10px] text-slate-500">{file.size ? fileSize(file.size) : "Private file"}</p>
                            </div>
                            {uploadId ? (
                              <a
                                href={`/api/uploads/${uploadId}/file`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
                                aria-label={`Download ${file.name || "attachment"}`}
                              >
                                <Download size={13} />
                              </a>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Panel>

          <Panel
            title="Proposal"
            description="Scope, price, and timeline recorded against this inquiry."
            action={<StatusBadge status={proposal?.status || "none"} map={{ ...PROPOSAL_STATUS, none: { label: "Not sent", tone: "slate" } }} />}
          >
            {showProposalForm && providerSide ? (
              <form onSubmit={submitProposal} className="space-y-4">
                {proposalError ? <FormError>{proposalError}</FormError> : null}
                <Field label="Proposal message" htmlFor="proposal-message" required error={proposalErrors.message}>
                  <TextArea
                    id="proposal-message"
                    rows={5}
                    value={proposalForm.message}
                    onChange={(event) => setProposalForm((current) => ({ ...current, message: event.target.value }))}
                    placeholder="Explain your approach, what you understood from the brief, and how you will deliver it…"
                    maxLength={4000}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Estimated cost" htmlFor="proposal-cost" required error={proposalErrors.estimatedCost}>
                    <Input
                      id="proposal-cost"
                      type="number"
                      min="0"
                      step="1"
                      value={proposalForm.estimatedCost}
                      onChange={(event) => setProposalForm((current) => ({ ...current, estimatedCost: event.target.value }))}
                      placeholder="5000"
                      invalid={Boolean(proposalErrors.estimatedCost)}
                    />
                  </Field>
                  <Field label="Currency" htmlFor="proposal-currency">
                    <select
                      id="proposal-currency"
                      className="input-base"
                      value={proposalForm.currency}
                      onChange={(event) => setProposalForm((current) => ({ ...current, currency: event.target.value }))}
                    >
                      {["USD", "EUR", "GBP", "CAD", "AUD", "INR"].map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Delivery days" htmlFor="proposal-days" required error={proposalErrors.timelineDays}>
                    <Input
                      id="proposal-days"
                      type="number"
                      min="1"
                      max="730"
                      value={proposalForm.timelineDays}
                      onChange={(event) => setProposalForm((current) => ({ ...current, timelineDays: event.target.value }))}
                      placeholder="30"
                      invalid={Boolean(proposalErrors.timelineDays)}
                    />
                  </Field>
                </div>
                <Field
                  label="Deliverables"
                  htmlFor="proposal-deliverables"
                  hint="Press Enter after each item. Keep each deliverable specific."
                >
                  <TagInput
                    id="proposal-deliverables"
                    value={proposalForm.deliverables}
                    onChange={(deliverables) => setProposalForm((current) => ({ ...current, deliverables }))}
                    placeholder="e.g. Responsive dashboard, API integration…"
                    max={20}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Assumptions" htmlFor="proposal-assumptions" hint="Optional. Note anything the customer must provide.">
                    <TextArea
                      id="proposal-assumptions"
                      rows={3}
                      value={proposalForm.assumptions}
                      onChange={(event) => setProposalForm((current) => ({ ...current, assumptions: event.target.value }))}
                      maxLength={2000}
                      placeholder="Brand assets, API access, feedback windows…"
                    />
                  </Field>
                  <Field label="Valid until" htmlFor="proposal-valid" hint="Optional. After this date the proposal stays visible but is stale.">
                    <Input
                      id="proposal-valid"
                      type="date"
                      value={proposalForm.validUntil}
                      onChange={(event) => setProposalForm((current) => ({ ...current, validUntil: event.target.value }))}
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
                  <p className="max-w-sm text-[10px] leading-relaxed text-slate-500">
                    Acceptance records an agreement in principle. No payment is processed by BuildBridge.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setShowProposalForm(false)} disabled={proposalBusy}>
                      Cancel
                    </Button>
                    <Button type="submit" icon={Send} loading={proposalBusy}>
                      {proposal?.status === "sent" ? "Update proposal" : "Send proposal"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : proposal ? (
              <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Estimated cost</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{money(proposal.estimatedCost, proposal.currency)}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Timer size={12} className="text-brand-300" />
                      {proposal.timelineDays} day delivery
                    </span>
                    {proposal.validUntil ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-brand-300" />
                        Valid until {formatDate(proposal.validUntil)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-[13px] leading-7 text-slate-300">{proposal.message}</p>

                {proposal.deliverables?.length ? (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Deliverables</p>
                    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {proposal.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-mint-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {proposal.assumptions ? (
                  <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Assumptions</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{proposal.assumptions}</p>
                  </div>
                ) : null}

                {proposal.status === "accepted" ? (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-mint-400/20 bg-mint-400/[0.05] px-3.5 py-3 text-[11px] leading-relaxed text-mint-200">
                    <Handshake size={14} className="mt-0.5 shrink-0" />
                    Proposal accepted. This is an agreement in principle only — BuildBridge does not process payments or generate contracts.
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                  {canEditProposal ? (
                    <>
                      <Button variant="secondary" size="sm" icon={Pencil} onClick={openProposalForm}>
                        Edit proposal
                      </Button>
                      <Button variant="danger" size="sm" icon={Undo2} onClick={() => setPendingAction("withdraw_proposal")}>
                        Withdraw
                      </Button>
                    </>
                  ) : null}
                  {canRespond ? (
                    <>
                      <Button size="sm" icon={Handshake} onClick={() => setPendingAction("accept_proposal")}>
                        Accept proposal
                      </Button>
                      <Button variant="danger" size="sm" icon={XCircle} onClick={() => setPendingAction("decline_proposal")}>
                        Decline
                      </Button>
                    </>
                  ) : null}
                  {canPropose ? (
                    <Button size="sm" icon={Send} onClick={openProposalForm}>
                      Send a new proposal
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No proposal yet"
                description={
                  providerSide
                    ? "A clear proposal gives the customer scope, price, and a delivery window to decide on."
                    : "The provider has not sent a proposal yet. Keep the conversation going if you need clarity."
                }
                className="border-0 py-8"
                action={
                  canPropose ? (
                    <Button icon={Send} size="sm" onClick={openProposalForm}>
                      Write a proposal
                    </Button>
                  ) : null
                }
              />
            )}
          </Panel>

          {alreadyReviewed ? (
            <Panel
              title={access === "customer" ? "Your review" : "Customer review"}
              description="Published after this engagement was completed."
            >
              <div className="flex items-start gap-3">
                <Avatar src={inquiry.customer?.avatar} name={inquiry.customer?.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-white">{inquiry.customer?.name}</p>
                    <Rating value={review.rating} size={11} showValue={false} />
                    <span className="text-[10px] text-slate-500">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.comment ? <p className="mt-2 text-xs leading-relaxed text-slate-300">{review.comment}</p> : null}
                </div>
              </div>
            </Panel>
          ) : state.data.canReview ? (
            <Panel title="Leave a review" description="This engagement is complete. Share what it was like to work with this provider.">
              <form onSubmit={submitReview} className="space-y-4">
                {reviewError ? <FormError>{reviewError}</FormError> : null}
                <div>
                  <span className="label-base">Rating</span>
                  <RatingInput value={reviewRating} onChange={setReviewRating} disabled={reviewBusy} />
                </div>
                <Field label="Review title" htmlFor="review-title" hint="Optional. A short headline for your experience.">
                  <Input
                    id="review-title"
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    maxLength={120}
                    placeholder="Clear communication and thoughtful delivery"
                  />
                </Field>
                <Field label="Your review" htmlFor="review-comment" required hint="Minimum 10 characters. Reviews are published publicly against the provider.">
                  <TextArea
                    id="review-comment"
                    rows={4}
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    maxLength={2000}
                    placeholder="What was the engagement like? What went well?"
                  />
                </Field>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] text-slate-500">Reviews cannot be edited after publishing.</p>
                  <Button type="submit" icon={Star} loading={reviewBusy}>
                    Publish review
                  </Button>
                </div>
              </form>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-5">
          <Panel title="People">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar src={inquiry.customer?.avatar} name={inquiry.customer?.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {inquiry.customer?.name} {access === "customer" ? <span className="text-[10px] font-normal text-brand-300">(you)</span> : null}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                    <UserRound size={10} /> Customer
                  </p>
                </div>
              </div>
              <div className="border-t border-white/8 pt-4">
                <div className="flex items-center gap-3">
                  <Avatar src={inquiry.provider?.avatar} name={inquiry.provider?.displayName} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">
                      {inquiry.provider?.displayName}{" "}
                      {providerSide ? <span className="text-[10px] font-normal text-brand-300">(you)</span> : null}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                      <Building2 size={10} /> {PROVIDER_TYPE_LABELS[inquiry.provider?.type] || "Provider"}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <Rating value={inquiry.provider?.ratingAvg} count={inquiry.provider?.ratingCount} />
                  <Link
                    to={`/providers/${inquiry.provider?.slug}`}
                    className="inline-flex items-center gap-1 text-[10px] text-brand-300 transition hover:text-brand-200"
                  >
                    View profile <ArrowUpRight size={10} />
                  </Link>
                </div>
              </div>
              {!providerSide ? (
                <p className="border-t border-white/8 pt-3 text-[10px] text-slate-500">
                  Need another channel? Use the in-app conversation so the record stays together.
                </p>
              ) : null}
            </div>
          </Panel>

          <Panel title="Engagement facts">
            <dl className="space-y-3 text-[11px]">
              {[
                {
                  icon: FileText,
                  label: "Category",
                  value: inquiry.category?.name + (inquiry.subcategory?.name ? ` · ${inquiry.subcategory.name}` : ""),
                },
                { icon: CalendarDays, label: "Opened", value: formatDate(inquiry.createdAt) },
                { icon: Clock3, label: "Last activity", value: formatDateTime(inquiry.lastActivityAt) },
                { icon: MessageSquare, label: "Preferred contact", value: humanize(inquiry.communicationPreference) },
                { icon: CircleDollarSign, label: "Budget", value: budgetLabel(inquiry) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon size={13} className="mt-0.5 shrink-0 text-brand-300" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="mt-0.5 break-words text-slate-300">{value || "—"}</dd>
                  </div>
                </div>
              ))}
              {inquiry.service?.title ? (
                <div className="flex items-start gap-2.5">
                  <Paperclip size={13} className="mt-0.5 shrink-0 text-brand-300" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-slate-500">Selected service</dt>
                    <dd className="mt-0.5">
                      <Link to={`/services/${inquiry.service.slug}`} className="text-brand-300 transition hover:text-brand-200">
                        {inquiry.service.title}
                      </Link>
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>
          </Panel>

          <Panel title="Actions">
            <div className="space-y-2">
              <button
                type="button"
                onClick={openConversation}
                disabled={conversationBusy}
                className="flex w-full items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-brand-400/25 hover:text-white disabled:opacity-50"
              >
                <MessageSquare size={14} className="text-brand-300" />
                {conversationBusy ? "Opening…" : "Open conversation"}
              </button>
              {canStartDiscussion ? (
                <button
                  type="button"
                  onClick={() => setPendingAction("start_discussion")}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-mint-400/25 hover:text-white"
                >
                  <CheckCircle2 size={14} className="text-mint-400" />
                  Start the discussion
                </button>
              ) : null}
              {canComplete ? (
                <button
                  type="button"
                  onClick={() => setPendingAction("complete")}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-mint-400/15 bg-mint-400/[0.04] px-3 py-2.5 text-left text-xs text-mint-200 transition hover:border-mint-400/30"
                >
                  <CheckCircle2 size={14} />
                  Mark engagement complete
                </button>
              ) : null}
              {canCancel ? (
                <button
                  type="button"
                  onClick={() => setPendingAction("cancel")}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-rose-400/10 px-3 py-2.5 text-left text-xs text-rose-300/80 transition hover:border-rose-400/25 hover:text-rose-200"
                >
                  <Ban size={14} />
                  Cancel inquiry
                </button>
              ) : null}
            </div>
          </Panel>

          {providerSide && providerProfile?.status !== "published" ? (
            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3.5">
              <p className="text-xs font-semibold text-amber-200">Your profile is in draft</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Publish your provider profile before sending proposals so customers can see who they are working with.
              </p>
              <Link
                to="/dashboard/provider/profile"
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-amber-200 transition hover:text-amber-100"
              >
                Finish your profile <ArrowUpRight size={11} />
              </Link>
            </div>
          ) : null}

          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <ShieldCheck size={13} className="text-mint-400" />
              Kept private
            </p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
              Only you, the other participant, and platform administrators can open this inquiry and its attachments.
              BuildBridge never processes payments in this demo.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={runAction}
        title={ACTION_CONFIG[pendingAction]?.title || "Confirm action"}
        message={ACTION_CONFIG[pendingAction]?.message || ""}
        confirmLabel={ACTION_CONFIG[pendingAction]?.confirmLabel || "Confirm"}
        tone={ACTION_CONFIG[pendingAction]?.tone === "primary" ? "primary" : "danger"}
        busy={actionBusy}
      />
    </div>
  );
}
