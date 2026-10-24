import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import api, { getApiMessage, getFieldErrors, storeToken } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Field, FormError, FormSuccess, Input, PasswordInput, Select, TextArea } from "../../components/ui/Form";
import { ImageUploader } from "../../components/ui/Uploader";
import { PageHeader, Panel } from "../../components/dashboard/DashboardUI";
import { humanize } from "../../lib/format";

const EMPTY_FORM = {
  name: "",
  phone: "",
  company: "",
  location: "",
  website: "",
  bio: "",
  avatar: "",
  emailNotifications: true,
};

export default function Settings() {
  usePageTitle("Account settings");
  const { user, applyAccount, providerProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      company: user.company || "",
      location: user.location || "",
      website: user.website || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      emailNotifications: user.emailNotifications !== false,
    });
  }, [user]);

  const update = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaved(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaved(false);
    if (form.name.trim().length < 2) {
      setErrors({ name: "Enter at least 2 characters" });
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put("/auth/me", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar,
        emailNotifications: form.emailNotifications,
      });
      applyAccount(data);
      setSaved(true);
      toast.success("Profile saved", "Your account details have been updated.");
    } catch (error) {
      setFormError(getApiMessage(error, "Your settings could not be saved."));
      setErrors(getFieldErrors(error));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    const nextErrors = {};
    if (!password.currentPassword) nextErrors.currentPassword = "Enter your current password";
    if (password.newPassword.length < 8) nextErrors.newPassword = "Use at least 8 characters";
    if (password.newPassword !== password.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setChanging(true);
    try {
      const { data } = await api.put("/auth/password", {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      if (data.token) storeToken(data.token);
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess("Password updated. Your session stays signed in.");
      toast.success("Password updated", "Your new password is active.");
    } catch (error) {
      setPasswordError(getApiMessage(error, "Your password could not be updated."));
      setPasswordErrors(getFieldErrors(error));
    } finally {
      setChanging(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Your account"
        title="Account settings"
        description="Manage how you appear on BuildBridge, how you sign in, and what we notify you about."
      />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Panel title="Personal information" description="These details are visible only where relevant to your account.">
            <form onSubmit={saveProfile} className="space-y-5">
              {formError ? <FormError>{formError}</FormError> : null}
              {saved ? <FormSuccess>Your changes have been saved.</FormSuccess> : null}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  <Avatar src={form.avatar} name={form.name} size="2xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <ImageUploader
                    value={form.avatar}
                    onChange={(avatar) => {
                      setForm((current) => ({ ...current, avatar }));
                      setSaved(false);
                    }}
                    purpose="avatar"
                    label="Profile photo"
                    hint="JPEG, PNG, WebP, or GIF up to the upload limit. Used in the header and messages."
                    shape="avatar"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="settings-name" required error={errors.name}>
                  <Input id="settings-name" value={form.name} onChange={update("name")} invalid={Boolean(errors.name)} maxLength={80} autoComplete="name" />
                </Field>
                <Field label="Email address" htmlFor="settings-email" hint="Email changes are not available in this demo.">
                  <Input id="settings-email" value={user.email} readOnly disabled />
                </Field>
                <Field label="Phone" htmlFor="settings-phone" hint="Optional. Shown only to you and administrators.">
                  <Input id="settings-phone" value={form.phone} onChange={update("phone")} maxLength={30} autoComplete="tel" />
                </Field>
                <Field label="Company" htmlFor="settings-company">
                  <Input id="settings-company" value={form.company} onChange={update("company")} maxLength={120} autoComplete="organization" />
                </Field>
                <Field label="Location" htmlFor="settings-location">
                  <Input id="settings-location" value={form.location} onChange={update("location")} maxLength={120} autoComplete="address-level2" placeholder="City, country" />
                </Field>
                <Field label="Website" htmlFor="settings-website">
                  <Input id="settings-website" value={form.website} onChange={update("website")} maxLength={300} placeholder="https://" autoComplete="url" />
                </Field>
              </div>

              <Field label="About you" htmlFor="settings-bio" hint={`${form.bio.length}/600 characters. Kept short and shown only in account contexts.`}>
                <TextArea id="settings-bio" rows={4} value={form.bio} onChange={update("bio")} maxLength={600} placeholder="A sentence or two about you or your team." />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3">
                <input
                  type="checkbox"
                  checked={form.emailNotifications}
                  onChange={update("emailNotifications")}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-ink-900 accent-violet-500"
                />
                <span>
                  <span className="block text-xs font-medium text-slate-200">Email notifications</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                    Store your email-notification preference. This demo does not send notification emails.
                  </span>
                </span>
              </label>

              <div className="flex justify-end border-t border-white/8 pt-4">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          </Panel>

          <Panel title="Password" description="Choose a strong password you do not use elsewhere.">
            <form onSubmit={changePassword} className="space-y-4">
              {passwordError ? <FormError>{passwordError}</FormError> : null}
              {passwordSuccess ? <FormSuccess>{passwordSuccess}</FormSuccess> : null}
              <Field label="Current password" htmlFor="settings-current" required error={passwordErrors.currentPassword}>
                <PasswordInput
                  id="settings-current"
                  value={password.currentPassword}
                  onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))}
                  autoComplete="current-password"
                  invalid={Boolean(passwordErrors.currentPassword)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="New password" htmlFor="settings-new" required error={passwordErrors.newPassword} hint="At least 8 characters.">
                  <PasswordInput
                    id="settings-new"
                    value={password.newPassword}
                    onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))}
                    autoComplete="new-password"
                    invalid={Boolean(passwordErrors.newPassword)}
                  />
                </Field>
                <Field label="Confirm new password" htmlFor="settings-confirm" required error={passwordErrors.confirmPassword}>
                  <PasswordInput
                    id="settings-confirm"
                    value={password.confirmPassword}
                    onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))}
                    autoComplete="new-password"
                    invalid={Boolean(passwordErrors.confirmPassword)}
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] text-slate-500">Changing your password signs a fresh session token.</p>
                <Button type="submit" variant="secondary" icon={KeyRound} loading={changing}>
                  Update password
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Account">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">{user.email}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Account type</dt>
                <dd>
                  <Badge tone={user.role === "provider" ? "violet" : "blue"}>{humanize(user.role)}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Status</dt>
                <dd className="text-slate-300">{humanize(user.status || "active")}</dd>
              </div>
              {providerProfile ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Public profile</dt>
                  <dd>
                    <Link
                      to={providerProfile.status === "published" ? `/providers/${providerProfile.slug}` : "/dashboard/provider/profile"}
                      className="inline-flex items-center gap-1 text-brand-300 transition hover:text-brand-200"
                    >
                      {providerProfile.status === "published" ? "View" : "Finish setup"}
                      <ArrowUpRight size={10} />
                    </Link>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Panel>

          <Panel title="Contact preferences">
            <div className="space-y-3 text-[11px] leading-relaxed text-slate-400">
              <p className="flex items-start gap-2">
                <Mail size={13} className="mt-0.5 shrink-0 text-brand-300" />
                In-app notifications keep inquiry and message updates together. Email delivery is not enabled in this demo.
              </p>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
                <span className="text-slate-400">Email preference</span>
                <Select
                  value={form.emailNotifications ? "on" : "off"}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, emailNotifications: event.target.value === "on" }));
                    setSaved(false);
                  }}
                  className="w-28 py-1.5 text-[11px]"
                  aria-label="Email preference"
                >
                  <option value="on">Enabled</option>
                  <option value="off">Disabled</option>
                </Select>
              </label>
            </div>
          </Panel>

          <Panel title="Privacy & safety">
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-mint-400" />
              Your password is stored as a hash. Private inquiry attachments are only available to you, the provider, and
              platform administrators.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
              <Link to="/privacy" className="text-brand-300 transition hover:text-brand-200">
                Privacy details
              </Link>
              <Link to="/trust" className="text-brand-300 transition hover:text-brand-200">
                Trust & safety
              </Link>
              <Link to="/contact" className="text-brand-300 transition hover:text-brand-200">
                Contact support
              </Link>
            </div>
          </Panel>

          <Panel title="Session">
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
              <UserRound size={13} className="mt-0.5 shrink-0 text-slate-400" />
              Account deletion, email changes, and active-session management are not part of this demo build. Use the
              account menu to sign out.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
