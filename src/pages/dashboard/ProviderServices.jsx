import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Eye,
  Layers,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import api, { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import useCategories from "../../hooks/useCategories";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Artwork } from "../../components/ui/Avatar";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { Field, FormError, Input, Select, TagInput, TextArea } from "../../components/ui/Form";
import Modal, { ConfirmModal } from "../../components/ui/Modal";
import { ImageGalleryUploader } from "../../components/ui/Uploader";
import { PageHeader } from "../../components/dashboard/DashboardUI";
import { money } from "../../lib/format";

const SERVICE_STATUS = {
  draft: { label: "Draft", tone: "amber" },
  published: { label: "Published", tone: "mint" },
  paused: { label: "Paused", tone: "slate" },
  suspended: { label: "Suspended", tone: "red" },
};

function blankService() {
  return {
    title: "",
    description: "",
    category: "",
    subcategory: "",
    images: [],
    startingPrice: "",
    maxPrice: "",
    pricingType: "fixed",
    deliveryDays: 14,
    deliverables: [],
    requirements: [],
    tags: [],
    faqs: [],
    status: "draft",
  };
}

function formFromService(service) {
  return {
    title: service.title || "",
    description: service.description || "",
    category: service.category?.id || service.category?._id || service.category || "",
    subcategory: service.subcategory?.id || service.subcategory?._id || service.subcategory || "",
    images: service.images || [],
    startingPrice: service.startingPrice ?? "",
    maxPrice: service.maxPrice ?? "",
    pricingType: service.pricingType || "fixed",
    deliveryDays: service.deliveryDays ?? 14,
    deliverables: service.deliverables || [],
    requirements: service.requirements || [],
    tags: service.tags || [],
    faqs: (service.faqs || []).map((faq) => ({ question: faq.question, answer: faq.answer })),
    status: service.status === "suspended" ? "published" : service.status || "draft",
  };
}

function priceLabel(service) {
  if (service.pricingType === "custom") return "Custom quote";
  if (service.pricingType === "hourly") return `${money(service.startingPrice)}/hr`;
  if (!service.startingPrice) return "Contact for pricing";
  if (service.maxPrice && service.maxPrice > service.startingPrice) {
    return `${money(service.startingPrice)} – ${money(service.maxPrice)}`;
  }
  return `From ${money(service.startingPrice)}`;
}

export default function ProviderServices() {
  const { providerProfile } = useAuth();
  const { tree, loading: categoriesLoading, error: categoriesError } = useCategories();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankService);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState("");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/provider/services");
      setState({ loading: false, error: "", items: data.items || [] });
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "Your services could not be loaded."), items: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePageTitle("Services");

  const profilePublished = providerProfile?.status === "published";
  const categoryNode = useMemo(
    () => tree.find((category) => category.id === form.category),
    [tree, form.category]
  );
  const subcategoryOptions = categoryNode?.children || [];

  const patch = (updates) => {
    setForm((current) => ({ ...current, ...updates }));
    setFormError("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm(blankService());
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm(formFromService(service));
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const changeCategory = (value) => {
    setForm((current) => ({ ...current, category: value, subcategory: "" }));
    setFormError("");
  };

  const updateFaq = (index, updates) => {
    setForm((current) => ({
      ...current,
      faqs: current.faqs.map((faq, faqIndex) => (faqIndex === index ? { ...faq, ...updates } : faq)),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setFormError("");
    setFieldErrors({});

    const startingPrice = form.startingPrice === "" ? 0 : Number(form.startingPrice);
    const maxPrice = form.maxPrice === "" ? null : Number(form.maxPrice);
    if (maxPrice !== null && startingPrice > 0 && maxPrice < startingPrice) {
      setFormError("Maximum price cannot be lower than the starting price.");
      return;
    }
    if (form.status === "published" && !profilePublished) {
      setFormError("Publish your marketplace profile before publishing a service.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      subcategory: form.subcategory || "",
      images: form.images,
      startingPrice,
      maxPrice,
      pricingType: form.pricingType,
      deliveryDays: Number(form.deliveryDays) || 1,
      deliverables: form.deliverables,
      requirements: form.requirements,
      tags: form.tags,
      faqs: form.faqs
        .filter((faq) => faq.question.trim() || faq.answer.trim())
        .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() })),
      status: form.status,
    };

    setSaving(true);
    try {
      if (editing) await api.put(`/provider/services/${editing._id}`, payload);
      else await api.post("/provider/services", payload);
      toast.success(editing ? "Service updated" : "Service created", editing ? "Your changes have been saved." : "Add it to your profile when you are ready.");
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      setFormError(getApiMessage(error, "The service could not be saved."));
      setFieldErrors(getFieldErrors(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (service) => {
    const nextStatus = service.status === "published" ? "paused" : "published";
    setStatusBusyId(service._id);
    try {
      await api.put(`/provider/services/${service._id}`, { status: nextStatus });
      toast.success(nextStatus === "published" ? "Service published" : "Service paused", nextStatus === "published" ? "Customers can now discover this service." : "It is hidden from the marketplace.");
      await load();
    } catch (error) {
      toast.error("Status not changed", getApiMessage(error));
    } finally {
      setStatusBusyId("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/provider/services/${deleteTarget._id}`);
      toast.success("Service deleted", "It has been removed from your workspace.");
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error("Service not deleted", getApiMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Provider workspace"
        title="Services"
        description="Package what you deliver with a clear scope, price signal, and delivery expectation."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            New service
          </Button>
        }
      />

      {!profilePublished ? (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-200" />
            <div>
              <p className="text-sm font-semibold text-amber-100">Your marketplace profile is not published</p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-100/60">
                You can draft services now. Publishing a service requires a live provider profile.
              </p>
            </div>
          </div>
          <Link to="/dashboard/provider/profile" className="btn btn-secondary shrink-0 px-3 py-2 text-xs">
            Open profile
          </Link>
        </div>
      ) : null}

      {state.loading ? (
        <LoadingBlock label="Loading your services" />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={load} />
      ) : state.items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.items.map((service) => {
            const suspended = service.status === "suspended";
            return (
              <article key={service._id} className="surface surface-hover flex flex-col overflow-hidden rounded-2xl">
                <div className="relative">
                  <Artwork
                    src={service.images?.[0]}
                    alt={service.title}
                    label={service.title}
                    icon={Layers}
                    rounded=""
                    className="aspect-[16/9] w-full"
                  />
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={service.status} map={SERVICE_STATUS} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-white">{service.title}</h2>
                    <span className="shrink-0 text-xs font-semibold text-brand-200">{priceLabel(service)}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{service.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {service.category?.name ? <Badge tone="violet">{service.category.name}</Badge> : null}
                    <Badge tone="slate">
                      <Clock size={10} />
                      {service.deliveryDays} day{service.deliveryDays === 1 ? "" : "s"}
                    </Badge>
                    {service.status === "published" ? (
                      <Badge tone="blue">
                        <Eye size={10} />
                        {service.views || 0} {service.views === 1 ? "view" : "views"}
                      </Badge>
                    ) : null}
                  </div>
                  {service.tags?.length ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {service.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="chip text-[10px]">
                          {tag}
                        </span>
                      ))}
                      {service.tags.length > 3 ? <span className="text-[10px] text-slate-600">+{service.tags.length - 3}</span> : null}
                    </div>
                  ) : null}

                  <div className="mt-auto flex items-center gap-1 border-t border-white/[0.06] pt-3.5">
                    {suspended ? (
                      <p className="flex-1 text-[10px] leading-relaxed text-rose-300/80">
                        Suspended by an administrator and read-only.
                      </p>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(service)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={service.status === "published" ? Pause : Play}
                          loading={statusBusyId === service._id}
                          onClick={() => toggleStatus(service)}
                          disabled={Boolean(statusBusyId)}
                        >
                          {service.status === "published" ? "Pause" : "Publish"}
                        </Button>
                        <div className="ml-auto flex items-center gap-0.5">
                          {service.status === "published" ? (
                            <Link
                              to={`/services/${service.slug}`}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                              aria-label="View public service"
                            >
                              <Eye size={14} />
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(service)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"
                            aria-label={`Delete ${service.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No services yet"
          description="Turn your expertise into a clear offer. Services help customers understand scope and budget before they reach out."
          action={
            <Button icon={Plus} onClick={openCreate}>
              Create your first service
            </Button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit service" : "New service"}
        description={editing ? "Update the offer customers see on your profile." : "Describe a repeatable way you can help a customer."}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="service-form" loading={saving}>
              {editing ? "Save changes" : "Create service"}
            </Button>
          </>
        }
      >
        <form id="service-form" onSubmit={submit} className="space-y-5">
          {formError ? <FormError>{formError}</FormError> : null}
          {categoriesError ? <FormError>{categoriesError}</FormError> : null}

          <Field label="Service title" htmlFor="service-title" required error={fieldErrors.title}>
            <Input
              id="service-title"
              value={form.title}
              onChange={(event) => patch({ title: event.target.value })}
              maxLength={160}
              placeholder="SaaS product design sprint"
              invalid={Boolean(fieldErrors.title)}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="service-description"
            required
            error={fieldErrors.description}
            hint="What is included, who it is for, and what the customer walks away with."
          >
            <TextArea
              id="service-description"
              rows={5}
              value={form.description}
              onChange={(event) => patch({ description: event.target.value })}
              maxLength={5000}
              invalid={Boolean(fieldErrors.description)}
              placeholder="A focused two-week sprint that takes your idea from…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="service-category" required error={fieldErrors.category}>
              <Select
                id="service-category"
                value={form.category}
                onChange={(event) => changeCategory(event.target.value)}
                disabled={categoriesLoading}
                invalid={Boolean(fieldErrors.category)}
              >
                <option value="">Select a category</option>
                {tree.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Subcategory" htmlFor="service-subcategory" hint="Optional, but helps discovery.">
              <Select
                id="service-subcategory"
                value={form.subcategory}
                onChange={(event) => patch({ subcategory: event.target.value })}
                disabled={!subcategoryOptions.length}
              >
                <option value="">No specific subcategory</option>
                {subcategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Pricing model" htmlFor="service-pricing" error={fieldErrors.pricingType}>
              <Select id="service-pricing" value={form.pricingType} onChange={(event) => patch({ pricingType: event.target.value })}>
                <option value="fixed">Fixed price</option>
                <option value="hourly">Hourly</option>
                <option value="custom">Custom quote</option>
              </Select>
            </Field>
            <Field label={form.pricingType === "hourly" ? "Hourly rate (USD)" : "Starting price (USD)"} htmlFor="service-starting-price" error={fieldErrors.startingPrice}>
              <Input
                id="service-starting-price"
                type="number"
                min="0"
                value={form.startingPrice}
                onChange={(event) => patch({ startingPrice: event.target.value })}
                placeholder="0"
                invalid={Boolean(fieldErrors.startingPrice)}
              />
            </Field>
            <Field label="Maximum price (USD)" htmlFor="service-max-price" hint="Optional." error={fieldErrors.maxPrice}>
              <Input
                id="service-max-price"
                type="number"
                min="0"
                value={form.maxPrice}
                onChange={(event) => patch({ maxPrice: event.target.value })}
                placeholder="Leave blank for open-ended"
                invalid={Boolean(fieldErrors.maxPrice)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Delivery time (days)" htmlFor="service-delivery" required error={fieldErrors.deliveryDays}>
              <Input
                id="service-delivery"
                type="number"
                min="1"
                max="365"
                value={form.deliveryDays}
                onChange={(event) => patch({ deliveryDays: event.target.value })}
                invalid={Boolean(fieldErrors.deliveryDays)}
              />
            </Field>
            <Field label="Visibility" htmlFor="service-status" error={fieldErrors.status} hint={!profilePublished ? "Publish your provider profile to make this service live." : "Paused services stay hidden until you republish."}>
              <Select id="service-status" value={form.status} onChange={(event) => patch({ status: event.target.value })}>
                <option value="draft">Draft — only you can see it</option>
                <option value="published" disabled={!profilePublished}>
                  Published — visible in the marketplace
                </option>
                {editing ? <option value="paused">Paused — hidden from the marketplace</option> : null}
              </Select>
            </Field>
          </div>

          <ImageGalleryUploader
            value={form.images}
            onChange={(images) => patch({ images })}
            purpose="service"
            max={8}
            label="Service images"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deliverables" htmlFor="service-deliverables" hint="Press Enter after each item." error={fieldErrors.deliverables}>
              <TagInput
                id="service-deliverables"
                value={form.deliverables}
                onChange={(value) => patch({ deliverables: value })}
                max={20}
                placeholder="Clickable prototype, Design tokens…"
              />
            </Field>
            <Field label="What you need from the customer" htmlFor="service-requirements" hint="Access, assets, or decisions needed." error={fieldErrors.requirements}>
              <TagInput
                id="service-requirements"
                value={form.requirements}
                onChange={(value) => patch({ requirements: value })}
                max={20}
                placeholder="Brand assets, Product brief…"
              />
            </Field>
          </div>

          <Field label="Tags" htmlFor="service-tags" hint="Short keywords that help customers find this service." error={fieldErrors.tags}>
            <TagInput id="service-tags" value={form.tags} onChange={(value) => patch({ tags: value })} max={15} placeholder="Product design, Figma, SaaS…" />
          </Field>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-base mb-0">Frequently asked questions</span>
              <span className="text-[10px] text-slate-600">{form.faqs.length}/10</span>
            </div>
            <div className="space-y-3">
              {form.faqs.map((faq, index) => (
                <div key={index} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input
                        value={faq.question}
                        onChange={(event) => updateFaq(index, { question: event.target.value })}
                        maxLength={300}
                        placeholder="Question"
                        aria-label={`Question ${index + 1}`}
                      />
                      <TextArea
                        rows={2}
                        value={faq.answer}
                        onChange={(event) => updateFaq(index, { answer: event.target.value })}
                        maxLength={2000}
                        placeholder="Answer"
                        aria-label={`Answer ${index + 1}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => patch({ faqs: form.faqs.filter((_, faqIndex) => faqIndex !== index) })}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-rose-300"
                      aria-label={`Remove question ${index + 1}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => patch({ faqs: [...form.faqs, { question: "", answer: "" }] })}
              disabled={form.faqs.length >= 10}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-300 transition hover:text-brand-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={12} />
              Add a question
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={confirmDelete}
        title="Delete this service?"
        message={`“${deleteTarget?.title || "This service"}” will be permanently removed. Existing inquiries that referenced it keep their history.`}
        confirmLabel="Delete service"
        busy={deleting}
      />
    </div>
  );
}
