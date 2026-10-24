import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Images, Search, SlidersHorizontal, X } from "lucide-react";
import api from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import useListing from "../../hooks/useListing";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import PageHero from "../../components/public/PageHero";
import ProjectCard from "../../components/public/ProjectCard";
import { ActiveFilters, FilterGroup } from "../../components/public/FilterGroup";
import { Checkbox, Input, Select } from "../../components/ui/Form";
import { CardSkeleton, EmptyState, ErrorState } from "../../components/ui/Feedback";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { PROVIDER_TYPES, PROVIDER_TYPE_LABELS } from "../../lib/format";

const FILTER_KEYS = ["q", "category", "providerType", "featured", "page"];

export default function BrowsePortfolio() {
  usePageTitle("Portfolio work");
  const listing = useListing("/portfolio", "The portfolio could not be loaded.");
  const { searchParams, update, items, total, page, pages, loading, error } = listing;

  const urlQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(urlQuery);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (debouncedSearch === (searchParams.get("q") || "")) return;
    update({ q: debouncedSearch.trim() });
  }, [debouncedSearch, searchParams, update]);

  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then(({ data }) => {
        if (active) setCategories(data.tree || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const category = searchParams.get("category") || "";
  const selectedTypes = useMemo(
    () => String(searchParams.get("providerType") || "").split(",").filter(Boolean),
    [searchParams]
  );
  const featured = searchParams.get("featured") === "true";
  const provider = searchParams.get("provider") || "";
  const sort = searchParams.get("sort") || "curated";

  const toggleProviderType = (type) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((item) => item !== type)
      : [...selectedTypes, type];
    update({ providerType: next.join(",") });
  };

  const categoryName = categories.find((item) => item.slug === category)?.name || category;

  const activeFilters = [
    { key: "q", value: urlQuery, label: `“${urlQuery}”`, onRemove: () => update({ q: "" }) },
    { key: "category", value: category, label: categoryName, onRemove: () => update({ category: "" }) },
    ...selectedTypes.map((type) => ({
      key: `providerType-${type}`,
      value: type,
      label: PROVIDER_TYPE_LABELS[type] || type,
      onRemove: () => toggleProviderType(type),
    })),
    { key: "featured", value: featured, label: "Featured work", onRemove: () => update({ featured: "" }) },
    { key: "provider", value: provider, label: `From @${provider}`, onRemove: () => update({ provider: "" }) },
  ].filter((filter) => filter.value);

  const clearAll = useCallback(() => listing.clear(FILTER_KEYS), [listing]);

  const FilterContent = (
    <div>
      <FilterGroup title="Category">
        <Select value={category} onChange={(event) => update({ category: event.target.value })} className="py-2 text-xs">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup title="Created by">
        <div className="space-y-2.5">
          {PROVIDER_TYPES.map((type) => (
            <Checkbox
              key={type}
              label={PROVIDER_TYPE_LABELS[type]}
              checked={selectedTypes.includes(type)}
              onChange={() => toggleProviderType(type)}
              className="text-xs"
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Highlights">
        <Checkbox
          label="Featured work only"
          checked={featured}
          onChange={(event) => update({ featured: event.target.checked ? "true" : "" })}
          className="text-xs"
        />
      </FilterGroup>
    </div>
  );

  return (
    <div>
      <PageHero
        compact
        eyebrow="Portfolio"
        title={
          <>
            Proof, not <span className="serif-accent text-gradient">promises.</span>
          </>
        }
        description="Case studies and selected work from specialists across the marketplace. Filter by discipline and see how teams approach real problems, from first sketch to shipped product."
        breadcrumbs={[{ label: "Portfolio" }]}
        aside={
          <Link to="/providers" className="btn btn-secondary">
            Explore talent <ArrowUpRight size={14} />
          </Link>
        }
      />

      <div className="container-page py-8 lg:py-12">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 lg:max-w-md">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects, industries, or technology"
                aria-label="Search portfolio"
                className="pl-10"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
            <Button variant="secondary" className="shrink-0 lg:hidden" icon={SlidersHorizontal} onClick={() => setFiltersOpen(true)}>
              Filters
            </Button>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden text-[11px] text-slate-500 sm:inline">
              {loading ? "Loading…" : `${total} ${total === 1 ? "project" : "projects"}`}
            </span>
            <Select
              value={sort}
              onChange={(event) => update({ sort: event.target.value }, { resetPage: false })}
              className="w-auto min-w-[170px] py-2 text-xs"
              aria-label="Sort portfolio"
            >
              <option value="curated">Curated first</option>
              <option value="popular">Most viewed</option>
            </Select>
          </div>
        </div>

        {activeFilters.length ? (
          <div className="border-b border-white/[0.07] py-4">
            <ActiveFilters filters={activeFilters} onClear={clearAll} />
          </div>
        ) : null}

        <div className="mt-7 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-white">Filter work</h2>
                {activeFilters.length ? (
                  <button type="button" onClick={clearAll} className="text-[10px] text-slate-500 hover:text-white">
                    Reset
                  </button>
                ) : null}
              </div>
              {FilterContent}
            </div>
          </aside>

          <div className="min-w-0">
            {error ? <ErrorState message={error} onRetry={listing.reload} /> : null}
            {!error && loading ? <CardSkeleton count={6} className="lg:grid-cols-2 xl:grid-cols-3" /> : null}

            {!error && !loading && items.length ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
                <Pagination page={page} pages={pages} onChange={(next) => update({ page: next }, { resetPage: false })} className="mt-10" />
              </>
            ) : null}

            {!error && !loading && !items.length ? (
              <EmptyState
                icon={Images}
                title="No work matches those filters"
                description="Try a different category, or clear the filters to see the full portfolio."
                action={
                  <Button variant="secondary" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[11px] text-slate-500">
              <span>Demo portfolio · fictional case studies and seeded imagery.</span>
              <Link to="/services" className="inline-flex items-center gap-1 text-brand-300 hover:text-brand-200">
                Browse service packages <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter portfolio"
        footer={
          <>
            <Button variant="ghost" onClick={clearAll}>
              Reset
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>Show results</Button>
          </>
        }
      >
        {FilterContent}
      </Modal>
    </div>
  );
}
