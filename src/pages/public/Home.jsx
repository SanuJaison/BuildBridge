import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Compass,
  FileSignature,
  LockKeyhole,
  MapPin,
  MessagesSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import { money, POPULAR_SEARCHES, PROVIDER_TYPE_LABELS, compactNumber } from "../../lib/format";
import { useBranding } from "../../contexts/BrandingContext";
import usePageTitle from "../../hooks/usePageTitle";
import SectionHeader from "../../components/public/SectionHeader";
import CategoryIcon from "../../components/public/CategoryIcon";
import ProviderCard from "../../components/public/ProviderCard";
import ServiceCard from "../../components/public/ServiceCard";
import ProjectCard from "../../components/public/ProjectCard";
import ReviewCard from "../../components/public/ReviewCard";
import Accordion from "../../components/public/Accordion";
import { Avatar, Artwork } from "../../components/ui/Avatar";
import { Badge, Rating } from "../../components/ui/Badge";
import Button, { buttonClass } from "../../components/ui/Button";
import { ErrorState, LoadingBlock } from "../../components/ui/Feedback";

gsap.registerPlugin(ScrollTrigger);

const TALENT_TABS = [
  { key: "all", label: "All talent" },
  { key: "independent", label: "Independent" },
  { key: "teams", label: "Agencies & studios" },
];

const FAQS = [
  {
    question: "Is BuildBridge free to use?",
    answer:
      "Browsing profiles, exploring services, and sending inquiries are free. This demo build does not process payments, hold funds, or charge commissions. Any pricing shown on a proposal is a record of what the provider proposed, not a transaction.",
  },
  {
    question: "How are providers reviewed?",
    answer:
      "Provider profiles can carry a verification mark set by an administrator. In this demo environment, all profiles, portfolio pieces, and reviews are fictional sample data created to show how the marketplace works. Real moderation actions are available in the admin dashboard.",
  },
  {
    question: "Can I message a provider before starting?",
    answer:
      "Yes. Send a project inquiry and a private conversation is opened alongside it. You can ask questions, share files, and explore fit before accepting anything. Attachments are only accessible to you, the provider, and administrators when needed for moderation.",
  },
  {
    question: "What happens when I accept a proposal?",
    answer:
      "Accepting records an agreement in principle on the platform and opens up the conversation for delivery. It is not a payment confirmation or a legal contract. You mark the engagement complete when the work is done, and only then can you leave a review.",
  },
  {
    question: "Who can leave a review?",
    answer:
      "Only the customer on a completed engagement can publish one review per engagement. Reviews are tied to the underlying engagement record, and providers cannot write reviews for themselves.",
  },
  {
    question: "Can agencies and studios manage a team?",
    answer:
      "Yes. Company, agency, and studio accounts receive an organization workspace. Owners and admins can invite provider accounts, assign member roles, and collaborate on services, portfolio, inquiries, and messages. Profile and organization settings stay restricted to managers.",
  },
];

const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    title: "Reviews with receipts",
    body: "Reviews can only be submitted by the customer of a completed engagement. No reviews in the demo are presented as real marketplace activity.",
  },
  {
    icon: LockKeyhole,
    title: "Private by default",
    body: "Inquiries, attachments, and conversations are scoped to the people involved. Private files are served only after an access check.",
  },
  {
    icon: ShieldCheck,
    title: "Visible moderation",
    body: "Administrators can review reports, moderate reviews and profiles, suspend accounts, and leave an audit trail of sensitive actions.",
  },
  {
    icon: MessagesSquare,
    title: "One clear thread",
    body: "Briefs, proposals, status changes, and messages live together so decisions do not disappear into email threads.",
  },
];

function HeroVisual({ provider, project }) {
  if (!provider) {
    return (
      <div className="relative mx-auto w-full max-w-[430px]">
        <div className="surface h-[470px] animate-pulse rounded-[26px]" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[460px] px-2 sm:px-0">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.055]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/15 blur-[80px]" />

      <div className="hero-visual relative z-10">
        <div className="rotate-[-1.5deg]">
          <div className="hero-float card-sheen overflow-hidden rounded-[26px] border border-white/12 bg-ink-850/95 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="relative h-44 overflow-hidden">
              <Artwork
                src={provider.coverImage}
                alt=""
                label={provider.primaryCategory?.name}
                icon={(props) => <CategoryIcon name={provider.primaryCategory?.icon} {...props} />}
                rounded="rounded-none"
                className="absolute inset-0 h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/25 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-ink-950/55 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur">
                <Sparkles size={11} className="text-brand-300" />
                Featured specialist
              </div>
              <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-ink-950/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/75 backdrop-blur">
                {PROVIDER_TYPE_LABELS[provider.type]}
              </span>
            </div>

            <div className="relative px-5 pb-5">
              <div className="-mt-8 flex items-end justify-between">
                <Avatar src={provider.avatar} name={provider.displayName} size="2xl" ring />
                <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Available
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <h3 className="text-lg font-semibold tracking-tight text-white">{provider.displayName}</h3>
                {provider.verified ? <BadgeCheck size={16} className="text-sky-300" /> : null}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{provider.headline}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {(provider.skills || []).slice(0, 4).map((skill) => (
                  <span key={skill} className="chip px-2 py-1 text-[10px]">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                <div className="flex items-center gap-4">
                  <Rating value={provider.ratingAvg} count={provider.ratingCount} />
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin size={10} />
                    {provider.location?.split(",")[0] || "Remote"}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white">
                  {provider.startingBudget ? `From ${money(provider.startingBudget, provider.currency)}` : "Let's talk"}
                </span>
              </div>

              <Link
                to={`/providers/${provider.slug}`}
                className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-xs font-medium text-slate-200 transition hover:border-brand-300/30 hover:bg-white/[0.06] hover:text-white"
              >
                View full profile
                <ArrowUpRight size={14} className="text-brand-300" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute -right-5 top-24 hidden rotate-3 sm:block lg:-right-10">
          <div className="glass flex items-center gap-2.5 rounded-xl px-3.5 py-3 shadow-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300">
              <BadgeCheck size={16} />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-white">Verified profile</p>
              <p className="text-[9px] text-slate-500">Reviewed by moderators</p>
            </div>
          </div>
        </div>

        {project ? (
          <div className="absolute -left-4 bottom-10 hidden w-[220px] -rotate-2 md:block lg:-left-12">
            <Link
              to={`/portfolio/${project.slug}`}
              className="glass block overflow-hidden rounded-xl shadow-2xl transition hover:-translate-y-1"
            >
              <Artwork
                src={project.images?.[0]}
                alt={project.title}
                label={project.category?.name}
                rounded="rounded-none"
                className="h-24 w-full"
              />
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Recent work</p>
                <p className="mt-1 line-clamp-1 text-[11px] font-medium text-white">{project.title}</p>
              </div>
            </Link>
          </div>
        ) : null}

        <div className="absolute -bottom-5 right-4 hidden items-center gap-2 rounded-full border border-brand-300/20 bg-ink-850/90 px-3 py-2 text-[10px] text-slate-300 shadow-xl backdrop-blur sm:flex">
          <Star size={12} className="fill-amber-300 text-amber-300" />
          <span>
            <span className="font-semibold text-white">{dataOrDash(provider.ratingAvg)}</span> from{" "}
            {provider.ratingCount || 0} reviews
          </span>
        </div>
      </div>
    </div>
  );
}

function dataOrDash(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric.toFixed(1) : "New";
}

export default function Home() {
  usePageTitle("Where ambitious ideas meet proven digital talent");
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: "", data: null });
  const [query, setQuery] = useState("");
  const [talentTab, setTalentTab] = useState("all");
  const landingRef = useRef(null);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/marketplace/home");
      setState({ loading: false, error: "", data });
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "The marketplace could not be loaded."), data: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const data = state.data;
  const providers = useMemo(() => data?.featuredProviders || [], [data]);
  const categories = data?.categories || [];
  const projects = data?.recentProjects || [];
  const services = data?.recentServices || [];
  const reviews = data?.recentReviews || [];
  const stats = data?.stats;

  const filteredTalents = useMemo(() => {
    const list =
      talentTab === "independent"
        ? providers.filter((provider) => ["freelancer", "developer"].includes(provider.type))
        : talentTab === "teams"
          ? providers.filter((provider) => ["company", "agency", "studio"].includes(provider.type))
          : providers;
    return list.slice(0, 6);
  }, [providers, talentTab]);

  useEffect(() => {
    if (!data) return undefined;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .from(".hero-eyebrow", { opacity: 0, y: 16, duration: 0.55 })
          .from(".hero-line > span", { opacity: 0, yPercent: 110, duration: 0.9, stagger: 0.08 }, "-=0.25")
          .from(".hero-copy", { opacity: 0, y: 18, duration: 0.7 }, "-=0.55")
          .from(".hero-search", { opacity: 0, y: 18, duration: 0.65 }, "-=0.45")
          .from(".hero-secondary", { opacity: 0, y: 14, duration: 0.55 }, "-=0.4")
          .from(".hero-visual", { opacity: 0, y: 34, scale: 0.97, duration: 1, ease: "power2.out" }, 0.35)
          .from(".hero-proof", { opacity: 0, y: 12, duration: 0.5 }, "-=0.5");

        gsap.to(".hero-float", {
          y: -12,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        ScrollTrigger.batch("[data-reveal]", {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 26 },
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.075, ease: "power2.out", overwrite: true }
            ),
        });
      });
      return () => mm.revert();
    }, landingRef);

    return () => ctx.revert();
  }, [data]);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/providers${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return (
    <div ref={landingRef} className="overflow-hidden">
      <section className="relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-grid absolute inset-0" />
          <div className="aurora absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-600/25" />
          <div className="aurora absolute right-0 top-20 h-[380px] w-[380px] rounded-full bg-sky-500/15" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-950" />
        </div>

        <div className="container-page relative pb-10 pt-32 sm:pt-36 lg:pb-20 lg:pt-44">
          <div className="grid items-center gap-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
            <div>
              <div className="hero-eyebrow inline-flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-300/20 bg-brand-500/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                  The digital talent marketplace
                </span>
                <span className="hidden text-[10px] uppercase tracking-[0.14em] text-slate-600 sm:inline">
                  Design · Engineering · Games · Growth
                </span>
              </div>

              <h1 className="heading-xl hero-title mt-7 text-white">
                <span className="hero-line block overflow-hidden pb-1">
                  <span className="block">Build what&apos;s next.</span>
                </span>
                <span className="hero-line block overflow-hidden pb-1">
                  <span className="block">With people who&apos;ve</span>
                </span>
                <span className="hero-line block overflow-hidden pb-2">
                  <span className="serif-accent text-gradient block">done it before.</span>
                </span>
              </h1>

              <p className="hero-copy mt-6 max-w-xl text-pretty text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                {branding.heroSubline}
              </p>

              <form onSubmit={submitSearch} className="hero-search mt-8 max-w-xl">
                <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-ink-900/75 p-1.5 pl-3.5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur transition focus-within:border-brand-400/50 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]">
                  <Search size={17} className="shrink-0 text-slate-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="What are you looking to build?"
                    aria-label="Search for talent or expertise"
                    className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <Button type="submit" size="md" className="shrink-0 rounded-xl px-4">
                    <span className="hidden sm:inline">Find talent</span>
                    <ArrowUpRight size={15} className={query ? "" : "sm:hidden"} />
                  </Button>
                </div>
                <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-slate-500">
                  <span className="text-slate-600">Popular:</span>
                  {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                    <Link
                      key={term}
                      to={`/providers?q=${encodeURIComponent(term)}`}
                      className="transition hover:text-brand-300"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </form>

              <div className="hero-secondary mt-7 flex flex-wrap items-center gap-4">
                <Link to="/how-it-works" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white">
                  How BuildBridge works
                  <ArrowRight size={13} />
                </Link>
                <span className="hidden h-3 w-px bg-white/10 sm:block" />
                <Link to="/register?role=provider" className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-white">
                  Offer your services
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              <div className="hero-proof mt-9 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["aria", "marcus", "priya", "tomas"].map((key, index) => (
                    <Avatar
                      key={key}
                      src={`/static/demo/avatar-${index + 1}.svg`}
                      name={key}
                      size="sm"
                      className="border-2 border-ink-950"
                    />
                  ))}
                </div>
                <p className="max-w-[230px] text-[11px] leading-relaxed text-slate-500">
                  Specialists across 11 disciplines, ready to plug into your next build.
                </p>
              </div>
            </div>

            <div className="relative">
              <HeroVisual provider={providers[0]} project={projects[0]} />
            </div>
          </div>
        </div>

        <div className="container-page relative z-10">
          <div className="glass grid grid-cols-2 divide-white/[0.07] rounded-2xl sm:grid-cols-4 sm:divide-x">
            {[
              { label: "Specialists & teams", value: stats?.providers, suffix: "profiles" },
              { label: "Published services", value: stats?.services, suffix: "offers" },
              { label: "Completed engagements", value: stats?.completedProjects, suffix: "projects" },
              { label: "Verified reviews", value: stats?.verifiedReviews, suffix: "reviews" },
            ].map((item, index) => (
              <div key={item.label} className={`px-5 py-5 sm:px-7 ${index < 2 ? "border-b border-white/[0.07] sm:border-b-0" : ""}`}>
                <p className="text-2xl font-semibold tracking-tight text-white">
                  {state.loading ? "—" : compactNumber(item.value)}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2.5 pb-2 text-center text-[10px] text-slate-600 sm:text-right">
            {branding.showDemoNotice ? "Seeded demo marketplace data · fictional profiles and activity" : branding.tagline}
          </p>
        </div>
      </section>

      {state.error ? (
        <div className="container-page py-16">
          <ErrorState message={state.error} onRetry={load} />
        </div>
      ) : null}

      {state.loading && !data ? (
        <div className="container-page py-16">
          <LoadingBlock label="Curating the marketplace" />
        </div>
      ) : null}

      {data ? (
        <>
          <section className="border-t border-white/[0.06] section-pad">
            <div className="container-page">
              <div data-reveal>
                <SectionHeader
                  eyebrow="11 disciplines"
                  title={
                    <>
                      One place to find the specialist <span className="serif-accent text-brand-200">your idea needs.</span>
                    </>
                  }
                  description="From a first landing page to a production SaaS platform, a playable prototype, or a brand that finally feels like you. Every category is database-driven and managed by administrators."
                  action={
                    <Link to="/categories" className={buttonClass("secondary", "md")}>
                      Browse all categories
                      <ArrowUpRight size={14} />
                    </Link>
                  }
                />
              </div>

              <div data-reveal className="mt-11 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                {categories.map((category, index) => {
                  const large = index < 2;
                  return (
                    <Link
                      key={category.id}
                      to={`/categories/${category.slug}`}
                      className={`group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-brand-300/30 hover:bg-white/[0.045] ${
                        large ? "sm:col-span-2 lg:col-span-3" : "lg:col-span-2"
                      }`}
                    >
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/[0.07] blur-2xl transition group-hover:bg-brand-500/[0.12]" />
                      <div className="relative flex h-full flex-col">
                        <div className="flex items-start justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] text-brand-200">
                            <CategoryIcon name={category.icon} size={19} />
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {category.providerCount > 0 ? `${category.providerCount} providers` : "New"}
                          </span>
                        </div>
                        <h3 className={`mt-4 font-semibold tracking-tight text-white ${large ? "text-lg" : "text-sm"}`}>
                          {category.name}
                        </h3>
                        {large ? (
                          <p className="mt-2 line-clamp-2 max-w-md text-xs leading-relaxed text-slate-400">
                            {category.description}
                          </p>
                        ) : null}
                        <div className={`flex flex-wrap gap-1.5 ${large ? "mt-4" : "mt-2.5"}`}>
                          {category.children.slice(0, large ? 4 : 2).map((child) => (
                            <span key={child.id} className="chip px-2 py-0.5 text-[10px] text-slate-400">
                              {child.name}
                            </span>
                          ))}
                          {category.children.length > (large ? 4 : 2) ? (
                            <span className="px-1 py-0.5 text-[10px] text-slate-600">
                              +{category.children.length - (large ? 4 : 2)}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <span className="text-[10px] text-slate-600">{category.serviceCount} services</span>
                          <ArrowUpRight
                            size={14}
                            className="text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-300"
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="relative border-t border-white/[0.06] section-pad">
            <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-violet-600/[0.07] blur-[100px]" />
            <div className="container-page relative">
              <div data-reveal>
                <SectionHeader
                  eyebrow="Featured talent"
                  title={
                    <>
                      People who make <span className="serif-accent text-brand-200">ambitious</span> feel achievable.
                    </>
                  }
                  description="Independent specialists, product studios, and teams with a clear point of view. Compare focus, proof of work, availability, and pricing before you reach out."
                  action={
                    <Link to="/providers" className={buttonClass("secondary", "md")}>
                      Browse all talent
                      <ArrowUpRight size={14} />
                    </Link>
                  }
                />
              </div>

              <div data-reveal className="mt-8 flex flex-wrap gap-1.5">
                {TALENT_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTalentTab(tab.key)}
                    className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition ${
                      talentTab === tab.key
                        ? "border-brand-300/35 bg-brand-500/12 text-white"
                        : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div data-reveal className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTalents.map((provider) => (
                  <ProviderCard key={provider._id} provider={provider} />
                ))}
              </div>
              {!filteredTalents.length ? (
                <p className="mt-6 text-xs text-slate-500">No featured profiles in this group yet. Browse all talent to explore more.</p>
              ) : null}
            </div>
          </section>

          <section className="border-t border-white/[0.06] bg-ink-900/40 section-pad">
            <div className="container-page">
              <div data-reveal>
                <SectionHeader
                  eyebrow="High-signal services"
                  title={
                    <>
                      Clear scope. Honest pricing. <span className="serif-accent text-brand-200">Real craft.</span>
                    </>
                  }
                  description="Start with a focused offer instead of a blank page. Service packages lay out deliverables, timelines, and what the provider needs from you up front."
                  action={
                    <Link to="/services" className={buttonClass("secondary", "md")}>
                      Browse services
                      <ArrowUpRight size={14} />
                    </Link>
                  }
                />
              </div>
              <div data-reveal className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.slice(0, 6).map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-white/[0.06] section-pad">
            <div className="container-page">
              <div data-reveal>
                <SectionHeader
                  eyebrow="Recent work"
                  title={
                    <>
                      Proof over <span className="serif-accent text-brand-200">promises.</span>
                    </>
                  }
                  description="Case studies from fictional BuildBridge studios and specialists, created to demonstrate how work is presented on the platform."
                  action={
                    <Link to="/portfolio" className={buttonClass("secondary", "md")}>
                      Explore the portfolio
                      <ArrowUpRight size={14} />
                    </Link>
                  }
                />
              </div>
              <div data-reveal className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 5).map((project, index) => (
                  <div key={project._id} className={index === 0 ? "sm:col-span-2" : ""}>
                    <ProjectCard project={project} featured={index === 0} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-white/[0.06] bg-ink-900/40 section-pad">
            <div className="container-page">
              <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                <div data-reveal>
                  <p className="eyebrow">How it works</p>
                  <h2 className="mt-3 heading-lg text-white">
                    From a hunch to a <span className="serif-accent text-brand-200">real build.</span>
                  </h2>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
                    BuildBridge keeps the messy middle of finding and working with a specialist in one place. No
                    drawn-out sales process. No mystery about who is behind a profile.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/how-it-works" className={buttonClass("primary", "md")}>
                      See the full process
                      <ArrowRight size={14} />
                    </Link>
                    <Link to="/start-project" className={buttonClass("ghost", "md")}>
                      Start a brief
                    </Link>
                  </div>
                  <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                      <Compass size={16} className="text-brand-300" />
                      <p className="mt-3 text-xs font-medium text-white">Curated discovery</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Search by skill, category, and budget.</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                      <MessagesSquare size={16} className="text-mint-400" />
                      <p className="mt-3 text-xs font-medium text-white">One conversation</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Briefs, proposals, and messages together.</p>
                    </div>
                  </div>
                </div>

                <div data-reveal className="relative">
                  <div className="absolute left-[27px] top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-brand-400/40 via-white/10 to-transparent" />
                  {[
                    {
                      number: "01",
                      title: "Find the fit, not just the résumé",
                      body: "Browse profiles by discipline and compare services, work, availability, and reviews from completed engagements.",
                      icon: Compass,
                      link: { label: "Explore talent", to: "/providers" },
                    },
                    {
                      number: "02",
                      title: "Put the brief in one place",
                      body: "Share goals, scope, budget range, and private references. Add up to three attachments that only the provider can open.",
                      icon: FileSignature,
                      link: { label: "Write a brief", to: "/start-project" },
                    },
                    {
                      number: "03",
                      title: "Agree, build, and close the loop",
                      body: "Review a clear proposal, keep delivery in the conversation, and mark the engagement complete when the work lands. Reviews come after.",
                      icon: ShieldCheck,
                      link: { label: "See how trust works", to: "/trust" },
                    },
                  ].map((step) => (
                    <div key={step.number} className="relative flex gap-6 pb-10 last:pb-0">
                      <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-ink-850 font-serif text-xl italic text-brand-200">
                        {step.number}
                      </span>
                      <div className="pt-1">
                        <h3 className="text-base font-semibold text-white">{step.title}</h3>
                        <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-400">{step.body}</p>
                        <Link
                          to={step.link.to}
                          className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-brand-300 transition hover:text-brand-200"
                        >
                          {step.link.label}
                          <ArrowUpRight size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-white/[0.06] section-pad">
            <div className="container-page">
              <div data-reveal className="gradient-border relative overflow-hidden rounded-[26px] p-7 sm:p-10 lg:p-14">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-600/15 blur-[90px]" />
                <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                  <div>
                    <p className="eyebrow">Why BuildBridge</p>
                    <h2 className="mt-3 heading-md text-white">
                      Trust, without the <span className="serif-accent text-brand-200">theatre.</span>
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                      A marketplace should make the important things visible: who did the work, what was agreed, and
                      what happens next. We show our seams instead of inventing a perfect marketplace story.
                    </p>
                    <Link to="/trust" className={buttonClass("secondary", "md", "mt-6")}>
                      Read our trust approach
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
                      <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand-200">
                          <Icon size={16} />
                        </span>
                        <h3 className="mt-3.5 text-xs font-semibold text-white">{title}</h3>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {reviews.length ? (
            <section className="border-t border-white/[0.06] bg-ink-900/40 section-pad">
              <div className="container-page">
                <div data-reveal>
                  <SectionHeader
                    eyebrow="Client feedback"
                    title={
                      <>
                        Reviews that are tied to <span className="serif-accent text-brand-200">actual work.</span>
                      </>
                    }
                    description="Every published review is associated with a completed engagement. The reviews below are part of the seeded demo data, not real client testimonials."
                  />
                </div>
                <div data-reveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="border-t border-white/[0.06] section-pad">
            <div className="container-page">
              <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                <div data-reveal>
                  <p className="eyebrow">Questions, answered</p>
                  <h2 className="mt-3 heading-lg text-white">
                    Before you <span className="serif-accent text-brand-200">reach out.</span>
                  </h2>
                  <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
                    Clear expectations make better collaborations. If your question is not here, the team is one message
                    away.
                  </p>
                  <Link to="/contact" className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 hover:text-brand-200">
                    Contact the team <ArrowUpRight size={13} />
                  </Link>
                </div>
                <div data-reveal>
                  <Accordion items={FAQS} />
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden border-t border-white/[0.06] py-20 lg:py-28">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(124,58,237,0.28),transparent_55%)]" />
              <div className="absolute left-1/2 top-10 h-64 w-[720px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[100px]" />
            </div>
            <div className="container-page relative text-center">
              <div data-reveal className="mx-auto max-w-3xl">
                <Badge tone="violet" className="mx-auto">
                  <Sparkles size={11} />
                  A more considered way to build
                </Badge>
                <h2 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  Your next build starts with a <span className="serif-accent text-gradient">conversation.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400">
                  Find the right specialist, share the brief, and make progress without the usual noise. BuildBridge is
                  free to explore in this demo.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/providers" className={buttonClass("primary", "lg")}>
                    Find your next collaborator
                    <ArrowUpRight size={15} />
                  </Link>
                  <Link to="/register?role=provider" className={buttonClass("secondary", "lg")}>
                    Join as a provider
                  </Link>
                </div>
                <p className="mt-5 text-[10px] text-slate-600">
                  Demo environment · No payment processing · Seeded sample data
                </p>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
