import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../contexts/ToastContext";
import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { Checkbox, Field, FormError, Input, Select, TextArea } from "../../components/ui/Form";
import Modal, { ConfirmModal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/dashboard/DashboardUI";
import { SearchField } from "../../components/admin/AdminBits";

const EMPTY_FORM = {
  name: "",
  description: "",
  icon: "layers",
  parent: "",
  order: "",
  isActive: true,
  featured: false,
};

function matches(category, query) {
  if (!query) return true;
  return `${category.name} ${category.slug} ${category.description || ""}`.toLowerCase().includes(query);
}

export default function AdminCategories() {
  usePageTitle("Categories");
  const toast = useToast();
  const [state, setState] = useState({ loading: true, error: "", flat: [], tree: [] });
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggleKey, setToggleKey] = useState("");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: current.flat.length === 0, error: "" }));
    try {
      const { data } = await api.get("/admin/categories");
      setState({ loading: false, error: "", flat: data.flat || [], tree: data.tree || [] });
    } catch (error) {
      setState((current) => ({
        loading: false,
        error: getApiMessage(error, "Categories could not be loaded."),
        flat: current.flat,
        tree: current.tree,
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCollapsed = (id) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = (parentId = "") => {
    setEditor({ mode: "create", parentId });
    setForm({ ...EMPTY_FORM, parent: parentId });
    setFormError("");
  };

  const openEdit = (category) => {
    setEditor({ mode: "edit", categoryId: category.id });
    setForm({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "layers",
      parent: category.parent || "",
      order: category.order ?? "",
      isActive: Boolean(category.isActive),
      featured: Boolean(category.featured),
    });
    setFormError("");
  };

  const closeEditor = () => {
    if (saving) return;
    setEditor(null);
    setFormError("");
  };

  const save = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (name.length < 2) {
      setFormError("Give the category a name of at least two characters.");
      return;
    }
    setSaving(true);
    setFormError("");
    const payload = {
      name,
      description: form.description.trim(),
      icon: form.icon.trim() || "layers",
      parent: form.parent || null,
      isActive: form.isActive,
      featured: form.featured,
    };
    if (form.order !== "") payload.order = Number(form.order);
    try {
      if (editor.mode === "create") {
        await api.post("/admin/categories", payload);
        toast.success("Category created", `${name} is now part of the marketplace taxonomy.`);
      } else {
        await api.patch(`/admin/categories/${editor.categoryId}`, payload);
        toast.success("Category updated", `${name} was saved and the change was audited.`);
      }
      setEditor(null);
      await load();
    } catch (error) {
      setFormError(getApiMessage(error, "The category could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (category, field) => {
    const key = `${category.id}:${field}`;
    setToggleKey(key);
    try {
      await api.patch(`/admin/categories/${category.id}`, { [field]: !category[field] });
      toast.success(
        field === "isActive"
          ? category.isActive
            ? "Category hidden"
            : "Category visible"
          : category.featured
            ? "Category unfeatured"
            : "Category featured",
        category.name
      );
      await load();
    } catch (error) {
      toast.error("Category not updated", getApiMessage(error, "Please try again."));
    } finally {
      setToggleKey("");
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/categories/${confirm.id}`);
      toast.success("Category deleted", `${confirm.name} was removed from the taxonomy.`);
      setConfirm(null);
      await load();
    } catch (error) {
      toast.error("Category not deleted", getApiMessage(error, "Move its content before deleting it."));
    } finally {
      setDeleting(false);
    }
  };

  if (state.loading) return <LoadingBlock label="Loading marketplace taxonomy" />;
  if (state.error && !state.flat.length) return <ErrorState message={state.error} onRetry={load} />;

  const normalizedQuery = query.trim().toLowerCase();
  const visibleTree = state.tree
    .map((parent) => {
      const parentMatches = matches(parent, normalizedQuery);
      const children = parent.children.filter((child) => parentMatches || matches(child, normalizedQuery));
      if (!parentMatches && !children.length) return null;
      return { ...parent, children: parentMatches ? parent.children : children };
    })
    .filter(Boolean);

  const parents = state.tree.length;
  const children = state.flat.length - parents;
  const active = state.flat.filter((category) => category.isActive).length;
  const featured = state.flat.filter((category) => category.featured).length;
  const editingParent = state.tree.find((parent) => parent.id === editor?.categoryId);
  const editingHasChildren = Boolean(editingParent?.children?.length);
  const parentOptions = state.tree.filter((parent) => !(editor?.mode === "edit" && parent.id === editor.categoryId));

  return (
    <div>
      <PageHeader
        eyebrow="Marketplace"
        title="Categories"
        description="Two levels power discovery: parent categories and their subcategories. Deactivating a category hides it from the public marketplace without deleting content."
        actions={
          <Button size="sm" icon={Plus} onClick={() => openCreate()}>
            New parent category
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
        <span>
          <strong className="text-slate-200">{parents}</strong> parent categories
        </span>
        <span>
          <strong className="text-slate-200">{children}</strong> subcategories
        </span>
        <span>
          <strong className="text-slate-200">{active}</strong> active
        </span>
        <span>
          <strong className="text-slate-200">{featured}</strong> featured
        </span>
        <span className="text-slate-600">Slugs stay stable after creation.</span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <SearchField value={query} onChange={setQuery} placeholder="Search categories or subcategories…" />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300"
          >
            <Search size={11} /> Clear
          </button>
        ) : null}
        {state.error ? <span className="text-[10px] text-rose-300">{state.error}</span> : null}
      </div>

      {visibleTree.length ? (
        <div className="space-y-3">
          {visibleTree.map((parent) => {
            const isCollapsed = collapsed.has(parent.id);
            return (
              <section key={parent.id} className="surface overflow-hidden rounded-2xl">
                <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(parent.id)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
                    aria-expanded={!isCollapsed}
                    aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${parent.name}`}
                  >
                    {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-slate-200">{parent.name}</p>
                      <Badge tone={parent.isActive ? "mint" : "slate"} dot>
                        {parent.isActive ? "Active" : "Hidden"}
                      </Badge>
                      {parent.featured ? <Badge tone="amber">Featured</Badge> : null}
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      /{parent.slug} · order {parent.order} · {parent.children.length} subcategories ·{" "}
                      {parent.providerCount} providers · {parent.serviceCount} services
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={parent.isActive ? Eye : EyeOff}
                      className={parent.isActive ? "text-slate-400" : "text-amber-300"}
                      aria-label={parent.isActive ? `Hide ${parent.name}` : `Show ${parent.name}`}
                      title={parent.isActive ? "Hide category" : "Show category"}
                      loading={toggleKey === `${parent.id}:isActive`}
                      disabled={Boolean(toggleKey)}
                      onClick={() => toggleField(parent, "isActive")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={Star}
                      className={parent.featured ? "text-amber-300" : "text-slate-500"}
                      aria-label={parent.featured ? `Unfeature ${parent.name}` : `Feature ${parent.name}`}
                      title={parent.featured ? "Remove from featured" : "Feature category"}
                      loading={toggleKey === `${parent.id}:featured`}
                      disabled={Boolean(toggleKey)}
                      onClick={() => toggleField(parent, "featured")}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => openCreate(parent.id)}
                      className="hidden sm:inline-flex"
                    >
                      Subcategory
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={Pencil}
                      aria-label={`Edit ${parent.name}`}
                      onClick={() => openEdit(parent)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={Trash2}
                      className="text-rose-300 hover:bg-rose-400/10"
                      aria-label={`Delete ${parent.name}`}
                      title={parent.children.length ? "Delete or move subcategories first" : "Delete category"}
                      disabled={parent.children.length > 0}
                      onClick={() => setConfirm(parent)}
                    />
                  </div>
                </div>

                {!isCollapsed ? (
                  parent.children.length ? (
                    <ul className="border-t border-white/8">
                      {parent.children.map((child) => (
                        <li
                          key={child.id}
                          className="flex flex-wrap items-center gap-2 border-t border-white/5 px-3 py-2.5 first:border-t-0 sm:px-4 sm:pl-11"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="truncate text-xs text-slate-300">{child.name}</span>
                              <Badge tone={child.isActive ? "mint" : "slate"} dot>
                                {child.isActive ? "Active" : "Hidden"}
                              </Badge>
                              {child.featured ? <Badge tone="amber">Featured</Badge> : null}
                            </div>
                            <p className="mt-0.5 truncate text-[10px] text-slate-600">
                              /{child.slug} · order {child.order} · {child.providerCount} providers ·{" "}
                              {child.serviceCount} services
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              icon={child.isActive ? Eye : EyeOff}
                              className={child.isActive ? "text-slate-500" : "text-amber-300"}
                              aria-label={child.isActive ? `Hide ${child.name}` : `Show ${child.name}`}
                              title={child.isActive ? "Hide subcategory" : "Show subcategory"}
                              loading={toggleKey === `${child.id}:isActive`}
                              disabled={Boolean(toggleKey)}
                              onClick={() => toggleField(child, "isActive")}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              icon={Star}
                              className={child.featured ? "text-amber-300" : "text-slate-600"}
                              aria-label={child.featured ? `Unfeature ${child.name}` : `Feature ${child.name}`}
                              title={child.featured ? "Remove from featured" : "Feature subcategory"}
                              loading={toggleKey === `${child.id}:featured`}
                              disabled={Boolean(toggleKey)}
                              onClick={() => toggleField(child, "featured")}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              icon={Pencil}
                              aria-label={`Edit ${child.name}`}
                              onClick={() => openEdit(child)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              icon={Trash2}
                              className="text-rose-300 hover:bg-rose-400/10"
                              aria-label={`Delete ${child.name}`}
                              onClick={() => setConfirm(child)}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="border-t border-white/8 px-4 py-3 text-[11px] text-slate-600 sm:pl-11">
                      No subcategories yet. Add one to help customers narrow their search.
                    </p>
                  )
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title={query ? "No categories match" : "No categories yet"}
          description={
            query
              ? "Try a different search term or clear the filter."
              : "Create a parent category, then add subcategories to shape marketplace discovery."
          }
          action={
            query ? (
              <Button variant="secondary" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            ) : (
              <Button size="sm" icon={Plus} onClick={() => openCreate()}>
                New parent category
              </Button>
            )
          }
        />
      )}

      <Modal
        open={Boolean(editor)}
        onClose={closeEditor}
        title={editor?.mode === "edit" ? "Edit category" : editor?.parentId ? "New subcategory" : "New parent category"}
        description={
          editor?.mode === "edit"
            ? "Update how this category appears and behaves across the marketplace."
            : "Categories shape how customers browse providers, services, and portfolio work."
        }
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeEditor} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="category-form" loading={saving}>
              {editor?.mode === "edit" ? "Save changes" : "Create category"}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={save} className="space-y-4">
          {formError ? <FormError>{formError}</FormError> : null}
          <Field label="Name" htmlFor="category-name" required>
            <Input
              id="category-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              maxLength={100}
              required
            />
          </Field>
          <Field
            label="Description"
            htmlFor="category-description"
            hint="Shown on category pages and used to help customers understand this discipline."
          >
            <TextArea
              id="category-description"
              rows={3}
              maxLength={1000}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Parent category" htmlFor="category-parent" hint={editingHasChildren ? "Move its subcategories before making this a subcategory." : "Only two levels are supported."}>
              <Select
                id="category-parent"
                value={form.parent}
                onChange={(event) => setForm((current) => ({ ...current, parent: event.target.value }))}
                disabled={editingHasChildren}
              >
                <option value="">Top-level category</option>
                {parentOptions.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Order" htmlFor="category-order" hint="Lower numbers appear first. Leave blank to add at the end.">
              <Input
                id="category-order"
                type="number"
                min={0}
                max={999}
                value={form.order}
                onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
                placeholder="Automatic"
              />
            </Field>
          </div>
          <Field label="Icon key" htmlFor="category-icon" hint="Examples: layers, code, brush, chart, shield.">
            <Input
              id="category-icon"
              value={form.icon}
              onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
              maxLength={40}
            />
          </Field>
          <div className="space-y-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <Checkbox
              label="Active in the marketplace"
              description="Hidden categories remain editable and keep their content, but disappear from public pages."
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            <Checkbox
              label="Featured category"
              description="Featured categories can be highlighted on the public categories page."
              checked={form.featured}
              onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(confirm)}
        onClose={() => (deleting ? null : setConfirm(null))}
        onConfirm={remove}
        busy={deleting}
        title="Delete this category?"
        message={
          confirm
            ? `“${confirm.name}” will be permanently removed. Categories linked to providers, services, portfolio projects, or subcategories cannot be deleted.`
            : ""
        }
        confirmLabel="Delete category"
      />
    </div>
  );
}
