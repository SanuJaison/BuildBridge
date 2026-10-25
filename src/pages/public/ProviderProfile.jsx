import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  Globe2,
  Languages,
  Link2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Avatar, Artwork } from "../../components/ui/Avatar";
import { AvailabilityBadge, Badge, Rating } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import CategoryIcon from "../../components/public/CategoryIcon";
import FavoriteButton from "../../components/public/FavoriteButton";
import ReportModal from "../../components/public/ReportModal";
import ReviewCard from "../../components/public/ReviewCard";
import ServiceCard from "../../components/public/ServiceCard";
import ProjectCard from "../../components/public/ProjectCard";
import SectionHeader from "../../components/public/SectionHeader";
import { PROVIDER_TYPE_LABELS, formatDate, money } from "../../lib/format";
import { roleMeta } from "../../lib/providerRoles";

function ratingLabel(value) {
  const numeric = Number(value) || 0;
  if (numeric >= 4.8) return "Exceptional";
  if (numeric >= 4.5) return "Excellent";
  if (numeric >= 4) return "Great";
  if (numeric >= 3) return "Good";
  return "New profile";
}

export default function ProviderProfile() {
  const { slug } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, error: "", data: null, notFound: false });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get(`/providers/${slug}`);
      setState({ loading: false, error: "", data, notFound: false });
    } catch (error) {
      setState({
        loading: false,
        error: getApiMessage(error, "This profile could not be loaded."),
        data: null,
        notFound: error?.response?.status === 404,
      });
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const provider = state.data?.provider;
  const providerRoles = (provider?.roles || []).map(roleMeta).filter(Boolean);
  usePageTitle(provider ? `${provider.displayName} · ${PROVIDER_TYPE_LABELS[provider.type] || "Talent"}` : "Provider profile");

  const isOwnProfile = Boolean(provider && user && String(provider.user) === String(user._id));

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: provider?.displayName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", "The profile link is on your clipboard.");
    } catch {
      toast.info("Profile URL", url);
    }
  };

  if (state.loading) {
    return (
      <div className="container-page pt-32">
        <LoadingBlock label="Loading provider profile" />
      </div>
    );
  }

  if (state.error || !provider) {
    return (
      <div className="container-page pb-16 pt-32">
        <ErrorState
          title={state.notFound ? "This profile is not available" : "We couldn't load this profile"}
          message={
            state.notFound
              ? "The provider may be unpublished, suspended, or the link may be incorrect. Explore other specialists instead."
              : state.error
          }
          onRetry={state.notFound ? undefined : load}
        />
        <div className="mt-5 text-center">
          <Link to="/providers" className={buttonClass("secondary", "md")}>
            Browse talent
          </Link>
        </div>
      </div>
    );
  }

  const { services = [], projects = [], reviews = [], ratingBreakdown = {}, teamCount = 0, related = [] } = state.data;
  const inquiryHref = `/start-project?provider=${provider.slug}`;
  const details = [
    { icon: MapPin, label: "Location", value: provider.location || "Remote-first" },
    { icon: Globe2, label: "Working style", value: provider.remote ? "Remote & on-site" : "On-site preferred" },
    { icon: Briefcase, label: "Experience", value: provider.experienceYears ? `${provider.experienceYears} years` : "New to BuildBridge" },
    {
      icon: Users,
      label: provider.organization ? "Team" : "Team size",
      value: provider.organization
        ? `${teamCount} active ${teamCount === 1 ? "member" : "members"}`
        : provider.teamSize
          ? `${provider.teamSize} people`
          : "Independent",
    },
    { icon: CalendarDays, label: "Member since", value: formatDate(provider.createdAt, { month: "long", year: "numeric", day: undefined }) },
  ];

  const links = [
    { icon: Globe2, label: "Website", href: provider.website },
    { icon: Code2, label: "GitHub", href: provider.githubUrl },
    { icon: Briefcase, label: "LinkedIn", href: provider.linkedinUrl },
    { icon: Link2, label: "Portfolio", href: provider.portfolioUrl },
  ].filter((link) => link.href);

  const totalReviews = Number(provider.ratingCount) || 0;

  return (
    <div className="pb-20">
      <section className="relative">
        <div className="relative h-52 overflow-hidden sm:h-64 lg:h-72">
          <Artwork
            src={provider.coverImage}
            alt=""
            label={provider.primaryCategory?.name}
            icon={(props) => <CategoryIcon name={provider.primaryCategory?.icon} {...props} />}
            rounded="rounded-none"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/25" />
          <div className="absolute inset-0 hero-grid opacity-40" />
        </div>

        <div className="container-page relative">
          <Breadcrumbs
            items={[{ label: "Explore talent", to: "/providers" }, { label: provider.displayName }]}
            className="-mt-48 mb-6 hidden sm:flex"
          />
          <div className="relative -mt-24 rounded-2xl border border-white/[0.09] bg-ink-900/70 p-5 backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar
                  src={provider.avatar}
                  name={provider.displayName}
                  size="2xl"
                  className="-mt-16 shrink-0 ring-4 ring-ink-950 sm:-mt-20"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="violet">{PROVIDER_TYPE_LABELS[provider.type] || provider.type}</Badge>
                    {provider.verified ? (
                      <Badge tone="blue">
                        <BadgeCheck size={11} />
                        Verified
                      </Badge>
                    ) : null}
                    {provider.featured ? <Badge tone="amber">Featured</Badge> : null}
                  </div>
                  <h1 className="mt-2.5 flex flex-wrap items-center gap-2 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                    {provider.displayName}
                    {provider.verified ? <BadgeCheck size={22} className="text-sky-300" /> : null}
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
                    {provider.headline || provider.primaryCategory?.name || "Digital specialist"}
                  </p>
                  {providerRoles.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {providerRoles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <span
                            key={role.value}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-slate-300"
                          >
                            <Icon size={11} className="text-brand-300" />
                            {role.label}
                            {role.value === provider.primaryRole ? (
                              <span className="text-[8px] uppercase tracking-wider text-slate-600">primary</span>
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                  <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={12} />
                      {provider.location || "Remote"}
                    </span>
                    <AvailabilityBadge value={provider.availability} />
                    <span className="inline-flex items-center gap-1.5">
                      <Rating value={provider.ratingAvg} count={provider.ratingCount} size={12} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <FavoriteButton providerId={provider._id} initialSaved={Boolean(state.data.isSaved)} />
                <button
                  type="button"
                  onClick={share}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 text-[11px] text-slate-300 transition hover:border-white/25 hover:text-white"
                >
                  <Link2 size={13} />
                  Share
                </button>
                {!isOwnProfile ? (
                  <Link to={inquiryHref} className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
                    <MessageSquare size={13} />
                    Contact
                  </Link>
                ) : (
                  <Link to="/dashboard/provider/profile" className={buttonClass("secondary", "sm", "hidden sm:inline-flex")}>
                    Edit profile
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-4">
              {[
                { label: "Rating", value: Number(provider.ratingAvg) > 0 ? Number(provider.ratingAvg).toFixed(1) : "New", sub: `${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}` },
                { label: "Completed", value: provider.completedProjects || 0, sub: "engagements" },
                { label: "Experience", value: provider.experienceYears ? `${provider.experienceYears}y` : "—", sub: "on the tools" },
                { label: "Response", value: provider.inquiriesCount || 0, sub: "inquiries received" },
              ].map((stat) => (
                <div key={stat.label} className="bg-ink-900/80 px-4 py-3.5">
                  <p className="text-lg font-semibold tracking-tight text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500">
                    {stat.label} · {stat.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page mt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-12">
          <div className="min-w-0 space-y-12">
            <section>
              <SectionHeader
                eyebrow="About"
                title={<>The short version.</>}
                description={provider.primaryCategory ? `Primary focus: ${provider.primaryCategory.name}` : undefined}
              />
              <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-400">
                {(provider.bio || "This provider has not added a full bio yet. Browse their services and portfolio below, or send an inquiry to learn more.").split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {provider.skills?.length ? (
                <div className="mt-7">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Skills</h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {provider.skills.map((skill) => (
                      <span key={skill} className="chip px-2.5 py-1 text-[11px] text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {provider.technologies?.length ? (
                <div className="mt-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Tools & technologies</h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {provider.technologies.map((tech) => (
                      <span key={tech} className="chip border-brand-300/20 bg-brand-500/[0.07] px-2.5 py-1 text-[11px] text-brand-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {provider.languages?.length || provider.engagementTypes?.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {provider.languages?.length ? (
                    <div className="surface rounded-xl p-4">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        <Languages size={12} />
                        Languages
                      </p>
                      <p className="mt-1.5 text-xs text-slate-300">{provider.languages.join(" · ")}</p>
                    </div>
                  ) : null}
                  {provider.engagementTypes?.length ? (
                    <div className="surface rounded-xl p-4">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        <Clock3 size={12} />
                        Engagement types
                      </p>
                      <p className="mt-1.5 text-xs text-slate-300">{provider.engagementTypes.join(" · ")}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            {services.length ? (
              <section>
                <SectionHeader
                  eyebrow="Services"
                  title={<>Ready-to-start <span className="serif-accent text-brand-200">packages.</span></>}
                  description="Each package outlines a starting price, delivery expectation, and scope. Inquiries always start a conversation rather than a transaction."
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <ServiceCard key={service._id} service={{ ...service, provider }} />
                  ))}
                </div>
              </section>
            ) : null}

            {projects.length ? (
              <section>
                <SectionHeader
                  eyebrow="Selected work"
                  title={<>Proof of <span className="serif-accent text-brand-200">craft.</span></>}
                  description={`Published portfolio work from ${provider.displayName}. All sample projects are fictional demonstrations.`}
                  action={
                    <Link to={`/portfolio?provider=${provider.slug}`} className={buttonClass("ghost", "sm")}>
                      All work <ArrowUpRight size={12} />
                    </Link>
                  }
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {projects.map((project) => (
                    <ProjectCard key={project._id} project={{ ...project, provider }} />
                  ))}
                </div>
              </section>
            ) : null}

            <section id="reviews">
              <SectionHeader
                eyebrow="Reviews"
                title={<>Feedback from <span className="serif-accent text-brand-200">completed work.</span></>}
                description="Only the customer on a completed engagement can publish a review. The reviews shown below are seeded demo records."
              />

              <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="surface h-fit rounded-2xl p-5">
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-semibold tracking-tighter text-white">
                      {Number(provider.ratingAvg) > 0 ? Number(provider.ratingAvg).toFixed(1) : "—"}
                    </p>
                    <div className="pb-1">
                      <Rating value={provider.ratingAvg} showValue={false} />
                      <p className="mt-1 text-[10px] text-slate-500">
                        {ratingLabel(provider.ratingAvg)} · {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingBreakdown[star] || 0;
                      const percent = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="flex w-7 items-center gap-0.5">
                            {star}
                            <Star size={9} className="fill-amber-300 text-amber-300" />
                          </span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <span className="block h-full rounded-full bg-amber-300/70" style={{ width: `${percent}%` }} />
                          </span>
                          <span className="w-5 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  {reviews.length ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {reviews.map((review) => (
                        <ReviewCard key={review._id} review={review} showProvider={false} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Star}
                      title="No published reviews yet"
                      description="Reviews appear here only after a customer marks a completed engagement and chooses to publish one."
                    />
                  )}
                </div>
              </div>
            </section>

            {related.length ? (
              <section>
                <SectionHeader
                  eyebrow="Similar talent"
                  title={<>Also worth a <span className="serif-accent text-brand-200">look.</span></>}
                  description={`Other ${provider.primaryCategory?.name || "digital"} specialists with published profiles.`}
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {related.map((item) => (
                    <article key={item._id} className="surface rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={item.avatar} name={item.displayName} size="md" />
                        <div className="min-w-0">
                          <Link to={`/providers/${item.slug}`} className="flex items-center gap-1 text-xs font-semibold text-white hover:text-brand-200">
                            <span className="truncate">{item.displayName}</span>
                            {item.verified ? <BadgeCheck size={11} className="shrink-0 text-sky-300" /> : null}
                          </Link>
                          <Rating value={item.ratingAvg} count={item.ratingCount} size={10} />
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{item.headline}</p>
                      <Link to={`/providers/${item.slug}`} className="mt-3 inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200">
                        View profile <ArrowRight size={11} />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="order-first space-y-4 lg:order-last">
            <div className="sticky top-24 space-y-4">
              <div className="gradient-border overflow-hidden rounded-2xl p-5">
                {!isOwnProfile ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-300">Work with {provider.displayName.split(" ")[0]}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      {provider.startingBudget ? (
                        <>
                          From {money(provider.startingBudget, provider.currency)}
                          <span className="ml-1 text-xs font-normal text-slate-500">/ project</span>
                        </>
                      ) : provider.hourlyRate ? (
                        <>
                          {money(provider.hourlyRate, provider.currency)}
                          <span className="ml-1 text-xs font-normal text-slate-500">/ hour</span>
                        </>
                      ) : (
                        "Scope-based"
                      )}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                      Share your brief, budget, and timeline. The provider will respond with a proposal if it is a fit.
                    </p>
                    <div className="mt-5 space-y-2">
                      <Link to={inquiryHref} className={buttonClass("primary", "md", "w-full")}>
                        <MessageSquare size={14} />
                        Send an inquiry
                      </Link>
                      <button
                        type="button"
                        onClick={share}
                        className={buttonClass("secondary", "md", "w-full")}
                      >
                        <Link2 size={14} />
                        Share this profile
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[10px] leading-relaxed text-slate-500">
                      <ShieldCheck size={14} className="shrink-0 text-mint-400" />
                      No payment is processed on BuildBridge. Proposals are records of agreed scope, not transactions.
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-white">This is your public profile</p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                      Keep your services, portfolio, and availability current so customers know what you offer.
                    </p>
                    <Link to="/dashboard/provider" className={buttonClass("primary", "md", "mt-4 w-full")}>
                      Open provider dashboard
                    </Link>
                  </>
                )}
              </div>

              <div className="surface rounded-2xl p-5">
                <h2 className="text-xs font-semibold text-white">Details</h2>
                <ul className="mt-4 space-y-3">
                  {details.map(({ icon: Icon, label, value }) => (
                    <li key={label} className="flex items-start gap-2.5">
                      <Icon size={13} className="mt-0.5 shrink-0 text-slate-500" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500">{label}</p>
                        <p className="text-[11px] text-slate-300">{value}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {provider.organization ? (
                  <div className="mt-4 border-t border-white/[0.07] pt-4">
                    <p className="text-[10px] text-slate-500">Part of</p>
                    <div className="mt-2 flex items-center gap-2.5">
                      {provider.organization.logo ? (
                        <img
                          src={provider.organization.logo}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-lg border border-white/10 object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-slate-200">{provider.organization.name}</p>
                        {provider.organization.location ? (
                          <p className="mt-0.5 truncate text-[10px] text-slate-500">{provider.organization.location}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {links.length ? (
                  <div className="mt-4 border-t border-white/[0.07] pt-4">
                    <p className="text-[10px] text-slate-500">Links</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {links.map(({ icon: Icon, label, href }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="chip px-2 py-1 text-[10px] text-slate-300 transition hover:border-brand-300/30 hover:text-white"
                        >
                          <Icon size={10} />
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3.5">
                  <ReportModal targetType="provider" targetId={provider._id} label="Report profile" />
                  <span className="text-[10px] text-slate-600">ID {String(provider._id).slice(-6)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-mint-400/15 bg-mint-400/[0.03] px-4 py-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-mint-300">
                  <CheckCircle2 size={11} />
                  How vetting works
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
                  Verified marks are set by platform administrators. Reviews are tied to completed engagement records.
                  Demo data is labeled throughout the marketplace.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="container-page mt-14 lg:hidden">
        <div className="surface rounded-2xl p-5">
          <p className="text-sm font-semibold text-white">Ready to talk?</p>
          <p className="mt-1 text-xs text-slate-400">Send a scoped brief and start a private conversation.</p>
          <Link to={inquiryHref} className={buttonClass("primary", "md", "mt-4 w-full")}>
            Send an inquiry <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
