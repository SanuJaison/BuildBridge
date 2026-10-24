import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Eye, Save, Send } from "lucide-react";
import api, { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import useCategories from "../../hooks/useCategories";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Checkbox, Field, FormError, Input, Select, TagInput, TextArea } from "../../components/ui/Form";
import { ImageUploader } from "../../components/ui/Uploader";
import { ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { PageHeader, Panel } from "../../components/dashboard/DashboardUI";
import { PROVIDER_TYPE_LABELS } from "../../lib/format";

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available now" },
  { value: "limited", label: "Limited availability" },
  { value: "unavailable", label: "Unavailable" },
];

function toForm(provider) {
  return {
    displayName: provider.displayName || "",
    headline: provider.headline || "",
    bio: provider.bio || "",
    avatar: provider.avatar || "",
    coverImage: provider.coverImage || "",
    primaryCategory: provider.primaryCategory?.id || provider.primaryCategory?._id || provider.primaryCategory || "",
    subcategories: (provider.subcategories || []).map(
      (category) => category?.id || category?._id || category
    ),
    skills: provider.skills || [],
    technologies: provider.technologies || [],
    languages: provider.languages || [],
    location: provider.location || "",
    remote: provider.remote !== false,
    experienceYears: provider.experienceYears ?? 0,
    startingBudget: provider.startingBudget ?? "",
    hourlyRate: provider.hourlyRate ?? "",
    availability: provider.availability || "available",
    engagementTypes: provider.engagementTypes || [],
    website: provider.website || "",
    githubUrl: provider.githubUrl || "",
    portfolioUrl: provider.portfolioUrl || "",
    linkedinUrl: provider.linkedinUrl || "",
    teamSize: provider.teamSize ?? "",
    yearEstablished: provider.yearEstablished ?? "",
  };
}

function payloadFrom(form) {
  return {
    displayName: form.displayName.trim(),
    headline: form.headline.trim(),
    bio: form.bio.trim(),
    avatar: form.avatar,
    coverImage: form.coverImage,
    primaryCategory: form.primaryCategory || "",
    subcategories: form.subcategories.slice(0, 8),
    skills: form.skills,
    technologies: form.technologies,
    languages: form.languages,
    location: form.location.trim(),
    remote: form.remote,
    experienceYears: Number(form.experienceYears) || 0,
    startingBudget: form.startingBudget === "" ? null : Number(form.startingBudget),
    hourlyRate: form.hourlyRate === "" ? null : Number(form.hourlyRate),
    availability: form.availability,
    engagementTypes: form.engagementTypes,
    website: form.website.trim(),
    githubUrl: form.githubUrl.trim(),
    portfolioUrl: form.portfolioUrl.trim(),
    linkedinUrl: form.linkedinUrl.trim(),
    teamSize: form.teamSize === "" ? null : Number(form.teamSize),
    yearEstablished: form.yearEstablished === "" ? null : Number(form.yearEstablished),
  };
}

function readiness(form) {
  return [
    { label: "Display name", done: form.displayName.trim().length >= 2 },
    { label: "Professional headline (8+ characters)", done: form.headline.trim().length >= 8 },
    { label: "Biography of at least 80 characters", done: form.bio.trim().length >= 80 },
    { label: "Primary category", done: Boolean(form.primaryCategory) },
    { label: "At least one skill", done: form.skills.length > 0 },
    { label: "Location", done: Boolean(form.location.trim()) },
  ];
}

export default function ProviderProfileEditor() {
  const { refresh } = useAuth();
  const { tree } = useCategories();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, error: "", profile: null, canManage: false, organization: null });
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    setError("");
    try {
      const { data } = await api.get("/provider/profile");
      setState({
        loading: false,
        error: "",
        profile: data.provider,
        canManage: Boolean(data.canManage),
        organization: data.organization,
      });
      setForm(toForm(data.provider));
    } catch (loadError) {
      setState({
        loading: false,
        error: getApiMessage(loadError, "Your provider profile could not be loaded."),
        profile: null,
        canManage: false,
        organization: null,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePageTitle("Marketplace profile");

  if (state.loading) return <LoadingBlock label="Loading your marketplace profile" />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;
  if (!form) return null;

  const { profile, canManage, organization } = state;
  const locked = !canManage || profile.status === "suspended";
  const requirements = readiness(form);
  const publishReady = requirements.every((item) => item.done);
  const primaryNode = tree.find((category) => category.id === form.primaryCategory);
  const subcategoryOptions = primaryNode?.children || [];

  const patch = (updates) => {
    setForm((current) => ({ ...current, ...updates }));
    setSaved("");
  };

  const changePrimaryCategory = (value) => {
    const node = tree.find((category) => category.id === value);
    const childIds = new Set((node?.children || []).map((child) => child.id));
    setForm((current) => ({
      ...current,
      primaryCategory: value,
      subcategories: value ? current.subcategories.filter((id) => childIds.has(id)) : [],
    }));
    setSaved("");
  };

  const toggleSubcategory = (id) => {
    setForm((current) => {
      const selected = current.subcategories.includes(id);
      if (!selected && current.subcategories.length >= 8) return current;
      return {
        ...current,
        subcategories: selected
          ? current.subcategories.filter((item) => item !== id)
          : [...current.subcategories, id],
      };
    });
    setSaved("");
  };

  const persist = async () => {
    const { data } = await api.put("/provider/profile", payloadFrom(form));
    setState((current) => ({ ...current, profile: data.provider }));
    setForm(toForm(data.provider));
    return data.provider;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (locked || busy) return;
    setBusy("save");
    setError("");
    setFieldErrors({});
    setSaved("");
    try {
      await persist();
      setSaved("Your marketplace profile has been saved.");
      toast.success("Profile saved", "Your changes are live in the client directory.");
      await refresh();
    } catch (saveError) {
      setError(getApiMessage(saveError, "Your profile could not be saved."));
      setFieldErrors(getFieldErrors(saveError));
    } finally {
      setBusy("");
    }
  };

  const publish = async () => {
    if (locked || busy || !publishReady) return;
    setBusy("publish");
    setError("");
    setFieldErrors({});
    setSaved("");
    try {
      await persist();
      const { data } = await api.post("/provider/publish");
      setState((current) => ({ ...current, profile: data.provider }));
      setForm(toForm(data.provider));
      toast.success("Profile published", "Customers can now find you in the marketplace.");
      await refresh();
    } catch (publishError) {
      setError(getApiMessage(publishError, "Your profile could not be published."));
      setFieldErrors(getFieldErrors(publishError));
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Provider workspace"
        title="Marketplace profile"
        description="This is your public storefront. Keep it accurate, specific, and focused on the outcomes you deliver."
        actions={
          <>
            {profile.status === "published" ? (
              <Link to={`/providers/${profile.slug}`} className="btn btn-secondary px-4 py-2.5 text-sm">
                <Eye size={14} />
                Public profile
              </Link>
            ) : null}
            <Button type="submit" form="provider-profile-form" icon={Save} loading={busy === "save"} disabled={locked || busy !== ""}>
              Save changes
            </Button>
          </>
        }
      />

      {!canManage ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-sky-400/20 bg-sky-400/[0.05] px-4 py-3.5">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-sky-300" />
          <div>
            <p className="text-sm font-semibold text-sky-100">Read-only access</p>
            <p className="mt-0.5 text-xs leading-relaxed text-sky-100/60">
              Only the organization owner and admins can edit the marketplace profile. Ask a workspace manager for help.
            </p>
          </div>
        </div>
      ) : null}

      {profile.status === "suspended" ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-400/[0.06] px-4 py-3.5">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-rose-300" />
          <div>
            <p className="text-sm font-semibold text-rose-200">This profile is suspended</p>
            <p className="mt-0.5 text-xs leading-relaxed text-rose-200/70">
              Profile details are read-only while an administrator reviews the account. Contact support if you believe
              this is a mistake.
            </p>
          </div>
        </div>
      ) : null}

      <form id="provider-profile-form" onSubmit={handleSave}>
        <fieldset disabled={locked} className="m-0 min-w-0 border-0 p-0">
          <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-5">
              <Panel title="Identity" description="The first details customers see in search results.">
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ImageUploader
                      value={form.avatar}
                      onChange={(value) => patch({ avatar: value })}
                      purpose="avatar"
                      label="Profile photo"
                      shape="avatar"
                      hint="Square images work best. JPG, PNG, WebP, or GIF up to 8 MB."
                    />
                    <ImageUploader
                      value={form.coverImage}
                      onChange={(value) => patch({ coverImage: value })}
                      purpose="cover"
                      label="Cover image"
                      hint="Optional wide banner for your public profile."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Display name" htmlFor="displayName" required error={fieldErrors.displayName}>
                      <Input
                        id="displayName"
                        value={form.displayName}
                        onChange={(event) => patch({ displayName: event.target.value })}
                        maxLength={120}
                        invalid={Boolean(fieldErrors.displayName)}
                      />
                    </Field>
                    <Field
                      label="Account type"
                      hint={`${PROVIDER_TYPE_LABELS[profile.type] || "Provider"}${organization?.name ? ` · ${organization.name}` : ""}`}
                    >
                      <div className="flex min-h-[46px] items-center gap-2">
                        <Badge tone="violet">{PROVIDER_TYPE_LABELS[profile.type] || "Provider"}</Badge>
                        {profile.slug ? <span className="truncate text-[11px] text-slate-600">/providers/{profile.slug}</span> : null}
                      </div>
                    </Field>
                  </div>

                  <Field
                    label="Professional headline"
                    htmlFor="headline"
                    required
                    error={fieldErrors.headline}
                    hint="One clear sentence about who you help and what you deliver."
                  >
                    <Input
                      id="headline"
                      value={form.headline}
                      onChange={(event) => patch({ headline: event.target.value })}
                      maxLength={160}
                      placeholder="Product designer for early-stage SaaS teams"
                      invalid={Boolean(fieldErrors.headline)}
                    />
                  </Field>

                  <Field
                    label="Biography"
                    htmlFor="bio"
                    required
                    error={fieldErrors.bio}
                    hint="Describe your approach, typical engagements, and the outcomes you create. At least 80 characters to publish."
                  >
                    <TextArea
                      id="bio"
                      rows={7}
                      value={form.bio}
                      onChange={(event) => patch({ bio: event.target.value })}
                      maxLength={4000}
                      invalid={Boolean(fieldErrors.bio)}
                      placeholder="Share how you work, the problems you solve, and what a good collaboration looks like…"
                    />
                    <p className="mt-1 text-right text-[10px] text-slate-600">{form.bio.length}/4000</p>
                  </Field>
                </div>
              </Panel>

              <Panel title="Expertise" description="Help customers understand where your strengths fit.">
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Primary category" htmlFor="primaryCategory" error={fieldErrors.primaryCategory}>
                      <Select
                        id="primaryCategory"
                        value={form.primaryCategory}
                        onChange={(event) => changePrimaryCategory(event.target.value)}
                        invalid={Boolean(fieldErrors.primaryCategory)}
                      >
                        <option value="">Select a category</option>
                        {tree.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Experience" htmlFor="experienceYears" hint="Years of professional experience." error={fieldErrors.experienceYears}>
                      <Input
                        id="experienceYears"
                        type="number"
                        min="0"
                        max="60"
                        value={form.experienceYears}
                        onChange={(event) => patch({ experienceYears: event.target.value })}
                        invalid={Boolean(fieldErrors.experienceYears)}
                      />
                    </Field>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="label-base mb-0">Specialties</span>
                      <span className="text-[10px] text-slate-600">{form.subcategories.length}/8 selected</span>
                    </div>
                    {!form.primaryCategory ? (
                      <p className="rounded-xl border border-dashed border-white/10 px-3.5 py-3 text-xs text-slate-500">
                        Choose a primary category to see related specialties.
                      </p>
                    ) : subcategoryOptions.length ? (
                      <div className="grid max-h-52 gap-1 overflow-y-auto rounded-xl border border-white/10 bg-ink-950/40 p-2 sm:grid-cols-2">
                        {subcategoryOptions.map((category) => {
                          const checked = form.subcategories.includes(category.id);
                          const atLimit = !checked && form.subcategories.length >= 8;
                          return (
                            <label
                              key={category.id}
                              className={`flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs transition ${
                                atLimit ? "cursor-not-allowed opacity-40" : "hover:bg-white/[0.035]"
                              } ${checked ? "bg-brand-500/10 text-brand-100" : "text-slate-300"}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={atLimit}
                                onChange={() => toggleSubcategory(category.id)}
                                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-600 bg-ink-900 accent-violet-500"
                              />
                              <span>{category.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-white/10 px-3.5 py-3 text-xs text-slate-500">
                        This category has no specialties yet.
                      </p>
                    )}
                    {fieldErrors.subcategories ? <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.subcategories}</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Skills" htmlFor="skills" hint="Press Enter after each skill. Up to 30." error={fieldErrors.skills}>
                      <TagInput id="skills" value={form.skills} onChange={(value) => patch({ skills: value })} max={30} placeholder="UX research, design systems…" />
                    </Field>
                    <Field label="Technologies" htmlFor="technologies" hint="Tools and platforms you use." error={fieldErrors.technologies}>
                      <TagInput
                        id="technologies"
                        value={form.technologies}
                        onChange={(value) => patch({ technologies: value })}
                        max={30}
                        placeholder="Figma, React, Node.js…"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Languages" htmlFor="languages" hint="Languages you can work in." error={fieldErrors.languages}>
                      <TagInput
                        id="languages"
                        value={form.languages}
                        onChange={(value) => patch({ languages: value })}
                        max={10}
                        placeholder="English, Spanish…"
                      />
                    </Field>
                    <Field label="Location" htmlFor="location" required error={fieldErrors.location}>
                      <Input
                        id="location"
                        value={form.location}
                        onChange={(event) => patch({ location: event.target.value })}
                        maxLength={120}
                        placeholder="Berlin, Germany"
                        invalid={Boolean(fieldErrors.location)}
                      />
                    </Field>
                  </div>

                  <Checkbox
                    label="Available for remote work"
                    description="Customers can work with you regardless of location."
                    checked={form.remote}
                    onChange={(event) => patch({ remote: event.target.checked })}
                  />
                </div>
              </Panel>

              <Panel title="Commercial details" description="Set expectations before the first conversation.">
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Starting budget" htmlFor="startingBudget" hint="USD. Leave blank to discuss." error={fieldErrors.startingBudget}>
                      <Input
                        id="startingBudget"
                        type="number"
                        min="0"
                        value={form.startingBudget}
                        onChange={(event) => patch({ startingBudget: event.target.value })}
                        placeholder="2500"
                        invalid={Boolean(fieldErrors.startingBudget)}
                      />
                    </Field>
                    <Field label="Hourly rate" htmlFor="hourlyRate" hint="USD per hour, if relevant." error={fieldErrors.hourlyRate}>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        value={form.hourlyRate}
                        onChange={(event) => patch({ hourlyRate: event.target.value })}
                        placeholder="85"
                        invalid={Boolean(fieldErrors.hourlyRate)}
                      />
                    </Field>
                    <Field label="Availability" htmlFor="availability" error={fieldErrors.availability}>
                      <Select
                        id="availability"
                        value={form.availability}
                        onChange={(event) => patch({ availability: event.target.value })}
                        invalid={Boolean(fieldErrors.availability)}
                      >
                        {AVAILABILITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field
                    label="Engagement types"
                    htmlFor="engagementTypes"
                    hint="How you like to work with clients. Press Enter after each."
                    error={fieldErrors.engagementTypes}
                  >
                    <TagInput
                      id="engagementTypes"
                      value={form.engagementTypes}
                      onChange={(value) => patch({ engagementTypes: value })}
                      max={10}
                      placeholder="Fixed-scope project, Monthly retainer…"
                    />
                  </Field>
                </div>
              </Panel>

              <Panel title="Links and business details" description="Optional links that help buyers verify your work.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Website" htmlFor="website" error={fieldErrors.website}>
                    <Input id="website" value={form.website} onChange={(event) => patch({ website: event.target.value })} maxLength={500} placeholder="https://yourstudio.com" />
                  </Field>
                  <Field label="Portfolio link" htmlFor="portfolioUrl" error={fieldErrors.portfolioUrl}>
                    <Input
                      id="portfolioUrl"
                      value={form.portfolioUrl}
                      onChange={(event) => patch({ portfolioUrl: event.target.value })}
                      maxLength={500}
                      placeholder="https://behance.net/yourstudio"
                    />
                  </Field>
                  <Field label="GitHub" htmlFor="githubUrl" error={fieldErrors.githubUrl}>
                    <Input id="githubUrl" value={form.githubUrl} onChange={(event) => patch({ githubUrl: event.target.value })} maxLength={500} placeholder="https://github.com/yourstudio" />
                  </Field>
                  <Field label="LinkedIn" htmlFor="linkedinUrl" error={fieldErrors.linkedinUrl}>
                    <Input
                      id="linkedinUrl"
                      value={form.linkedinUrl}
                      onChange={(event) => patch({ linkedinUrl: event.target.value })}
                      maxLength={500}
                      placeholder="https://linkedin.com/company/yourstudio"
                    />
                  </Field>
                  <Field label="Team size" htmlFor="teamSize" hint="Active people in your organization." error={fieldErrors.teamSize}>
                    <Input
                      id="teamSize"
                      type="number"
                      min="0"
                      value={form.teamSize}
                      onChange={(event) => patch({ teamSize: event.target.value })}
                      placeholder="6"
                      invalid={Boolean(fieldErrors.teamSize)}
                    />
                  </Field>
                  <Field label="Year established" htmlFor="yearEstablished" error={fieldErrors.yearEstablished}>
                    <Input
                      id="yearEstablished"
                      type="number"
                      min="1900"
                      max="2100"
                      value={form.yearEstablished}
                      onChange={(event) => patch({ yearEstablished: event.target.value })}
                      placeholder="2019"
                      invalid={Boolean(fieldErrors.yearEstablished)}
                    />
                  </Field>
                </div>
              </Panel>

              <div className="border-t border-white/[0.07] pt-5">
                {error ? <div className="mb-4"><FormError>{error}</FormError></div> : null}
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {saved ? <p className="mr-auto text-xs text-mint-300">{saved}</p> : null}
                  <Button type="submit" icon={Save} loading={busy === "save"} disabled={locked || busy !== ""}>
                    Save changes
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <Panel
                title="Publishing checklist"
                description={
                  profile.status === "published"
                    ? "Your profile is live. Keep these details current."
                    : "Complete these required details to unlock publishing."
                }
              >
                <ul className="space-y-2">
                  {requirements.map((item) => (
                    <li key={item.label} className="flex items-center gap-2.5 text-xs">
                      <CheckCircle2 size={14} className={item.done ? "text-mint-300" : "text-slate-600"} />
                      <span className={item.done ? "text-slate-300" : "text-slate-500"}>{item.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-white/8 pt-4">
                  {profile.status === "published" ? (
                    <div className="rounded-xl border border-mint-400/20 bg-mint-400/[0.06] px-3.5 py-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-mint-200">
                        <CheckCircle2 size={13} />
                        Your profile is live
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-mint-200/60">
                        Updates are visible immediately after saving.
                      </p>
                    </div>
                  ) : canManage ? (
                    <>
                      <Button
                        icon={Send}
                        onClick={publish}
                        loading={busy === "publish"}
                        disabled={!publishReady || busy !== "" || profile.status === "suspended"}
                        className="w-full"
                      >
                        Publish profile
                      </Button>
                      {!publishReady ? (
                        <p className="mt-2 text-center text-[10px] leading-relaxed text-slate-500">
                          Finish the checklist above to publish. Unsaved changes are saved automatically when you publish.
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-center text-[11px] text-slate-500">A workspace manager can publish this profile.</p>
                  )}
                </div>
              </Panel>

              <div className="surface rounded-2xl p-4">
                <p className="text-xs font-semibold text-white">Profile quality matters</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                  Specific headlines, honest biographies, and real work samples help customers decide. BuildBridge never
                  fabricates ratings, and providers cannot edit reviews.
                </p>
              </div>

              {organization ? (
                <div className="surface rounded-2xl p-4">
                  <p className="text-xs font-semibold text-white">Organization</p>
                  <p className="mt-1 text-[11px] text-slate-500">{organization.name}</p>
                  <Link to="/dashboard/team" className="mt-2 inline-flex text-[11px] font-medium text-brand-300 hover:text-brand-200">
                    Manage team workspace
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
