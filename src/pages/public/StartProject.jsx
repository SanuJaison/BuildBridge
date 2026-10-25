import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  FileSignature,
  LockKeyhole,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import api, { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { AvailabilityBadge, Rating } from "../../components/ui/Badge";
import Button, { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { AttachmentUploader } from "../../components/ui/Uploader";
import { Field, FormError, Input, Select, TextArea } from "../../components/ui/Form";
import CategoryIcon from "../../components/public/CategoryIcon";
import { PROVIDER_TYPE_LABELS, money } from "../../lib/format";

const STEP_META = [
  { icon: Users, title: "Choose a specialist", copy: "Start from a profile you already like, or search the directory." },
  { icon: FileSignature, title: "Write the brief", copy: "Goals, scope, budget range, and timing. Clear beats clever." },
  { icon: MessageSquare, title: "Talk it through", copy: "A private conversation opens with the provider automatically." },
];

const TIMELINES = ["Flexible", "Within 2 weeks", "2–4 weeks", "1–2 months", "2–3 months", "3+ months", "Not sure yet"];

const COMMUNICATION = [
  { value: "in_app", label: "In-app messages" },
  { value: "email", label: "Email" },
  { value: "video_call", label: "Video call" },
  { value: "phone", label: "Phone" },
];

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "",
  subcategory: "",
  serviceId: "",
  features: "",
  budgetMin: "",
  budgetMax: "",
  timeline: "",
  communicationPreference: "in_app",
};

export default function StartProject() {
  usePageTitle("Start a project brief");
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const providerSlug = searchParams.get("provider") || "";
  const serviceSlug = searchParams.get("service") || "";

  const [categories, setCategories] = useState([]);
  const [providerState, setProviderState] = useState({ loading: false, error: "", notFound: false, data: null });
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerCategory, setPickerCategory] = useState("");
  const [pickerState, setPickerState] = useState({ loading: true, items: [] });
  const debouncedPickerQuery = useDebouncedValue(pickerQuery, 300);

  const [form, setForm] = useState(INITIAL_FORM);
  const [links, setLinks] = useState([""]);
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.tree || []))
      .catch(() => {});
  }, []);

  const loadProvider = useCallback(async () => {
    if (!providerSlug) {
      setProviderState({ loading: false, error: "", notFound: false, data: null });
      return;
    }
    setProviderState({ loading: true, error: "", notFound: false, data: null });
    try {
      const { data } = await api.get(`/providers/${providerSlug}`);
      setProviderState({ loading: false, error: "", notFound: false, data });
    } catch (error) {
      setProviderState({
        loading: false,
        error: getApiMessage(error, "This provider could not be loaded."),
        notFound: error?.response?.status === 404,
        data: null,
      });
    }
  }, [providerSlug]);

  useEffect(() => {
    loadProvider();
  }, [loadProvider]);

  useEffect(() => {
    if (!providerState.data) return;
    const services = providerState.data.services || [];
    const match = services.find((service) => service.slug === serviceSlug);
    setForm((current) => ({ ...current, serviceId: match ? match._id : "" }));
  }, [providerState.data, serviceSlug]);

  useEffect(() => {
    if (providerSlug) return undefined;
    let active = true;
    setPickerState((current) => ({ ...current, loading: true }));
    const params = new URLSearchParams({ sort: "rating", limit: "6" });
    if (debouncedPickerQuery.trim()) params.set("q", debouncedPickerQuery.trim());
    if (pickerCategory) params.set("category", pickerCategory);
    api
      .get(`/providers?${params.toString()}`)
      .then(({ data }) => {
        if (active) setPickerState({ loading: false, items: data.items || [] });
      })
      .catch(() => {
        if (active) setPickerState({ loading: false, items: [] });
      });
    return () => {
      active = false;
    };
  }, [providerSlug, debouncedPickerQuery, pickerCategory]);

  const provider = providerState.data?.provider;
  const services = useMemo(() => providerState.data?.services || [], [providerState.data]);
  const isOwnProfile = Boolean(provider && user && String(provider.user) === String(user._id));

  const selectedService = useMemo(
    () => services.find((service) => service._id === form.serviceId) || null,
    [services, form.serviceId]
  );

  const selectedCategory = categories.find((category) => category.id === form.category);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const chooseProvider = (slug) => {
    setSearchParams({ provider: slug });
    setSent(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearProvider = () => {
    setSearchParams({});
    setForm(INITIAL_FORM);
    setLinks([""]);
    setAttachments([]);
    setErrors({});
    setSent(null);
  };

  const loginHref = `/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`;
  const registerHref = `/register?role=customer&next=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 5) next.title = "Give your project a clear title (at least 5 characters)";
    if (form.description.trim().length < 30) next.description = "Describe the project in at least 30 characters";
    if (!form.category) next.category = "Choose a top-level category";
    const min = form.budgetMin === "" ? null : Number(form.budgetMin);
    const max = form.budgetMax === "" ? null : Number(form.budgetMax);
    if (form.budgetMin !== "" && (!Number.isFinite(min) || min < 0)) next.budgetMin = "Enter a valid minimum budget";
    if (form.budgetMax !== "" && (!Number.isFinite(max) || max < 0)) next.budgetMax = "Enter a valid maximum budget";
    if (min !== null && max !== null && max < min) next.budgetMax = "Maximum budget must be at least the minimum";
    links.forEach((link, index) => {
      if (!link.trim()) return;
      try {
        const url = new URL(link.trim());
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("protocol");
      } catch {
        next[`link-${index}`] = "Enter a full http(s) URL";
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (isOwnProfile) return;
    if (!validate()) {
      toast.warning("Check the highlighted fields", "A few details are missing before this brief can be sent.");
      return;
    }
    setSending(true);
    try {
      const payload = {
        providerId: provider._id,
        serviceId: form.serviceId || "",
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        subcategory: form.subcategory || "",
        features: form.features.trim(),
        budgetMin: form.budgetMin === "" ? null : Number(form.budgetMin),
        budgetMax: form.budgetMax === "" ? null : Number(form.budgetMax),
        timeline: form.timeline,
        referenceLinks: links.map((link) => link.trim()).filter(Boolean),
        attachments: attachments.map((file) => ({ uploadId: file.uploadId, name: file.name })),
        communicationPreference: form.communicationPreference,
      };
      const { data } = await api.post("/inquiries", payload);
      setSent({ inquiry: data.inquiry, conversationId: data.conversationId });
      toast.success("Inquiry sent", "A private conversation has been opened with the provider.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      setSubmitError(getApiMessage(error, "The inquiry could not be sent. Please try again."));
    } finally {
      setSending(false);
    }
  };

  if (providerState.loading) {
    return (
      <div className="container-page pt-32">
        <LoadingBlock label="Preparing your brief" />
      </div>
    );
  }

  if (providerSlug && (providerState.error || !provider)) {
    return (
      <div className="container-page pb-16 pt-32">
        <ErrorState
          title={providerState.notFound ? "This provider is not available" : "We couldn't load this provider"}
          message={
            providerState.notFound
              ? "They may be unpublished or suspended. Choose another specialist to begin your brief."
              : providerState.error
          }
          onRetry={providerState.notFound ? undefined : loadProvider}
        />
        <div className="mt-5 text-center">
          <Button variant="secondary" onClick={clearProvider}>
            <ArrowLeft size={14} />
            Choose another provider
          </Button>
        </div>
      </div>
    );
  }

  if (!providerSlug) {
    return (
      <div>
        <section className="relative overflow-hidden border-b border-white/[0.06] pb-14 pt-32 sm:pt-36">
          <div className="pointer-events-none absolute inset-0">
            <div className="hero-grid absolute inset-0 opacity-70" />
            <div className="absolute -top-32 left-1/4 h-80 w-[560px] rounded-full bg-violet-600/12 blur-[120px]" />
          </div>
          <div className="container-page relative">
            <p className="eyebrow">Start a project</p>
            <h1 className="mt-3 max-w-3xl text-balance text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white">
              Tell us what you need built. We&apos;ll help you find the{" "}
              <span className="serif-accent text-gradient">right fit.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
              First choose a specialist to receive your brief. You can start from a profile you found, or pick from the
              directory below. Sending an inquiry is free and opens a private conversation.
            </p>

            <div className="mt-8 grid gap-2 sm:grid-cols-3">
              {STEP_META.map(({ icon: Icon, title, copy }, index) => (
                <div key={title} className="flex gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand-200">
                    <Icon size={14} />
                  </span>
                  <div>
                    <p className="text-[10px] text-slate-600">0{index + 1}</p>
                    <p className="text-[11px] font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container-page py-10 lg:py-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-md">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                value={pickerQuery}
                onChange={(event) => setPickerQuery(event.target.value)}
                placeholder="Search by name, skill, or category"
                aria-label="Search providers"
                className="pl-10"
              />
            </div>
            <Select
              value={pickerCategory}
              onChange={(event) => setPickerCategory(event.target.value)}
              className="w-full py-2.5 text-xs sm:max-w-[220px]"
              aria-label="Filter providers by category"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-7">
            {pickerState.loading ? <LoadingBlock label="Finding specialists" /> : null}
            {!pickerState.loading && pickerState.items.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pickerState.items.map((item) => (
                  <article key={item._id} className="surface surface-hover flex flex-col rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <Avatar src={item.avatar} name={item.displayName} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="truncate text-sm font-semibold text-white">{item.displayName}</p>
                          {item.verified ? <BadgeCheck size={12} className="shrink-0 text-sky-300" /> : null}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {PROVIDER_TYPE_LABELS[item.type] || item.type}
                          {item.primaryCategory ? ` · ${item.primaryCategory.name}` : ""}
                        </p>
                        <div className="mt-1">
                          <Rating value={item.ratingAvg} count={item.ratingCount} size={10} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-[32px] text-[11px] leading-relaxed text-slate-400">
                      {item.headline || "Digital specialist"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(item.skills || []).slice(0, 2).map((skill) => (
                        <span key={skill} className="chip px-1.5 py-0.5 text-[9px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-3">
                      <span className="text-[10px] text-slate-500">
                        {item.startingBudget ? `From ${money(item.startingBudget, item.currency)}` : "Scope-based"}
                      </span>
                      <button
                        type="button"
                        onClick={() => chooseProvider(item.slug)}
                        className={buttonClass("primary", "sm")}
                      >
                        Choose <ArrowRight size={11} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
            {!pickerState.loading && !pickerState.items.length ? (
              <EmptyState
                icon={Search}
                title="No specialists match that search"
                description="Try a broader term or choose a different category. You can also browse the full directory."
                action={
                  <Link to="/providers" className={buttonClass("secondary", "sm")}>
                    Browse all talent
                  </Link>
                }
              />
            ) : null}
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <LockKeyhole size={16} className="mt-0.5 shrink-0 text-mint-400" />
              <div>
                <p className="text-xs font-semibold text-white">Your brief stays private</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Only the provider, authorized members of their workspace, and moderators can access inquiry details.
                  Attachments are served through access-checked endpoints.
                </p>
              </div>
            </div>
            <Link to="/trust" className="shrink-0 text-[11px] text-brand-300 hover:text-brand-200">
              Privacy details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="container-page pb-20 pt-32">
        <div className="mx-auto max-w-2xl">
          <div className="surface rounded-2xl p-7 text-center sm:p-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-mint-400/25 bg-mint-400/10 text-mint-300">
              <CheckCircle2 size={30} />
            </span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-mint-300">Inquiry sent</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your brief is with {provider.displayName}.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              A private conversation has been opened. The provider can review your brief, start a discussion, and send a
              proposal with scope and timing. You will be notified when the status changes.
            </p>

            <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Brief</p>
              <p className="mt-1 text-sm font-medium text-white">{sent.inquiry?.title}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{sent.inquiry?.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 border-t border-white/[0.07] pt-3 text-[10px] text-slate-500">
                <span>Status: New</span>
                <span>Inquiry ID: {String(sent.inquiry?.id || sent.inquiry?._id || "").slice(-6)}</span>
                {form.timeline ? <span>Timeline: {form.timeline}</span> : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  const inquiryId = sent.inquiry?.id || sent.inquiry?._id;
                  if (inquiryId) navigate(`/dashboard/inquiries/${inquiryId}`);
                  else navigate("/dashboard/inquiries");
                }}
                className={buttonClass("primary", "md")}
              >
                View inquiry
              </button>
              <Link to="/providers" className={buttonClass("secondary", "md")}>
                Explore more talent
              </Link>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-slate-600">
              No payment has been requested or processed. BuildBridge records the brief and conversation only.
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setSent(null);
                setForm(INITIAL_FORM);
                setLinks([""]);
                setAttachments([]);
                clearProvider();
              }}
              className="text-[11px] text-slate-500 underline underline-offset-2 hover:text-white"
            >
              Start another brief
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={clearProvider} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 transition hover:text-white">
            <ArrowLeft size={13} />
            Change provider
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <ShieldCheck size={12} className="text-mint-400" />
            No payment is processed on BuildBridge
          </div>
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <div className="min-w-0">
            <p className="eyebrow">Project brief</p>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Tell {provider.displayName.split(" ")[0]} what you have in mind.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              The more concrete the brief, the easier it is to respond with a useful proposal. You can refine details in
              the conversation after sending.
            </p>

            {!isAuthenticated ? (
              <div className="mt-8 rounded-2xl border border-brand-300/20 bg-brand-500/[0.05] p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-300/20 bg-brand-500/10 text-brand-200">
                    <LockKeyhole size={17} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Sign in to send this brief</h2>
                    <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-slate-400">
                      Inquiries are tied to an account so the conversation, files, and status changes stay private and
                      traceable. Choose a customer account, or sign in if you already have one.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <Link to={loginHref} className={buttonClass("primary", "md")}>
                        Sign in to continue
                      </Link>
                      <Link to={registerHref} className={buttonClass("secondary", "md")}>
                        Create a customer account
                      </Link>
                    </div>
                    <p className="mt-3 text-[10px] text-slate-500">
                      After signing in, you will return to this exact brief page with {provider.displayName} selected.
                    </p>
                  </div>
                </div>
              </div>
            ) : isOwnProfile ? (
              <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-6">
                <p className="text-sm font-semibold text-amber-100">This is your own provider profile</p>
                <p className="mt-1.5 text-xs leading-relaxed text-amber-100/60">
                  You cannot send an inquiry to yourself. Use the provider dashboard to manage incoming inquiries.
                </p>
                <Link to="/dashboard/provider" className={buttonClass("secondary", "sm", "mt-4")}>
                  Open provider dashboard
                </Link>
              </div>
            ) : user?.role !== "customer" ? (
              <div className="mt-8 rounded-2xl border border-brand-300/20 bg-brand-500/[0.05] p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-300/20 bg-brand-500/10 text-brand-200">
                    <Users size={17} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Briefs are sent from customer accounts</h2>
                    <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-slate-400">
                      You are signed in with a {user?.role === "admin" ? "platform administrator" : "provider"} account.
                      Provider workspaces manage incoming inquiries. To commission work, sign in with a customer account,
                      or create one for your buying side.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <Link
                        to={user?.role === "admin" ? "/admin" : "/dashboard/provider"}
                        className={buttonClass("secondary", "md")}
                      >
                        {user?.role === "admin" ? "Open admin dashboard" : "Open provider workspace"}
                      </Link>
                      <Link to="/register?role=customer" className={buttonClass("ghost", "md")}>
                        Create a customer account
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 space-y-6">
                {submitError ? <FormError>{submitError}</FormError> : null}

                <section className="surface rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg italic text-brand-300">01</span>
                    <h2 className="text-sm font-semibold text-white">The basics</h2>
                  </div>
                  <div className="mt-5 space-y-4">
                    <Field
                      label="Project title"
                      htmlFor="brief-title"
                      required
                      error={errors.title}
                      hint={`${form.title.length}/160 characters. A specific title helps the provider scan the request.`}
                    >
                      <Input
                        id="brief-title"
                        value={form.title}
                        onChange={(event) => update("title", event.target.value)}
                        maxLength={160}
                        invalid={Boolean(errors.title)}
                        placeholder="e.g. Build a booking flow for our boutique hotel site"
                      />
                    </Field>

                    <Field
                      label="What are you trying to achieve?"
                      htmlFor="brief-description"
                      required
                      error={errors.description}
                      hint={`${form.description.length}/6000 characters. Include audience, context, and success criteria.`}
                    >
                      <TextArea
                        id="brief-description"
                        rows={7}
                        value={form.description}
                        onChange={(event) => update("description", event.target.value)}
                        maxLength={6000}
                        invalid={Boolean(errors.description)}
                        placeholder="We are a small hotel group with a WordPress site. Bookings are handled by phone and we lose reservations after hours. We want a clear online booking flow integrated with our existing channel manager…"
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Category" htmlFor="brief-category" required error={errors.category}>
                        <Select
                          id="brief-category"
                          value={form.category}
                          onChange={(event) => {
                            update("category", event.target.value);
                            update("subcategory", "");
                          }}
                          invalid={Boolean(errors.category)}
                        >
                          <option value="">Choose a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Subcategory" htmlFor="brief-subcategory" hint="Optional, but helps route the brief.">
                        <Select
                          id="brief-subcategory"
                          value={form.subcategory}
                          onChange={(event) => update("subcategory", event.target.value)}
                          disabled={!selectedCategory}
                        >
                          <option value="">{selectedCategory ? "Choose if relevant" : "Choose a category first"}</option>
                          {(selectedCategory?.children || []).map((child) => (
                            <option key={child.id} value={child.id}>
                              {child.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                  </div>
                </section>

                <section className="surface rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg italic text-brand-300">02</span>
                    <h2 className="text-sm font-semibold text-white">Scope and budget</h2>
                  </div>
                  <div className="mt-5 space-y-4">
                    {services.length ? (
                      <Field label="Start from a service" htmlFor="brief-service" hint="Optional. Selecting a package preloads the provider's starting scope.">
                        <Select
                          id="brief-service"
                          value={form.serviceId}
                          onChange={(event) => update("serviceId", event.target.value)}
                        >
                          <option value="">No specific package — discuss scope</option>
                          {services.map((service) => (
                            <option key={service._id} value={service._id}>
                              {service.title}
                              {service.startingPrice ? ` · from ${money(service.startingPrice, service.currency)}` : ""}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    ) : null}

                    <Field
                      label="Features, deliverables, or must-haves"
                      htmlFor="brief-features"
                      hint="Optional. A simple list is fine."
                    >
                      <TextArea
                        id="brief-features"
                        rows={4}
                        value={form.features}
                        onChange={(event) => update("features", event.target.value)}
                        maxLength={3000}
                        placeholder="Real-time availability, Stripe-free payment handoff, mobile-friendly, integration with our existing channel manager…"
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Budget minimum" htmlFor="brief-budget-min" error={errors.budgetMin} hint="USD. Leave blank if open.">
                        <Input
                          id="brief-budget-min"
                          type="number"
                          min="0"
                          step="100"
                          value={form.budgetMin}
                          onChange={(event) => update("budgetMin", event.target.value)}
                          invalid={Boolean(errors.budgetMin)}
                          placeholder="3000"
                        />
                      </Field>
                      <Field label="Budget maximum" htmlFor="brief-budget-max" error={errors.budgetMax} hint="USD. Honest ranges get better proposals.">
                        <Input
                          id="brief-budget-max"
                          type="number"
                          min="0"
                          step="100"
                          value={form.budgetMax}
                          onChange={(event) => update("budgetMax", event.target.value)}
                          invalid={Boolean(errors.budgetMax)}
                          placeholder="8000"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Ideal timeline" htmlFor="brief-timeline">
                        <Select
                          id="brief-timeline"
                          value={form.timeline}
                          onChange={(event) => update("timeline", event.target.value)}
                        >
                          <option value="">Not set</option>
                          {TIMELINES.map((timeline) => (
                            <option key={timeline} value={timeline}>
                              {timeline}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Preferred communication" htmlFor="brief-communication">
                        <Select
                          id="brief-communication"
                          value={form.communicationPreference}
                          onChange={(event) => update("communicationPreference", event.target.value)}
                        >
                          {COMMUNICATION.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                  </div>
                </section>

                <section className="surface rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg italic text-brand-300">03</span>
                    <h2 className="text-sm font-semibold text-white">References and files</h2>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                    Add links to references, an existing site, or a scope document. Attachments are private.
                  </p>

                  <div className="mt-5 space-y-2.5">
                    {links.map((link, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-1">
                          <Input
                            value={link}
                            onChange={(event) => {
                              const next = [...links];
                              next[index] = event.target.value;
                              setLinks(next);
                              setErrors((current) => ({ ...current, [`link-${index}`]: undefined }));
                            }}
                            placeholder="https://…"
                            aria-label={`Reference link ${index + 1}`}
                            invalid={Boolean(errors[`link-${index}`])}
                          />
                          {errors[`link-${index}`] ? (
                            <p className="mt-1 text-[11px] text-rose-400">{errors[`link-${index}`]}</p>
                          ) : null}
                        </div>
                        {links.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => setLinks(links.filter((_, itemIndex) => itemIndex !== index))}
                            className="mt-1 rounded-lg p-2.5 text-slate-500 transition hover:bg-white/5 hover:text-rose-300"
                            aria-label="Remove link"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {links.length < 5 ? (
                      <button
                        type="button"
                        onClick={() => setLinks([...links, ""])}
                        className="inline-flex items-center gap-1.5 text-[11px] text-brand-300 transition hover:text-brand-200"
                      >
                        <Plus size={12} />
                        Add another link
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <AttachmentUploader value={attachments} onChange={setAttachments} max={3} />
                  </div>
                </section>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] leading-relaxed text-slate-600">
                    By sending this brief you agree to the{" "}
                    <Link to="/terms" className="underline underline-offset-2 hover:text-slate-300">
                      terms of use
                    </Link>{" "}
                    and confirm the content is accurate.
                  </p>
                  <Button type="submit" loading={sending} size="lg" icon={Sparkles} className="shrink-0">
                    Send inquiry
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside>
            <div className="sticky top-24 space-y-4">
              <div className="surface rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Sending to</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar src={provider.avatar} name={provider.displayName} size="lg" />
                  <div className="min-w-0">
                    <Link to={`/providers/${provider.slug}`} className="flex items-center gap-1 text-sm font-semibold text-white hover:text-brand-200">
                      <span className="truncate">{provider.displayName}</span>
                      {provider.verified ? <BadgeCheck size={13} className="shrink-0 text-sky-300" /> : null}
                    </Link>
                    <p className="text-[10px] text-slate-500">
                      {PROVIDER_TYPE_LABELS[provider.type] || provider.type}
                      {provider.primaryCategory ? ` · ${provider.primaryCategory.name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-3.5 flex items-center justify-between">
                  <AvailabilityBadge value={provider.availability} />
                  <Rating value={provider.ratingAvg} count={provider.ratingCount} size={11} />
                </div>
                <p className="mt-3 line-clamp-3 text-[11px] leading-relaxed text-slate-400">{provider.headline}</p>

                <div className="mt-4 space-y-2 border-t border-white/[0.07] pt-4 text-[11px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Starting budget</span>
                    <span className="font-medium text-slate-200">
                      {provider.startingBudget ? money(provider.startingBudget, provider.currency) : "Scope-based"}
                    </span>
                  </div>
                  {selectedService ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Selected service</span>
                      <span className="max-w-[170px] truncate text-right font-medium text-slate-200">{selectedService.title}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Location</span>
                    <span className="max-w-[170px] truncate text-right font-medium text-slate-200">{provider.location || "Remote"}</span>
                  </div>
                </div>
                <Link to={`/providers/${provider.slug}`} className="mt-4 inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200">
                  Review profile first <ArrowUpRight size={11} />
                </Link>
              </div>

              <div className="surface rounded-2xl p-5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <LockKeyhole size={12} className="text-mint-400" />
                  What stays private
                </p>
                <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-400">
                  <li>• The brief and its attachments</li>
                  <li>• Your conversation and proposal details</li>
                  <li>• Your email and account information</li>
                </ul>
                <p className="mt-3 border-t border-white/[0.07] pt-3 text-[10px] leading-relaxed text-slate-600">
                  Administrators may access records for moderation. Public profiles never expose inquiry content.
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3 text-[10px] leading-relaxed text-amber-200/70">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-amber-200" />
                <span>
                  This is a demo marketplace. Provider profiles and ratings are fictional. Never send money or sensitive
                  personal information through the platform.
                </span>
              </div>

              {selectedCategory ? (
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[10px] text-slate-500">
                  <CategoryIcon name={selectedCategory.icon} size={14} className="text-brand-300" />
                  Routed to {selectedCategory.name}
                  {form.subcategory && selectedCategory.children.find((child) => child.id === form.subcategory)
                    ? ` · ${selectedCategory.children.find((child) => child.id === form.subcategory).name}`
                    : ""}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
