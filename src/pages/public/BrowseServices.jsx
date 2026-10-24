import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Briefcase, Search, SlidersHorizontal, X } from "lucide-react";
import api from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import useListing from "../../hooks/useListing";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import PageHero from "../../components/public/PageHero";
import ServiceCard from "../../components/public/ServiceCard";
import { ActiveFilters, CommitInput, FilterGroup } from "../../components/public/FilterGroup";
import { Checkbox, Input, Select } from "../../components/ui/Form";
import { CardSkeleton, EmptyState, ErrorState } from "../../components/ui/Feedback";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { BUDGET_RANGES, PROVIDER_TYPES, PROVIDER_TYPE_LABELS } from "../../lib/format";

const FILTER_KEYS = [
  "q",
  "category",
  "subcategory",
  "providerType",
  "minPrice",
  "maxPrice",
  "pricingType",
  "page",
];

const SORTS = [
  { value: "newest", label: "Newest services" },
  { value: "popular", label: "Most viewed" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const PRICING_TYPES = [
  { value: "fixed", label: "Fixed price" },
  { value: "hourly", label: "Hourly rate" },
  { value: "custom", label: "Custom quote" },
];

export default function BrowseServices() {
  usePageTitle("Browse services");
  const listing = useListing("/services", "The service catalog could not be loaded.");
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

  const categoryValue = searchParams.get("subcategory")
    ? `${searchParams.get("category") || ""}::${searchParams.get("subcategory")}`
    : searchParams.get("category") || "";
  const selectedTypes = useMemo(
    () => String(searchParams.get("providerType") || "").split(",").filter(Boolean),
    [searchParams]
  );
  const pricingType = searchParams.get("pricingType") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";

  const toggleProviderType = (type) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((item) => item !== type)
      : [...selectedTypes, type];
    update({ providerType: next.join(",") });
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
      key: `providerType-${type}`,
      value: type,
      label: PROVIDER_TYPE_LABELS[type] || type,
      onRemove: () => toggleProviderType(type),
    })),
    { key: "category", value: categoryValue, label: categoryLabel, onRemove: () => update({ category: "", subcategory: "" }) },
    {
      key: "pricingType",
      value: pricingType,
      label: PRICING_TYPES.find((type) => type.value === pricingType)?.label || pricingType,
      onRemove: () => update({ pricingType: "" }),
    },
    {
      key: "price",
      value: minPrice || maxPrice,
      label: `Budget ${minPrice ? `from $${minPrice}` : ""}${maxPrice ? ` up to $${maxPrice}` : ""}`.trim(),
      onRemove: () => update({ minPrice: "", maxPrice: "" }),
    },
  ].filter((filter) => filter.value);

  const clearAll = useCallback(() => listing.clear(FILTER_KEYS), [listing]);

  const FilterContent = (
    <div>
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

      <FilterGroup title="Pricing">
        <div className="space-y-2">
          {[{ value: "", label: "Any pricing" }, ...PRICING_TYPES].map((option) => (
            <label key={option.value || "any"} className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-400">
              <input
                type="radio"
                name="pricingType"
                checked={pricingType === option.value}
                onChange={() => update({ pricingType: option.value })}
                className="h-3.5 w-3.5 accent-violet-500"
              />
              {option.label}
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <CommitInput value={minPrice} onCommit={(value) => update({ minPrice: value })} placeholder="Min" prefix="$" type="number" />
          <CommitInput value={maxPrice} onCommit={(value) => update({ maxPrice: value })} placeholder="Max" prefix="$" type="number" />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {BUDGET_RANGES.slice(0, 4).map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => update({ minPrice: range.min, maxPrice: range.max })}
              className={`rounded-full border px-2 py-1 text-[10px] transition ${
                minPrice === range.min && maxPrice === range.max
                  ? "border-brand-300/35 bg-brand-500/12 text-white"
                  : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Provider type">
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
    </div>
  );

  return (
    <div>
      <PageHero
        compact
        eyebrow="Services"
        title={
          <>
            Start with a clear <span className="serif-accent text-gradient">scope.</span>
          </>
        }
        description="Packaged offers from independent specialists and teams. Compare deliverables, starting prices, and delivery windows, then start a conversation with a brief that fits."
        breadcrumbs={[{ label: "Services" }]}
        aside={
          <Link to="/providers" className="btn btn-secondary">
            <Briefcase size={14} />
            Browse talent instead
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
                placeholder="Search services, skills, or tags"
                aria-label="Search services"
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
              {loading ? "Loading…" : `${total} ${total === 1 ? "service" : "services"}`}
            </span>
            <Select
              value={sort}
              onChange={(event) => update({ sort: event.target.value }, { resetPage: false })}
              className="w-auto min-w-[180px] py-2 text-xs"
              aria-label="Sort services"
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

        <div className="mt-7 grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-white">Filter services</h2>
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
                  {items.map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
                <Pagination page={page} pages={pages} onChange={(next) => update({ page: next }, { resetPage: false })} className="mt-10" />
              </>
            ) : null}

            {!error && !loading && !items.length ? (
              <EmptyState
                icon={Briefcase}
                title="No services match those filters"
                description="Try a broader category, a different price range, or clear the search to explore everything."
                action={
                  <Button variant="secondary" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[11px] text-slate-500">
              <span>Prices are provider-set starting points, not platform charges.</span>
              <Link to="/start-project" className="inline-flex items-center gap-1 text-brand-300 hover:text-brand-200">
                Need something custom? Start a brief <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter services"
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
