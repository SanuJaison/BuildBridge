import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import api, { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import Button from "../../components/ui/Button";
import { Field, FormError, PasswordInput } from "../../components/ui/Form";

export default function ResetPassword() {
  usePageTitle("Choose a new password");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    if (form.password !== form.confirm) {
      setFieldErrors({ confirm: "The passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      setSuccess(true);
    } catch (submitError) {
      setError(getApiMessage(submitError, "This reset link could not be used."));
      setFieldErrors(getFieldErrors(submitError));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-mint-400/20 bg-mint-400/10 text-mint-400">
          <CheckCircle2 size={22} />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">Password updated.</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Your password has been changed. Sign in with your new credentials to continue.
        </p>
        <Link to="/login" className="btn btn-primary mt-6 w-full px-4 py-3">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Almost there</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Choose a new password.</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
        Use at least eight characters. A longer, unique passphrase is even better.
      </p>

      {!token ? (
        <div className="mt-6">
          <FormError>This page is missing its reset token. Request a fresh reset link to continue.</FormError>
          <Link to="/forgot-password" className="btn btn-secondary mt-4 w-full px-4 py-3">
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          {error ? <FormError>{error}</FormError> : null}
          {fieldErrors.token ? <FormError>{fieldErrors.token}</FormError> : null}
          <Field label="New password" htmlFor="password" error={fieldErrors.password} required>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              invalid={Boolean(fieldErrors.password)}
              required
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm" error={fieldErrors.confirm} required>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(event) => setForm((current) => ({ ...current, confirm: event.target.value }))}
              invalid={Boolean(fieldErrors.confirm)}
              required
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Update password
          </Button>
        </form>
      )}

      <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <ArrowLeft size={13} />
        Back to sign in
      </Link>
    </div>
  );
}
