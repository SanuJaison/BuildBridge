import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useBranding } from "../../contexts/BrandingContext";
import { useToast } from "../../contexts/ToastContext";
import Button from "../../components/ui/Button";
import { ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { Checkbox, Field, FormError, Input, TextArea } from "../../components/ui/Form";
import { PageHeader, Panel } from "../../components/dashboard/DashboardUI";

const FIELDS = [
  "siteName",
  "tagline",
  "heroHeadline",
  "heroSubline",
  "supportEmail",
  "supportPhone",
  "location",
  "showDemoNotice",
];

function pick(branding) {
  return Object.fromEntries(FIELDS.map((field) => [field, branding?.[field] ?? ""]));
}

export default function AdminSettings() {
  usePageTitle("Platform settings");
  const toast = useToast();
  const { refresh } = useBranding();
  const [state, setState] = useState({ loading: true, error: "", branding: null, defaults: null });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/admin/settings");
      setState({ loading: false, error: "", branding: data.branding, defaults: data.defaults });
      setForm(pick(data.branding));
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "Platform settings could not be loaded."), branding: null, defaults: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = Object.fromEntries(FIELDS.map((field) => [field, form[field]]));
      payload.showDemoNotice = Boolean(payload.showDemoNotice);
      const { data } = await api.put("/admin/settings", payload);
      setState((current) => ({ ...current, branding: data.branding }));
      setForm(pick(data.branding));
      await refresh();
      toast.success("Settings saved", "Public branding updates immediately across the marketplace.");
    } catch (error) {
      setFormError(getApiMessage(error, "The settings could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  if (state.loading && !form) return <LoadingBlock label="Loading platform settings" />;
  if (state.error && !form) return <ErrorState message={state.error} onRetry={load} />;
  if (!form) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Platform settings"
        description="Control the public brand copy shown across the marketplace. Changes are applied through the public settings API after saving."
      />

      <form onSubmit={save} className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Panel title="Identity" description="The core name and contact details used across public pages.">
            <div className="space-y-4">
              {formError ? <FormError>{formError}</FormError> : null}
              <Field label="Site name" htmlFor="site-name" required>
                <Input
                  id="site-name"
                  value={form.siteName}
                  onChange={(event) => update("siteName", event.target.value)}
                  maxLength={60}
                  required
                />
              </Field>
              <Field label="Tagline" htmlFor="site-tagline" hint="Short supporting line used in metadata and headers.">
                <Input
                  id="site-tagline"
                  value={form.tagline}
                  onChange={(event) => update("tagline", event.target.value)}
                  maxLength={200}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Support email" htmlFor="support-email" required>
                  <Input
                    id="support-email"
                    type="email"
                    value={form.supportEmail}
                    onChange={(event) => update("supportEmail", event.target.value)}
                    required
                  />
                </Field>
                <Field label="Support phone" htmlFor="support-phone" hint="Optional.">
                  <Input
                    id="support-phone"
                    value={form.supportPhone}
                    onChange={(event) => update("supportPhone", event.target.value)}
                    maxLength={40}
                  />
                </Field>
              </div>
              <Field label="Location line" htmlFor="support-location">
                <Input
                  id="support-location"
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                  maxLength={160}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Homepage hero" description="The first message customers read on the landing page.">
            <div className="space-y-4">
              <Field label="Headline" htmlFor="hero-headline">
                <TextArea
                  id="hero-headline"
                  rows={2}
                  value={form.heroHeadline}
                  onChange={(event) => update("heroHeadline", event.target.value)}
                  maxLength={200}
                />
              </Field>
              <Field label="Subline" htmlFor="hero-subline">
                <TextArea
                  id="hero-subline"
                  rows={3}
                  value={form.heroSubline}
                  onChange={(event) => update("heroSubline", event.target.value)}
                  maxLength={400}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Demo content disclosure" description="Seeded demo profiles, reviews, and inquiries are fictional.">
            <Checkbox
              label="Show the demo content notice on the public site"
              description="Keep this enabled while seeded demonstration data is present so visitors never mistake demo reviews or profiles for real transactions."
              checked={Boolean(form.showDemoNotice)}
              onChange={(event) => update("showDemoNotice", event.target.checked)}
            />
          </Panel>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" icon={Save} loading={saving}>
              Save settings
            </Button>
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={() => {
                setForm(pick(state.branding));
                setFormError("");
              }}
              disabled={saving}
            >
              Discard changes
            </Button>
            {state.defaults ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setForm(pick(state.defaults));
                  setFormError("");
                }}
                disabled={saving}
              >
                Load defaults
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="Live preview" description="Approximate rendering of the public hero copy.">
            <div className="rounded-xl border border-white/8 bg-gradient-to-br from-brand-500/10 via-ink-900 to-ink-900 p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-300">{form.siteName}</p>
              <p className="mt-3 font-serif text-2xl leading-tight text-white">{form.heroHeadline || "Your headline"}</p>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{form.heroSubline || form.tagline}</p>
              <div className="mt-4 border-t border-white/10 pt-3 text-[10px] text-slate-500">
                <p>{form.supportEmail || "support email"}</p>
                <p>{form.location}</p>
              </div>
            </div>
          </Panel>

          <Panel title="How this is stored">
            <p className="text-[11px] leading-relaxed text-slate-500">
              Settings are persisted in the database under the <code className="text-slate-400">branding</code> key and
              served through <code className="text-slate-400">GET /api/settings/public</code>. No secrets belong here.
            </p>
            <p className="mt-3 border-t border-white/8 pt-3 text-[10px] text-slate-600">
              Saving writes an audit entry and refreshes the public brand context for this session.
            </p>
          </Panel>
        </div>
      </form>
    </div>
  );
}
