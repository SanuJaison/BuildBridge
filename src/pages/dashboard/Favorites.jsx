import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bookmark, Search, Trash2 } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Badge, Rating } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { PageHeader } from "../../components/dashboard/DashboardUI";
import { PROVIDER_TYPE_LABELS, money } from "../../lib/format";

export default function Favorites() {
  usePageTitle("Saved talent");
  const toast = useToast();
  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [removing, setRemoving] = useState("");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/favorites");
      setState({ loading: false, error: "", items: data.items || [] });
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "Saved talent could not be loaded."), items: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (provider) => {
    setRemoving(provider._id);
    try {
      await api.delete(`/favorites/${provider._id}`);
      setState((current) => ({ ...current, items: current.items.filter((item) => item.provider?._id !== provider._id) }));
      toast.success("Removed from saved talent", `${provider.displayName} is no longer saved.`);
    } catch (error) {
      toast.error("Could not remove", getApiMessage(error));
    } finally {
      setRemoving("");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Your shortlist"
        title="Saved talent"
        description="Keep a private shortlist of specialists and teams you want to revisit. Only you can see these saves."
        actions={
          <Link to="/providers" className={buttonClass("primary", "md")}>
            <Search size={14} />
            Find more talent
          </Link>
        }
      />

      {state.loading ? (
        <LoadingBlock label="Loading saved talent" />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={load} />
      ) : state.items.length ? (
        <>
          <p className="mb-3 text-[11px] text-slate-500">{state.items.length} saved specialist{state.items.length === 1 ? "" : "s"}</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {state.items.map((favorite) => {
              const provider = favorite.provider;
              if (!provider) return null;
              return (
                <div key={favorite._id} className="surface surface-hover group relative rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Avatar src={provider.avatar} name={provider.displayName} size="lg" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/providers/${provider.slug}`}
                        className="inline-flex max-w-full items-center gap-1 truncate text-sm font-semibold text-white transition hover:text-brand-200"
                      >
                        <span className="truncate">{provider.displayName}</span>
                        <ArrowUpRight size={11} className="shrink-0 text-slate-600" />
                      </Link>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                        {PROVIDER_TYPE_LABELS[provider.type] || "Provider"}
                        {provider.primaryCategory?.name ? ` · ${provider.primaryCategory.name}` : ""}
                      </p>
                      <div className="mt-1.5">
                        <Rating value={provider.ratingAvg} count={provider.ratingCount} size={11} />
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 min-h-[32px] text-[11px] leading-relaxed text-slate-400">
                    {provider.headline || "Digital specialist on BuildBridge."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge tone="slate">{money(provider.startingBudget, provider.currency) === "—" ? "Budget on request" : `From ${money(provider.startingBudget, provider.currency)}`}</Badge>
                    {provider.verified ? <Badge tone="mint">Verified</Badge> : null}
                    {provider.availability === "available" ? <Badge tone="mint" dot>Available</Badge> : null}
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-3">
                    <Link to={`/providers/${provider.slug}`} className={buttonClass("secondary", "sm", "flex-1")}>
                      View profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(provider)}
                      disabled={removing === provider._id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-500 transition hover:border-rose-400/25 hover:text-rose-300 disabled:opacity-50"
                      aria-label={`Remove ${provider.displayName} from saved talent`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="Your shortlist is empty"
          description="Save specialists while browsing so you can compare approaches, skills, and budgets later."
          action={
            <Link to="/providers" className={buttonClass("primary", "sm")}>
              Explore talent
            </Link>
          }
        />
      )}
    </div>
  );
}
