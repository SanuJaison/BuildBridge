import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import Button from "../../components/ui/Button";
import { Field, FormError, Input } from "../../components/ui/Form";

export default function ForgotPassword() {
  usePageTitle("Reset your password");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setResult(data);
    } catch (submitError) {
      setError(getApiMessage(submitError, "We could not start the reset process."));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-mint-400/20 bg-mint-400/10 text-mint-400">
          <MailCheck size={22} />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">Check your inbox.</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{result.message}</p>

        {result.devResetToken ? (
          <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">Development only</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-100/70">
              Email delivery is not configured in this demo, so the reset link is shown here instead.
            </p>
            <Link
              to={`/reset-password?token=${encodeURIComponent(result.devResetToken)}`}
              className="btn btn-secondary mt-3 w-full px-4 py-2.5 text-xs"
            >
              Open reset link
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : null}

        <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft size={13} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Account recovery</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Forgot your password?</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
        Enter the email tied to your account and we will send a secure reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        {error ? <FormError>{error}</FormError> : null}
        <Field label="Email address" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
          />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Send reset link
          {!loading ? <ArrowRight size={15} /> : null}
        </Button>
      </form>

      <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <ArrowLeft size={13} />
        Back to sign in
      </Link>
    </div>
  );
}
