import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Filter, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import api from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import useListing from "../../hooks/useListing";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import PageHero from "../../components/public/PageHero";
import ProviderCard from "../../components/public/ProviderCard";
import { ActiveFilters, CommitInput, FilterGroup } from "../../components/public/FilterGroup";
import { Checkbox, Input, Select } from "../../components/ui/Form";
import { CardSkeleton, EmptyState, ErrorState } from "../../components/ui/Feedback";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { BUDGET_RANGES, PROVIDER_TYPES, PROVIDER_TYPE_LABELS } from "../../lib/format";

const FILTER_KEYS = [
  "q",
  "type",
  "category",
  "subcategory",
  "availability",
  "minBudget",
  "maxBudget",
  "minRating",
  "experienceMin",
  "location",
  "verified",
  "remote",
  "page",
];

const SORTS = [
  { value: "relevance", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "newest", label: "Newest profiles" },
  { value: "price_asc", label: "Starting price: low to high" },
  { value: "price_desc", label: "Starting price: high to low" },
];

export default function BrowseProviders() {
  usePageTitle("Explore digital talent");
  const listing = useListing("/providers", "The talent directory could not be loaded.");
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

  const selectedTypes = useMemo(
    () => String(searchParams.get("type") || "").split(",").filter(Boolean),
    [searchParams]
  );
  const categoryValue = searchParams.get("subcategory")
    ? `${searchParams.get("category") || ""}::${searchParams.get("subcategory")}`
    : searchParams.get("category") || "";
  const availability = searchParams.get("availability") || "";
  const minBudget = searchParams.get("minBudget") || "";
  const maxBudget = searchParams.get("maxBudget") || "";
  const minRating = searchParams.get("minRating") || "";
  const experienceMin = searchParams.get("experienceMin") || "";
  const location = searchParams.get("location") || "";
  const verified = searchParams.get("verified") === "true";
  const remote = searchParams.get("remote") === "true";
  const sort = searchParams.get("sort") || "relevance";

  const toggleType = (type) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((item) => item !== type)
      : [...selectedTypes, type];
    update({ type: next.join(",") });
  };

  const onCategoryChange = (value) => {
    if (!value) return update({ category: "", subcategory: "" });
    if (value.includes("::")) {
      const [parent, child] = value.split("::");
      update({ category: parent, subcategory: child });
    } else {
      update({ category: value, subcategory: "" });
    }
  };

  const categoryLabel = useMemo(() => {
    if (!categoryValue) return "";
    if (categoryValue.includes("::")) {
      const [parentSlug, childSlug] = categoryValue.split("::");
      const parent = categories.find((category) => category.slug === parentSlug);
      const child = parent?.children?.find((item) => item.slug === childSlug);
      return child ? `${parent?.name || "Category"} · ${child.name}` : childSlug;
    }
    const parent = categories.find((category) => category.slug === categoryValue);
    return parent?.name || categoryValue;
  }, [categories, categoryValue]);

  const activeFilters = [
    { key: "q", value: urlQuery, label: `“${urlQuery}”`, onRemove: () => update({ q: "" }) },
    ...selectedTypes.map((type) => ({
      key: `type-${type}`,
      value: type,
      label: PROVIDER_TYPE_LABELS[type] || type,
      onRemove: () => toggleType(type),
    })),
    { key: "category", value: categoryValue, label: categoryLabel, onRemove: () => update({ category: "", subcategory: "" }) },
    {
      key: "availability",
      value: availability,
      label: availability === "available" ? "Available now" : availability === "limited" ? "Limited availability" : "Unavailable",
      onRemove: () => update({ availability: "" }),
    },
    {
      key: "budget",
      value: minBudget || maxBudget,
      label: `${minBudget ? `From $${minBudget}` : "Up to"}${maxBudget ? `$${maxBudget}` : ""}`,
      onRemove: () => update({ minBudget: "", maxBudget: "" }),
    },
    { key: "minRating", value: minRating, label: `${minRating}+ stars`, onRemove: () => update({ minRating: "" }) },
    {
      key: "experienceMin",
      value: experienceMin,
      label: `${experienceMin}+ years experience`,
      onRemove: () => update({ experienceMin: "" }),
    },
    { key: "location", value: location, label: `Location: ${location}`, onRemove: () => update({ location: "" }) },
    { key: "verified", value: verified, label: "Verified only", onRemove: () => update({ verified: "" }) },
    { key: "remote", value: remote, label: "Remote friendly", onRemove: () => update({ remote: "" }) },
  ].filter((filter) => filter.value);

  const clearAll = useCallback(() => {
    listing.clear(FILTER_KEYS);
  }, [listing]);

  const FilterContent = (
    <div className="space-y-0">
      <FilterGroup title="Availability">
        <div className="space-y-2">
          {[
            { value: "", label: "Any availability" },
            { value: "available", label: "Available now" },
            { value: "limited", label: "Limited availability" },
            { value: "unavailable", label: "Unavailable" },
          ].map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-400">
              <input
                type="radio"
                name="availability"
                checked={availability === option.value}
                onChange={() => update({ availability: option.value })}
                className="h-3.5 w-3.5 accent-violet-500"
              />
              {option.label}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Talent type">
        <div className="space-y-2.5">
          {PROVIDER_TYPES.map((type) => (
            <Checkbox
              key={type}
              label={PROVIDER_TYPE_LABELS[type]}
              checked={selectedTypes.includes(type)}
              onChange={() => toggleType(type)}
              className="text-xs"
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Category">
        <Select value={categoryValue} onChange={(event) => onCategoryChange(event.target.value)} className="py-2 text-xs">
          <option value="">All categories</option>
          {categories.map((category) => (
            <optgroup key={category.id} label={category.name}>
              <option value={category.slug}>All {category.name}</option>
              {category.children.map((child) => (
                <option key={child.id} value={`${category.slug}::${child.slug}`}>
                  {child.name}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup title="Starting budget">
        <div className="grid grid-cols-2 gap-2">
          <CommitInput value={minBudget} onCommit={(value) => update({ minBudget: value })} placeholder="Min" prefix="$" type="number" />
          <CommitInput value={maxBudget} onCommit={(value) => update({ maxBudget: value })} placeholder="Max" prefix="$" type="number" />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {BUDGET_RANGES.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => update({ minBudget: range.min, maxBudget: range.max })}
              className={`rounded-full border px-2 py-1 text-[10px] transition ${
                minBudget === range.min && maxBudget === range.max
                  ? "border-brand-300/35 bg-brand-500/12 text-white"
                  : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Reputation">
        <div className="space-y-2">
          {["", "4.5", "4", "3.5"].map((value) => (
            <label key={value || "any"} className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-400">
              <input
                type="radio"
                name="minRating"
                checked={minRating === value}
                onChange={() => update({ minRating: value })}
                className="h-3.5 w-3.5 accent-violet-500"
              />
              {value ? `${value} stars and up` : "Any rating"}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Experience">
        <Select value={experienceMin} onChange={(event) => update({ experienceMin: event.target.value })} className="py-2 text-xs">
          <option value="">Any experience</option>
          <option value="1">1+ years</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
          <option value="8">8+ years</option>
          <option value="10">10+ years</option>
        </Select>
      </FilterGroup>

      <FilterGroup title="Location">
        <CommitInput value={location} onCommit={(value) => update({ location: value })} placeholder="City or country" />
      </FilterGroup>

      <FilterGroup title="Working style">
        <div className="space-y-2.5">
          <Checkbox
            label="Verified profiles only"
            checked={verified}
            onChange={(event) => update({ verified: event.target.checked ? "true" : "" })}
            className="text-xs"
          />
          <Checkbox
            label="Open to remote work"
            checked={remote}
            onChange={(event) => update({ remote: event.target.checked ? "true" : "" })}
            className="text-xs"
          />
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div>
      <PageHero
        compact
        eyebrow="Explore talent"
        title={
          <>
            Find the right specialist <span className="serif-accent text-gradient">for the work.</span>
          </>
        }
        description="Independent specialists, developers, studios, and agencies. Filter by discipline, availability, budget, and proof of work. Every profile is governed by a public provider workspace."
        breadcrumbs={[{ label: "Explore talent" }]}
        aside={
          <Link to="/start-project" className="btn btn-secondary">
            Start a project brief
            <ArrowUpRight size={14} />
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
                placeholder="Search skills, role, or technology"
                aria-label="Search talent"
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
            <Button
              variant="secondary"
              className="shrink-0 lg:hidden"
              icon={SlidersHorizontal}
              onClick={() => setFiltersOpen(true)}
            >
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-[11px] text-slate-500 sm:inline">
              {loading ? "Searching…" : `${total} ${total === 1 ? "specialist" : "specialists"}`}
            </span>
            <Select
              value={sort}
              onChange={(event) => update({ sort: event.target.value }, { resetPage: false })}
              className="w-auto min-w-[190px] py-2 text-xs"
              aria-label="Sort providers"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {activeFilters.length ? (
          <div className="border-b border-white/[0.07] py-4">
            <ActiveFilters filters={activeFilters} onClear={clearAll} />
          </div>
        ) : null}

        <div className="mt-7 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Filter size={13} className="text-brand-300" />
                  Filter talent
                </h2>
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
                  {items.map((provider) => (
                    <ProviderCard key={provider._id} provider={provider} />
                  ))}
                </div>
                <Pagination page={page} pages={pages} onChange={(next) => update({ page: next }, { resetPage: false })} className="mt-10" />
              </>
            ) : null}

            {!error && !loading && !items.length ? (
              <EmptyState
                icon={Sparkles}
                title="No specialists match those filters"
                description="Try widening your budget, removing a filter, or searching for a broader skill."
                action={
                  <Button variant="secondary" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} className="text-brand-300" />
                Working across time zones, on-site or remote.
              </span>
              <Link to="/how-it-works" className="inline-flex items-center gap-1 text-brand-300 hover:text-brand-200">
                How hiring works <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter talent"
        description="Results update as you choose. Close to see the full grid."
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
