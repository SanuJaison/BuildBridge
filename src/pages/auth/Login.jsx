import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import Button from "../../components/ui/Button";
import { Field, FormError, Input, PasswordInput } from "../../components/ui/Form";

const DEMO_ACCOUNTS = [
  { label: "Customer", email: "customer@buildbridge.dev", password: "Demo@12345" },
  { label: "Provider", email: "aria@buildbridge.dev", password: "Demo@12345" },
];

export default function Login() {
  usePageTitle("Sign in");
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const account = await login({ email: form.email, password: form.password });
      toast.success("Welcome back", `Signed in as ${account.user.name}.`);
      const home =
        account.user.role === "admin"
          ? "/admin"
          : account.user.role === "provider"
            ? account.providerProfile
              ? "/dashboard/provider"
              : "/dashboard/team"
            : "/dashboard";
      const destination = next && next.startsWith("/") ? next : home;
      navigate(destination, { replace: true });
    } catch (submitError) {
      setError(getApiMessage(submitError, "We could not sign you in."));
      setFieldErrors(getFieldErrors(submitError));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setError("");
    toast.info(`${account.label} demo loaded`, "Press Sign in to continue.");
  };

  return (
    <div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Sign in to BuildBridge</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
        Pick up your briefs, conversations, and saved talent where you left off.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        {error ? <FormError>{error}</FormError> : null}
        <Field label="Email address" htmlFor="email" error={fieldErrors.email} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={update("email")}
            invalid={Boolean(fieldErrors.email)}
            required
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={fieldErrors.password}
          required
          action={
            <Link to="/forgot-password" className="text-[11px] text-slate-500 transition hover:text-brand-300">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={update("password")}
            invalid={Boolean(fieldErrors.password)}
            required
          />
        </Field>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Sign in
          {!loading ? <ArrowRight size={15} /> : null}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        New to BuildBridge?{" "}
        <Link to="/register" className="font-medium text-brand-300 transition hover:text-brand-200">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.025] p-4">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          <Sparkles size={11} className="text-brand-400" />
          Demo accounts
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account)}
              className="rounded-lg border border-white/8 bg-ink-900/60 px-3 py-2 text-left transition hover:border-brand-300/30 hover:bg-white/[0.04]"
            >
              <span className="block text-[11px] font-medium text-slate-200">{account.label}</span>
              <span className="mt-0.5 block truncate text-[9px] text-slate-500">{account.email}</span>
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-[10px] leading-relaxed text-slate-600">
          Seeded demo accounts use password <span className="text-slate-400">Demo@12345</span>. Admin access is
          documented in the project README.
        </p>
      </div>
    </div>
  );
}
