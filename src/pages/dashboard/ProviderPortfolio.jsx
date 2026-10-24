import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  Eye,
  Images,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
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
import { formatDate } from "../../lib/format";

const PROJECT_STATUS = {
  draft: { label: "Draft", tone: "amber" },
  published: { label: "Published", tone: "mint" },
  suspended: { label: "Suspended", tone: "red" },
};

function blankProject() {
  return {
    title: "",
    summary: "",
    description: "",
    images: [],
    technologies: [],
    skills: [],
    category: "",
    subcategory: "",
    completionDate: "",
    role: "",
    liveUrl: "",
    repoUrl: "",
    outcomes: "",
    clientName: "",
    status: "draft",
  };
}

function formFromProject(project) {
  return {
    title: project.title || "",
    summary: project.summary || "",
    description: project.description || "",
    images: project.images || [],
    technologies: project.technologies || [],
    skills: project.skills || [],
    category: project.category?.id || project.category?._id || project.category || "",
    subcategory: project.subcategory?.id || project.subcategory?._id || project.subcategory || "",
    completionDate: project.completionDate ? new Date(project.completionDate).toISOString().slice(0, 10) : "",
    role: project.role || "",
    liveUrl: project.liveUrl || "",
    repoUrl: project.repoUrl || "",
    outcomes: project.outcomes || "",
    clientName: project.clientName || "",
    status: project.status === "suspended" ? "published" : project.status || "draft",
  };
}

export default function ProviderPortfolio() {
  const { providerProfile } = useAuth();
  const { tree, loading: categoriesLoading, error: categoriesError } = useCategories();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankProject);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState("");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/provider/portfolio");
      setState({ loading: false, error: "", items: data.items || [] });
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "Your portfolio could not be loaded."), items: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePageTitle("Portfolio");

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

  const changeCategory = (value) => {
    setForm((current) => ({ ...current, category: value, subcategory: "" }));
    setFormError("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm(blankProject());
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm(formFromProject(project));
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setFormError("");
    setFieldErrors({});

    if (form.status === "published" && !profilePublished) {
      setFormError("Publish your marketplace profile before publishing a portfolio project.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      images: form.images,
      technologies: form.technologies,
      skills: form.skills,
      category: form.category,
      subcategory: form.subcategory || "",
      completionDate: form.completionDate || null,
      role: form.role.trim(),
      liveUrl: form.liveUrl.trim(),
      repoUrl: form.repoUrl.trim(),
      outcomes: form.outcomes.trim(),
      clientName: form.clientName.trim(),
      status: form.status,
    };

    setSaving(true);
    try {
      if (editing) await api.put(`/provider/portfolio/${editing._id}`, payload);
      else await api.post("/provider/portfolio", payload);
      toast.success(editing ? "Project updated" : "Project created", editing ? "Your changes have been saved." : "Add more projects to build a stronger case study library.");
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      setFormError(getApiMessage(error, "The portfolio project could not be saved."));
      setFieldErrors(getFieldErrors(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (project) => {
    const nextStatus = project.status === "published" ? "draft" : "published";
    setStatusBusyId(project._id);
    try {
      await api.put(`/provider/portfolio/${project._id}`, { status: nextStatus });
      toast.success(nextStatus === "published" ? "Project published" : "Project moved to draft", nextStatus === "published" ? "It is now visible in your public portfolio." : "It is hidden from public view.");
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
      await api.delete(`/provider/portfolio/${deleteTarget._id}`);
      toast.success("Project deleted", "It has been removed from your portfolio.");
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error("Project not deleted", getApiMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Provider workspace"
        title="Portfolio"
        description="Show the work behind your expertise: the problem, your role, and the outcome."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add project
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
                You can prepare case studies now. Publishing them requires a live provider profile.
              </p>
            </div>
          </div>
          <Link to="/dashboard/provider/profile" className="btn btn-secondary shrink-0 px-3 py-2 text-xs">
            Open profile
          </Link>
        </div>
      ) : null}

      {state.loading ? (
        <LoadingBlock label="Loading your portfolio" />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={load} />
      ) : state.items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.items.map((project) => {
            const suspended = project.status === "suspended";
            return (
              <article key={project._id} className="surface surface-hover flex flex-col overflow-hidden rounded-2xl">
                <div className="relative">
                  <Artwork
                    src={project.images?.[0]}
                    alt={project.title}
                    label={project.title}
                    icon={Images}
                    rounded=""
                    className="aspect-[16/10] w-full"
                  />
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={project.status} map={PROJECT_STATUS} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-sm font-semibold leading-snug text-white">{project.title}</h2>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                    {project.summary || project.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {project.category?.name ? <Badge tone="violet">{project.category.name}</Badge> : null}
                    {project.completionDate ? (
                      <Badge tone="slate">
                        <CalendarDays size={10} />
                        {formatDate(project.completionDate, { month: "short", year: "numeric", day: undefined })}
                      </Badge>
                    ) : null}
                  </div>
                  {project.technologies?.length ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 4).map((technology) => (
                        <span key={technology} className="chip text-[10px]">
                          {technology}
                        </span>
                      ))}
                      {project.technologies.length > 4 ? (
                        <span className="text-[10px] text-slate-600">+{project.technologies.length - 4}</span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-auto flex items-center gap-1 border-t border-white/[0.06] pt-3.5">
                    {suspended ? (
                      <p className="flex-1 text-[10px] leading-relaxed text-rose-300/80">
                        Suspended by an administrator and read-only.
                      </p>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(project)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={UploadCloud}
                          loading={statusBusyId === project._id}
                          onClick={() => toggleStatus(project)}
                          disabled={Boolean(statusBusyId)}
                        >
                          {project.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <div className="ml-auto flex items-center gap-0.5">
                          {project.status === "published" ? (
                            <Link
                              to={`/portfolio/${project.slug}`}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                              aria-label="View public project"
                            >
                              <Eye size={14} />
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(project)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"
                            aria-label={`Delete ${project.title}`}
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
          icon={Images}
          title="Your portfolio is empty"
          description="Case studies turn claims into evidence. Add a project with your role, the problem, and the result."
          action={
            <Button icon={Plus} onClick={openCreate}>
              Add your first project
            </Button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit portfolio project" : "Add portfolio project"}
        description="Be specific about your contribution and the outcome. Avoid sharing client-confidential material."
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="portfolio-form" loading={saving}>
              {editing ? "Save changes" : "Add project"}
            </Button>
          </>
        }
      >
        <form id="portfolio-form" onSubmit={submit} className="space-y-5">
          {formError ? <FormError>{formError}</FormError> : null}
          {categoriesError ? <FormError>{categoriesError}</FormError> : null}

          <Field label="Project title" htmlFor="project-title" required error={fieldErrors.title}>
            <Input
              id="project-title"
              value={form.title}
              onChange={(event) => patch({ title: event.target.value })}
              maxLength={160}
              placeholder="Onboarding redesign for a fintech app"
              invalid={Boolean(fieldErrors.title)}
            />
          </Field>

          <Field label="Short summary" htmlFor="project-summary" error={fieldErrors.summary} hint="One line that appears on portfolio cards.">
            <Input
              id="project-summary"
              value={form.summary}
              onChange={(event) => patch({ summary: event.target.value })}
              maxLength={400}
              placeholder="Reduced time-to-value for new users by 38%"
            />
          </Field>

          <Field
            label="Project story"
            htmlFor="project-description"
            required
            error={fieldErrors.description}
            hint="The context, constraints, your contribution, and what changed."
          >
            <TextArea
              id="project-description"
              rows={7}
              value={form.description}
              onChange={(event) => patch({ description: event.target.value })}
              maxLength={8000}
              invalid={Boolean(fieldErrors.description)}
              placeholder="The client needed… We started by… The final experience…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="project-category" required error={fieldErrors.category}>
              <Select
                id="project-category"
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
            <Field label="Subcategory" htmlFor="project-subcategory">
              <Select
                id="project-subcategory"
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
            <Field label="Completion date" htmlFor="project-date" error={fieldErrors.completionDate}>
              <Input
                id="project-date"
                type="date"
                value={form.completionDate}
                onChange={(event) => patch({ completionDate: event.target.value })}
              />
            </Field>
            <Field label="Your role" htmlFor="project-role" error={fieldErrors.role}>
              <Input
                id="project-role"
                value={form.role}
                onChange={(event) => patch({ role: event.target.value })}
                maxLength={200}
                placeholder="Lead product designer"
              />
            </Field>
            <Field label="Visibility" htmlFor="project-status" error={fieldErrors.status} hint={!profilePublished ? "Publish your profile first." : undefined}>
              <Select id="project-status" value={form.status} onChange={(event) => patch({ status: event.target.value })}>
                <option value="draft">Draft — only you can see it</option>
                <option value="published" disabled={!profilePublished}>
                  Published — visible publicly
                </option>
              </Select>
            </Field>
          </div>

          <Field label="Client name" htmlFor="project-client" error={fieldErrors.clientName} hint="Optional. Only include a name if you have permission.">
            <Input
              id="project-client"
              value={form.clientName}
              onChange={(event) => patch({ clientName: event.target.value })}
              maxLength={120}
              placeholder="Confidential, or a client name you may share"
            />
          </Field>

          <ImageGalleryUploader
            value={form.images}
            onChange={(images) => patch({ images })}
            purpose="portfolio"
            max={8}
            label="Project images"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Technologies" htmlFor="project-technologies" hint="Press Enter after each item." error={fieldErrors.technologies}>
              <TagInput
                id="project-technologies"
                value={form.technologies}
                onChange={(value) => patch({ technologies: value })}
                max={20}
                placeholder="React, Node.js, Figma…"
              />
            </Field>
            <Field label="Skills demonstrated" htmlFor="project-skills" hint="What this project proves you can do." error={fieldErrors.skills}>
              <TagInput
                id="project-skills"
                value={form.skills}
                onChange={(value) => patch({ skills: value })}
                max={20}
                placeholder="UX research, Design systems…"
              />
            </Field>
          </div>

          <Field label="Outcomes" htmlFor="project-outcomes" error={fieldErrors.outcomes} hint="Concrete results, if you can share them.">
            <TextArea
              id="project-outcomes"
              rows={3}
              value={form.outcomes}
              onChange={(event) => patch({ outcomes: event.target.value })}
              maxLength={1200}
              placeholder="Activation improved from 42% to 58% within eight weeks…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Live project URL" htmlFor="project-live" error={fieldErrors.liveUrl}>
              <Input
                id="project-live"
                value={form.liveUrl}
                onChange={(event) => patch({ liveUrl: event.target.value })}
                maxLength={500}
                placeholder="https://example.com"
              />
            </Field>
            <Field label="Repository URL" htmlFor="project-repo" error={fieldErrors.repoUrl}>
              <Input
                id="project-repo"
                value={form.repoUrl}
                onChange={(event) => patch({ repoUrl: event.target.value })}
                maxLength={500}
                placeholder="https://github.com/…"
              />
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={confirmDelete}
        title="Delete this project?"
        message={`“${deleteTarget?.title || "This project"}” will be permanently removed from your portfolio.`}
        confirmLabel="Delete project"
        busy={deleting}
      />
    </div>
  );
}
