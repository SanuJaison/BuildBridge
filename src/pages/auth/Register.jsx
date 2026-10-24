import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Building2, Check, Code2, Layers3, Sparkles, UserRound, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import Button from "../../components/ui/Button";
import { Checkbox, Field, FormError, Input, PasswordInput } from "../../components/ui/Form";

const PROVIDER_TYPES = [
  {
    value: "freelancer",
    label: "Freelancer",
    description: "Independent specialist or consultant",
    icon: UserRound,
  },
  {
    value: "developer",
    label: "Developer",
    description: "Engineer building software products",
    icon: Code2,
  },
  {
    value: "company",
    label: "Company",
    description: "A registered company offering services",
    icon: Building2,
  },
  {
    value: "agency",
    label: "Agency",
    description: "A multi-disciplinary service agency",
    icon: Layers3,
  },
  {
    value: "studio",
    label: "Studio",
    description: "A product, design, or game studio",
    icon: Sparkles,
  },
];

const ORG_TYPES = new Set(["company", "agency", "studio"]);

export default function Register() {
  usePageTitle("Create your account");
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get("role") === "provider" ? "provider" : "customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    providerType: "freelancer",
    companyName: "",
  });
  const [joinTeam, setJoinTeam] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedRole = searchParams.get("role");
    if (requestedRole === "provider") setRole("provider");
  }, [searchParams]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const isOrganization = role === "provider" && !joinTeam && ORG_TYPES.has(form.providerType);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const localErrors = {};
    if (form.password.length < 8) localErrors.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) localErrors.confirmPassword = "The passwords do not match.";
    if (isOrganization && !form.companyName.trim()) localErrors.companyName = "Enter your organization name.";
    if (!accepted) localErrors.terms = "Please accept the terms and privacy policy to continue.";
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        ...(role === "provider"
          ? joinTeam
            ? { joinTeam: true }
            : { providerType: form.providerType }
          : {}),
        ...(isOrganization ? { companyName: form.companyName.trim() } : {}),
      };
      const account = await register(payload);
      toast.success("Account created", "Your BuildBridge workspace is ready.");
      if (account.user.role === "provider") {
        navigate(joinTeam ? "/dashboard/team" : "/dashboard/provider/profile", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (submitError) {
      setError(getApiMessage(submitError, "We could not create your account."));
      setFieldErrors(getFieldErrors(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="eyebrow">Create an account</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Join the right side of the build.</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
        {role === "provider"
          ? "Set up a provider workspace and show ambitious teams what you can make."
          : "Find specialists, share a brief, and keep your next project moving."}
      </p>

      <div className="mt-6 grid grid-cols-2 rounded-xl border border-white/10 bg-ink-900/70 p-1">
        {[
          { value: "customer", label: "I'm hiring" },
          { value: "provider", label: "I'm offering services" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setRole(option.value);
              if (option.value !== "provider") setJoinTeam(false);
              setError("");
            }}
            className={`rounded-lg px-3 py-2.5 text-xs font-medium transition ${
              role === option.value ? "bg-white/8 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        {error ? <FormError>{error}</FormError> : null}

        {role === "provider" ? (
          <div>
            {joinTeam ? (
              <div className="rounded-xl border border-brand-400/30 bg-brand-500/[0.07] p-3.5">
                <div className="flex items-start gap-2.5">
                  <Users size={16} className="mt-0.5 shrink-0 text-brand-300" />
                  <div>
                    <p className="text-xs font-semibold text-white">Teammate account</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                      Use the email your organization owner will invite. No public profile is created; your team workspace
                      unlocks after you accept the invitation on the Team page.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setJoinTeam(false);
                    setError("");
                  }}
                  className="mt-2.5 text-[11px] font-medium text-brand-300 transition hover:text-brand-200"
                >
                  I need my own provider profile instead
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="label-base">Provider type</span>
                  <button
                    type="button"
                    onClick={() => {
                      setJoinTeam(true);
                      setError("");
                    }}
                    className="text-[10px] font-medium text-brand-300 transition hover:text-brand-200"
                  >
                    Joining an existing team?
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PROVIDER_TYPES.map(({ value, label, description, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setForm((current) => ({ ...current, providerType: value }));
                        setFieldErrors((current) => ({ ...current, providerType: undefined }));
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        form.providerType === value
                          ? "border-brand-400/50 bg-brand-500/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      }`}
                      aria-pressed={form.providerType === value}
                    >
                      <Icon size={15} className={form.providerType === value ? "text-brand-300" : "text-slate-500"} />
                      <span className="mt-2 block text-[11px] font-semibold text-white">{label}</span>
                      <span className="mt-0.5 block text-[9px] leading-snug text-slate-500">{description}</span>
                    </button>
                  ))}
                </div>
                {fieldErrors.providerType ? <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.providerType}</p> : null}
              </>
            )}
          </div>
        ) : null}

        {isOrganization ? (
          <Field label="Organization name" htmlFor="companyName" error={fieldErrors.companyName} required>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={update("companyName")}
              placeholder="Northwind Studio"
              invalid={Boolean(fieldErrors.companyName)}
              required
            />
          </Field>
        ) : null}

        <Field label={role === "provider" ? "Your name" : "Full name"} htmlFor="name" error={fieldErrors.name} required>
          <Input
            id="name"
            autoComplete="name"
            value={form.name}
            onChange={update("name")}
            placeholder="Alex Morgan"
            invalid={Boolean(fieldErrors.name)}
            required
          />
        </Field>

        <Field label="Email address" htmlFor="email" error={fieldErrors.email} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@company.com"
            invalid={Boolean(fieldErrors.email)}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" error={fieldErrors.password} required hint="At least 8 characters.">
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              invalid={Boolean(fieldErrors.password)}
              required
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={fieldErrors.confirmPassword} required>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              invalid={Boolean(fieldErrors.confirmPassword)}
              required
            />
          </Field>
        </div>

        <div>
          <Checkbox
            checked={accepted}
            onChange={(event) => {
              setAccepted(event.target.checked);
              setFieldErrors((current) => ({ ...current, terms: undefined }));
            }}
            label={
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-brand-300 hover:text-brand-200">
                  terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-brand-300 hover:text-brand-200">
                  privacy policy
                </Link>
                .
              </span>
            }
          />
          {fieldErrors.terms ? <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.terms}</p> : null}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
          {!loading ? <ArrowRight size={15} /> : null}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-300 transition hover:text-brand-200">
          Sign in
        </Link>
      </p>

      {role === "provider" ? (
        <div className="mt-6 rounded-xl border border-white/8 bg-white/[0.025] p-3.5 text-[10px] leading-relaxed text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Check size={11} className="text-mint-400" />
            {joinTeam
              ? "Invitations appear on your team page."
              : "Company, agency, and studio accounts include a team workspace."}
          </span>
          <p className="mt-1.5">
            {joinTeam
              ? "You will not appear in the marketplace until you accept an invitation from an organization workspace."
              : "New provider profiles start as drafts. Add your details and publish when you are ready to be discovered."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
