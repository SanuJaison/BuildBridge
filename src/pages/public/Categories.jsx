import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Layers, Search, Sparkles } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import PageHero from "../../components/public/PageHero";
import CategoryIcon from "../../components/public/CategoryIcon";
import { categoryVisual } from "../../lib/categoryVisuals";
import { Input } from "../../components/ui/Form";
import { ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { buttonClass } from "../../components/ui/Button";
import SectionHeader from "../../components/public/SectionHeader";

export default function Categories() {
  usePageTitle("Browse categories");
  const [state, setState] = useState({ loading: true, error: "", tree: [] });
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then(({ data }) => {
        if (active) setState({ loading: false, error: "", tree: data.tree || [] });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: getApiMessage(error, "Categories could not be loaded."), tree: [] });
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return state.tree;
    return state.tree
      .map((category) => {
        const matchesParent =
          category.name.toLowerCase().includes(term) || category.description.toLowerCase().includes(term);
        const children = category.children.filter((child) => child.name.toLowerCase().includes(term));
        if (!matchesParent && !children.length) return null;
        return { ...category, children: matchesParent ? category.children : children };
      })
      .filter(Boolean);
  }, [state.tree, query]);

  const totalSubcategories = state.tree.reduce((sum, category) => sum + category.children.length, 0);
  const totalProviders = state.tree.reduce((sum, category) => sum + category.providerCount, 0);

  return (
    <div>
      <PageHero
        compact
        eyebrow="Categories"
        title={
          <>
            11 disciplines. <span className="serif-accent text-gradient">One marketplace.</span>
          </>
        }
        description="Every category and subcategory below is database-driven and managed by platform administrators. Start broad, then narrow to the specific skill you need."
        breadcrumbs={[{ label: "Categories" }]}
        aside={
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.06]">
            {[
              { label: "Disciplines", value: state.tree.length },
              { label: "Subcategories", value: totalSubcategories },
              { label: "Providers", value: totalProviders },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink-900/80 px-4 py-3 text-center">
                <p className="text-lg font-semibold text-white">{state.loading ? "—" : stat.value}</p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter categories and subcategories"
              aria-label="Filter categories"
              className="pl-10"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Showing {filtered.length} of {state.tree.length} disciplines
          </p>
        </div>

        {state.loading ? <LoadingBlock label="Loading the category map" /> : null}
        {state.error ? <ErrorState message={state.error} className="mt-8" /> : null}

        {!state.loading && !state.error ? (
          <div className="mt-8 space-y-4">
            {filtered.map((category, index) => (
              <article
                key={category.id}
                className="group surface relative overflow-hidden rounded-2xl p-5 transition hover:border-brand-300/25 sm:p-6"
              >
                <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-500/[0.06] blur-3xl transition group-hover:bg-brand-500/[0.1]" />
                <div className="relative grid gap-6 lg:grid-cols-[210px_0.9fr_1.5fr] lg:items-start">
                  <Link
                    to={`/categories/${category.slug}`}
                    className="group/image relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.08]"
                    data-cursor-label="Open category"
                  >
                    <img
                      src={categoryVisual(category.slug)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-80 transition duration-700 group-hover/image:scale-105 group-hover/image:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-ink-950/75 text-brand-200">
                      <CategoryIcon name={category.icon} size={15} />
                    </span>
                  </Link>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] text-brand-200">
                        <CategoryIcon name={category.icon} size={20} />
                      </span>
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
                          {String(index + 1).padStart(2, "0")} · {category.children.length} subcategories
                        </span>
                        <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-white">
                          <Link to={`/categories/${category.slug}`} className="hover:text-brand-200">
                            {category.name}
                          </Link>
                        </h2>
                      </div>
                    </div>
                    <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-400">{category.description}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                      <span>{category.providerCount} providers</span>
                      <span>{category.serviceCount} services</span>
                      <Link
                        to={`/providers?category=${category.slug}`}
                        className="inline-flex items-center gap-1 text-brand-300 transition hover:text-brand-200"
                      >
                        Explore <ArrowUpRight size={11} />
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          to={`/providers?category=${category.slug}&subcategory=${child.slug}`}
                          className="chip px-2.5 py-1.5 text-[10px] text-slate-400 transition hover:border-brand-300/30 hover:text-white"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link to={`/categories/${category.slug}`} className={buttonClass("secondary", "sm")}>
                        Category overview <ArrowRight size={12} />
                      </Link>
                      <Link to={`/services?category=${category.slug}`} className="inline-flex items-center gap-1 pt-2 text-[11px] text-slate-500 transition hover:text-white">
                        Browse services
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!state.loading && !state.error && !filtered.length ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 py-14 text-center">
            <Layers size={22} className="mx-auto text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-white">No categories match “{query}”</p>
            <p className="mt-1 text-xs text-slate-500">Try a shorter term or explore all disciplines.</p>
            <button type="button" onClick={() => setQuery("")} className={buttonClass("secondary", "sm", "mt-4")}>
              Clear filter
            </button>
          </div>
        ) : null}

        <section className="mt-14">
          <SectionHeader
            eyebrow="Not sure where to start?"
            title={
              <>
                Describe the outcome, not the <span className="serif-accent text-brand-200">job title.</span>
              </>
            }
            description="The best briefs explain the problem, the audience, and what success looks like. You do not need to know the exact category before you begin."
            action={
              <Link to="/start-project" className={buttonClass("primary", "md")}>
                <Sparkles size={14} />
                Start a project brief
              </Link>
            }
          />
        </section>
      </div>
    </div>
  );
}
