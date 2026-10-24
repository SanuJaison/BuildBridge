import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Code2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Target,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { Avatar, Artwork } from "../../components/ui/Avatar";
import { Badge, Rating } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import CategoryIcon from "../../components/public/CategoryIcon";
import ProjectCard from "../../components/public/ProjectCard";
import ReportModal from "../../components/public/ReportModal";
import { PROVIDER_TYPE_LABELS, formatDate } from "../../lib/format";

export default function ProjectDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: "", notFound: false, data: null });
  const [activeImage, setActiveImage] = useState(0);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get(`/portfolio/${slug}`);
      setState({ loading: false, error: "", notFound: false, data });
      setActiveImage(0);
    } catch (error) {
      setState({
        loading: false,
        error: getApiMessage(error, "This case study could not be loaded."),
        notFound: error?.response?.status === 404,
        data: null,
      });
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const project = state.data?.project;
  usePageTitle(project ? `${project.title} · Case study` : "Case study");

  if (state.loading) {
    return (
      <div className="container-page pt-32">
        <LoadingBlock label="Loading case study" />
      </div>
    );
  }

  if (state.error || !project) {
    return (
      <div className="container-page pb-16 pt-32">
        <ErrorState
          title={state.notFound ? "This case study is not available" : "We couldn't load this case study"}
          message={state.notFound ? "It may have been unpublished. Explore the public portfolio instead." : state.error}
          onRetry={state.notFound ? undefined : load}
        />
        <div className="mt-5 text-center">
          <Link to="/portfolio" className={buttonClass("secondary", "md")}>
            Explore the portfolio
          </Link>
        </div>
      </div>
    );
  }

  const { provider, related = [], providerProjects = [] } = state.data;
  const images = project.images?.length ? project.images : [];
  const inquiryHref = `/start-project?provider=${provider.slug}`;
  const projectDetails = [
    { label: "Provider", value: provider.displayName },
    { label: "Role", value: project.role || "Not specified" },
    { label: "Client", value: project.clientName || "Confidential demo project" },
    { label: "Completed", value: project.completionDate ? formatDate(project.completionDate) : "In progress" },
    { label: "Category", value: project.category?.name || "Digital project" },
    {
      label: "Subcategory",
      value: project.subcategory?.name || "—",
    },
  ];

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="container-page">
        <Breadcrumbs
          items={[
            { label: "Portfolio", to: "/portfolio" },
            ...(project.category ? [{ label: project.category.name, to: `/categories/${project.category.slug}` }] : []),
            { label: project.title },
          ]}
          className="mb-6"
        />

        <header className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            {project.category ? <Badge tone="violet">{project.category.name}</Badge> : null}
            {project.featured ? <Badge tone="amber">Featured work</Badge> : null}
            <span className="text-[11px] text-slate-500">{formatDate(project.createdAt)}</span>
          </div>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
            {project.title}
          </h1>
          {project.summary ? (
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-400">{project.summary}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link to={`/providers/${provider.slug}`} className="group flex items-center gap-3">
              <Avatar src={provider.avatar} name={provider.displayName} size="md" />
              <span>
                <span className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-brand-200">
                  {provider.displayName}
                  {provider.verified ? <BadgeCheck size={12} className="text-sky-300" /> : null}
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  {PROVIDER_TYPE_LABELS[provider.type] || provider.type} · {provider.location || "Remote"}
                </span>
              </span>
            </Link>
            <Rating value={provider.ratingAvg} count={provider.ratingCount} size={11} />
          </div>
        </header>

        <div className="mt-9">
          <div className="overflow-hidden rounded-2xl border border-white/[0.09]">
            <Artwork
              src={images[activeImage]}
              alt={project.title}
              label={project.category?.name}
              icon={(props) => <CategoryIcon name={project.category?.icon} {...props} />}
              rounded="rounded-none"
              className="aspect-[16/9] w-full"
            />
          </div>
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${
                    activeImage === index ? "border-brand-300/60" : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Artwork src={image} alt="" rounded="rounded-none" className="h-full w-full" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div className="min-w-0">
            <section>
              <h2 className="heading-md text-white">
                The <span className="serif-accent text-brand-200">brief.</span>
              </h2>
              <div className="prose-lite mt-5">
                {project.description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {project.outcomes ? (
              <section className="mt-10">
                <div className="gradient-border rounded-2xl p-6">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-mint-300">
                    <Target size={13} />
                    Outcomes
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">{project.outcomes}</p>
                </div>
              </section>
            ) : null}

            {project.technologies?.length || project.skills?.length ? (
              <section className="mt-10">
                <h2 className="heading-md text-white">Tools & skills</h2>
                <div className="mt-5 space-y-4">
                  {project.technologies?.length ? (
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Technologies</h3>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="chip border-brand-300/20 bg-brand-500/[0.07] px-2.5 py-1 text-[11px] text-brand-200">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {project.skills?.length ? (
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Skills applied</h3>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {project.skills.map((skill) => (
                          <span key={skill} className="chip px-2.5 py-1 text-[11px] text-slate-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className="mt-10 surface rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={provider.avatar} name={provider.displayName} size="lg" />
                  <div>
                    <Link to={`/providers/${provider.slug}`} className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand-200">
                      {provider.displayName}
                      {provider.verified ? <BadgeCheck size={14} className="text-sky-300" /> : null}
                    </Link>
                    <p className="mt-0.5 max-w-md text-[11px] leading-relaxed text-slate-500">{provider.headline}</p>
                  </div>
                </div>
                <Link to={`/providers/${provider.slug}`} className={buttonClass("secondary", "sm")}>
                  View profile <ArrowUpRight size={12} />
                </Link>
              </div>
            </section>

            {providerProjects.length ? (
              <section className="mt-12">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="heading-md text-white">More from {provider.displayName.split(" ")[0]}</h2>
                  <Link to={`/providers/${provider.slug}`} className="text-[11px] text-brand-300 hover:text-brand-200">
                    View all work
                  </Link>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {providerProjects.map((item) => (
                    <ProjectCard key={item._id} project={{ ...item, provider }} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside>
            <div className="sticky top-24 space-y-4">
              <div className="gradient-border rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-300">Like this work?</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-white">
                  Start a conversation with {provider.displayName.split(" ")[0]}.
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  Share the problem you are solving and the outcome you want. A good brief beats a long one.
                </p>
                <Link to={inquiryHref} className={buttonClass("primary", "md", "mt-4 w-full")}>
                  <MessageSquare size={14} />
                  Send an inquiry
                </Link>
                <Link to={`/providers/${provider.slug}`} className={buttonClass("secondary", "md", "mt-2 w-full")}>
                  See profile
                </Link>
              </div>

              <div className="surface rounded-2xl p-5">
                <h2 className="text-xs font-semibold text-white">Project details</h2>
                <ul className="mt-4 space-y-3">
                  {projectDetails.map((item) => (
                    <li key={item.label} className="flex items-start justify-between gap-3">
                      <span className="text-[10px] text-slate-500">{item.label}</span>
                      <span className="max-w-[170px] text-right text-[11px] text-slate-300">{item.value}</span>
                    </li>
                  ))}
                </ul>

                {project.liveUrl || project.repoUrl ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="chip px-2.5 py-1 text-[10px] text-slate-300 transition hover:border-brand-300/30 hover:text-white"
                      >
                        <ExternalLink size={10} /> Live site
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="chip px-2.5 py-1 text-[10px] text-slate-300 transition hover:border-brand-300/30 hover:text-white"
                      >
                        <Code2 size={10} /> Repository
                      </a>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3.5">
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <CalendarDays size={11} />
                    {project.completionDate ? formatDate(project.completionDate) : "Ongoing"}
                  </span>
                  <ReportModal targetType="portfolio" targetId={project._id} label="Report" />
                </div>
              </div>

              <div className="rounded-xl border border-mint-400/15 bg-mint-400/[0.03] px-4 py-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-mint-300">
                  <ShieldCheck size={11} />
                  Demo disclosure
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
                  This case study is part of the seeded BuildBridge demo dataset. It is fictional sample work, not a
                  verified client engagement.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="mt-16 border-t border-white/[0.07] pt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">More in {project.category?.name || "this space"}</p>
                <h2 className="mt-2 heading-md text-white">Related case studies</h2>
              </div>
              <Link to={`/portfolio?category=${project.category?.slug || ""}`} className={buttonClass("secondary", "sm")}>
                Browse all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item._id} project={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
