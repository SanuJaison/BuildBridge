import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Clock3, Mail, MapPin, MessageSquare, Phone, Send, ShieldCheck } from "lucide-react";
import api, { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useBranding } from "../../contexts/BrandingContext";
import { useToast } from "../../contexts/ToastContext";
import PageHero from "../../components/public/PageHero";
import Accordion from "../../components/public/Accordion";
import Button, { buttonClass } from "../../components/ui/Button";
import { Field, FormError, Input, TextArea } from "../../components/ui/Form";

const TOPICS = [
  "General question",
  "Account or access issue",
  "Trust and safety concern",
  "Report a profile or review",
  "Partnership or press",
  "Product feedback",
];

const FAQS = [
  {
    question: "How quickly will I hear back?",
    answer:
      "This is a demo build, so response times are not guaranteed. Messages are stored and routed to platform administrators through the same notification system used by the rest of the marketplace.",
  },
  {
    question: "I need to report a specific profile or message. Where do I go?",
    answer:
      "Use the report action on the profile, service, project, review, or message. Reports reach administrators with the exact target attached. If the report action is not available, use this form and include a link.",
  },
  {
    question: "Can support help me with a payment or refund?",
    answer:
      "No. BuildBridge does not process payments or hold funds in this build. Pricing and proposals are informational records. Any payment arrangement happens outside the platform and is not protected by it.",
  },
];

const INITIAL = { name: "", email: "", subject: TOPICS[0], message: "" };

export default function Contact() {
  usePageTitle("Contact BuildBridge");
  const { user } = useAuth();
  const { branding } = useBranding();
  const toast = useToast();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  const change = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (!form.subject.trim()) next.subject = "Choose or write a subject";
    if (form.message.trim().length < 20) next.message = "Write at least 20 characters so we can help properly";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validate()) return;
    setSending(true);
    try {
      await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm(INITIAL);
      toast.success("Message sent", "It has been queued for the platform team.");
    } catch (submitError) {
      const fieldErrors = getFieldErrors(submitError);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      setError(getApiMessage(submitError, "Your message could not be sent. Please try again."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHero
        compact
        eyebrow="Contact"
        title={
          <>
            Talk to the <span className="serif-accent text-gradient">team.</span>
          </>
        }
        description="Questions about the platform, a trust concern, or feedback on the demo? Send a message and it will be recorded for the platform administrators."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            {sent ? (
              <div className="surface rounded-2xl p-7 text-center sm:p-10">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-mint-400/25 bg-mint-400/10 text-mint-300">
                  <CheckCircle2 size={26} />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-white">Message received</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                  Your message has been stored and the platform administrators have been notified. This is a demo build,
                  so treat turnaround as best-effort rather than a service-level commitment.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
                  <button type="button" onClick={() => setSent(false)} className={buttonClass("primary", "md")}>
                    Send another message
                  </button>
                  <Link to="/trust" className={buttonClass("secondary", "md")}>
                    Trust & safety
                  </Link>
                </div>
              </div>
            ) : (
              <div className="surface rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-300/20 bg-brand-500/10 text-brand-200">
                    <MessageSquare size={17} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">Send a message</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      For account-specific issues, use the email address on your account so the team can find your record.
                    </p>
                  </div>
                </div>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  {error ? <FormError>{error}</FormError> : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Your name" htmlFor="contact-name" required error={errors.name}>
                      <Input
                        id="contact-name"
                        value={form.name}
                        onChange={change("name")}
                        autoComplete="name"
                        maxLength={100}
                        invalid={Boolean(errors.name)}
                        placeholder="Ayana Rao"
                      />
                    </Field>
                    <Field label="Email address" htmlFor="contact-email" required error={errors.email}>
                      <Input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={change("email")}
                        autoComplete="email"
                        maxLength={160}
                        invalid={Boolean(errors.email)}
                        placeholder="you@company.com"
                      />
                    </Field>
                  </div>

                  <Field label="Subject" htmlFor="contact-subject" required error={errors.subject}>
                    <div className="relative">
                      <input
                        id="contact-subject"
                        list="contact-topics"
                        value={form.subject}
                        onChange={change("subject")}
                        maxLength={160}
                        className={`input-base ${errors.subject ? "input-error" : ""}`}
                        placeholder="What is this about?"
                      />
                      <datalist id="contact-topics">
                        {TOPICS.map((topic) => (
                          <option key={topic} value={topic} />
                        ))}
                      </datalist>
                    </div>
                  </Field>

                  <Field
                    label="Message"
                    htmlFor="contact-message"
                    required
                    error={errors.message}
                    hint={`${form.message.length}/3000 characters. Do not include passwords or payment details.`}
                  >
                    <TextArea
                      id="contact-message"
                      rows={7}
                      value={form.message}
                      onChange={change("message")}
                      maxLength={3000}
                      invalid={Boolean(errors.message)}
                      placeholder="Share the context, what you have already tried, and what a good outcome would look like."
                    />
                  </Field>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                    <p className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <ShieldCheck size={12} className="text-mint-400" />
                      Messages are visible only to platform administrators.
                    </p>
                    <Button type="submit" loading={sending} icon={Send}>
                      Send message
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-sm font-semibold text-white">Before you write in</h2>
              <div className="mt-3">
                <Accordion items={FAQS} />
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="gradient-border rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-300">Direct channels</p>
              <div className="mt-4 space-y-3.5">
                {branding.supportEmail ? (
                  <a href={`mailto:${branding.supportEmail}`} className="flex items-start gap-2.5 text-xs text-slate-300 transition hover:text-white">
                    <Mail size={15} className="mt-0.5 shrink-0 text-brand-300" />
                    <span>
                      <span className="block text-[10px] text-slate-500">Email</span>
                      {branding.supportEmail}
                    </span>
                  </a>
                ) : null}
                {branding.supportPhone ? (
                  <a href={`tel:${branding.supportPhone}`} className="flex items-start gap-2.5 text-xs text-slate-300 transition hover:text-white">
                    <Phone size={15} className="mt-0.5 shrink-0 text-brand-300" />
                    <span>
                      <span className="block text-[10px] text-slate-500">Phone</span>
                      {branding.supportPhone}
                    </span>
                  </a>
                ) : null}
                {branding.location ? (
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-brand-300" />
                    <span>
                      <span className="block text-[10px] text-slate-500">Where we work</span>
                      {branding.location}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Clock3 size={15} className="mt-0.5 shrink-0 text-brand-300" />
                  <span>
                    <span className="block text-[10px] text-slate-500">Response expectation</span>
                    Best-effort in this demo build
                  </span>
                </div>
              </div>
            </div>

            <div className="surface rounded-2xl p-5">
              <p className="text-xs font-semibold text-white">Reporting something urgent</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Use the report control on the specific profile, service, project, review, or message so moderators receive
                the exact target and context. For immediate danger, contact local authorities first.
              </p>
              <div className="mt-4 space-y-2">
                <Link to="/trust#reporting" className={buttonClass("secondary", "sm", "w-full")}>
                  How reporting works
                </Link>
                <Link to="/trust#guidelines" className={buttonClass("ghost", "sm", "w-full")}>
                  Community guidelines
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3 text-[10px] leading-relaxed text-amber-200/70">
              <span className="font-semibold text-amber-200">Demo notice.</span> Marketplace profiles, reviews, and
              activity are fictional seed data. BuildBridge does not process payments in this build.
            </div>

            <Link to="/how-it-works" className="inline-flex items-center gap-1 px-1 text-[11px] text-brand-300 hover:text-brand-200">
              New here? See how BuildBridge works <ArrowUpRight size={11} />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
