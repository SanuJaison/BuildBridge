import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BadgeCheck, Sparkles } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import PageHero from "../../components/public/PageHero";
import CategoryIcon from "../../components/public/CategoryIcon";
import ProviderCard from "../../components/public/ProviderCard";
import ServiceCard from "../../components/public/ServiceCard";
import ProjectCard from "../../components/public/ProjectCard";
import SectionHeader from "../../components/public/SectionHeader";
import { buttonClass } from "../../components/ui/Button";
import { ErrorState, LoadingBlock } from "../../components/ui/Feedback";

export default function CategoryDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: "", notFound: false, category: null, providers: [], services: [], projects: [] });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [categoryResponse, providerResponse, serviceResponse, projectResponse] = await Promise.all([
        api.get(`/categories/${slug}`),
        api.get(`/providers?category=${encodeURIComponent(slug)}&sort=rating&limit=6`),
        api.get(`/services?category=${encodeURIComponent(slug)}&sort=popular&limit=6`),
        api.get(`/portfolio?category=${encodeURIComponent(slug)}&limit=3`),
      ]);
      setState({
        loading: false,
        error: "",
        notFound: false,
        category: categoryResponse.data.category,
        providers: providerResponse.data.items || [],
        services: serviceResponse.data.items || [],
        projects: projectResponse.data.items || [],
      });
    } catch (error) {
      setState({
        loading: false,
        error: getApiMessage(error, "This category could not be loaded."),
        notFound: error?.response?.status === 404,
        category: null,
        providers: [],
        services: [],
        projects: [],
      });
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const category = state.category;
  usePageTitle(category ? `${category.name} · Category` : "Category");

  if (state.loading) {
    return (
      <div className="container-page pt-32">
        <LoadingBlock label="Loading category" />
      </div>
    );
  }

  if (state.error || !category) {
    return (
      <div className="container-page pb-16 pt-32">
        <ErrorState
          title={state.notFound ? "This category is not available" : "We couldn't load this category"}
          message={state.notFound ? "It may have been deactivated. Explore all categories instead." : state.error}
          onRetry={state.notFound ? undefined : load}
        />
        <div className="mt-5 text-center">
          <Link to="/categories" className={buttonClass("secondary", "md")}>
            All categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow={category.parent ? category.parent.name : "Category"}
        title={
          <>
            {category.name}
          </>
        }
        description={category.description}
        breadcrumbs={[
          { label: "Categories", to: "/categories" },
          ...(category.parent ? [{ label: category.parent.name, to: `/categories/${category.parent.slug}` }] : []),
          { label: category.name },
        ]}
        aside={
          <div className="surface rounded-2xl p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.02] text-brand-200">
              <CategoryIcon name={category.icon} size={22} />
            </span>
            <div className="mt-4 grid grid-cols-2 gap-5">
              <div>
                <p className="text-xl font-semibold text-white">{category.providerCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Providers</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-white">{category.serviceCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Services</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to={`/providers?category=${category.slug}`} className={buttonClass("primary", "sm")}>
                Explore talent
              </Link>
              <Link to={`/services?category=${category.slug}`} className={buttonClass("secondary", "sm")}>
                Services
              </Link>
            </div>
          </div>
        }
      />

      {category.children.length ? (
        <div className="border-b border-white/[0.06] bg-ink-900/40">
          <div className="container-page py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Specialisations</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/providers?category=${category.slug}&subcategory=${child.slug}`}
                  className="chip px-2.5 py-1.5 text-[10px] text-slate-400 transition hover:border-brand-300/30 hover:text-white"
                >
                  {child.name}
                  {child.providerCount ? <span className="text-slate-600">{child.providerCount}</span> : null}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="container-page space-y-16 py-12 lg:space-y-20">
        <section>
          <SectionHeader
            eyebrow="Talent in this space"
            title={
              <>
                Specialists who do the <span className="serif-accent text-brand-200">work.</span>
              </>
            }
            description={`Profiles whose primary focus or subcategories sit inside ${category.name.toLowerCase()}. Compare services, work, availability, and reviews.`}
            action={
              <Link to={`/providers?category=${category.slug}`} className={buttonClass("secondary", "sm")}>
                Browse all <ArrowRight size={12} />
              </Link>
            }
          />
          {state.providers.length ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.providers.map((provider) => (
                <ProviderCard key={provider._id} provider={provider} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-white/10 px-5 py-8 text-center text-xs text-slate-500">
              No published providers in this category yet. Start a brief and the team can help route it.
            </p>
          )}
        </section>

        {state.services.length ? (
          <section>
            <SectionHeader
              eyebrow="Service packages"
              title={
                <>
                  A clear place to <span className="serif-accent text-brand-200">start.</span>
                </>
              }
              description={`Fixed-scope offers from ${category.name.toLowerCase()} specialists, with starting prices and delivery expectations.`}
              action={
                <Link to={`/services?category=${category.slug}`} className={buttonClass("secondary", "sm")}>
                  All services <ArrowRight size={12} />
                </Link>
              }
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </section>
        ) : null}

        {state.projects.length ? (
          <section>
            <SectionHeader
              eyebrow="Selected work"
              title={
                <>
                  How the work <span className="serif-accent text-brand-200">looks.</span>
                </>
              }
              description={`Case studies published in ${category.name.toLowerCase()}, from fictional demo projects in the marketplace seed data.`}
              action={
                <Link to={`/portfolio?category=${category.slug}`} className={buttonClass("secondary", "sm")}>
                  View portfolio <ArrowRight size={12} />
                </Link>
              }
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="gradient-border overflow-hidden rounded-[24px] p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="eyebrow">Still narrowing it down?</p>
                <h2 className="mt-3 heading-md text-white">
                  Send the brief and let the <span className="serif-accent text-brand-200">right fit</span> surface.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
                  Share the outcome you need, your budget range, and the timing. Providers in this category can respond
                  with a scope and proposal. No payment is processed on BuildBridge.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row lg:justify-end">
                <Link to="/start-project" className={buttonClass("primary", "md")}>
                  <Sparkles size={14} />
                  Start a brief
                </Link>
                <Link to={`/providers?category=${category.slug}`} className={buttonClass("secondary", "md")}>
                  <BadgeCheck size={14} />
                  Compare talent
                </Link>
              </div>
            </div>
          </div>
        </section>

        {category.parent ? (
          <div className="flex items-center justify-between border-t border-white/[0.07] pt-6">
            <Link to={`/categories/${category.parent.slug}`} className="text-xs text-slate-400 hover:text-white">
              ← Back to {category.parent.name}
            </Link>
            <Link to="/categories" className="inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200">
              All categories <ArrowUpRight size={12} />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
