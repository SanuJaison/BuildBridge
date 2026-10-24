import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Star } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { Avatar } from "../../components/ui/Avatar";
import { Rating } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { PageHeader, Panel } from "../../components/dashboard/DashboardUI";
import { PROVIDER_TYPE_LABELS, formatDate } from "../../lib/format";

export default function Reviews() {
  usePageTitle("My reviews");
  const [state, setState] = useState({ loading: true, error: "", items: [] });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/reviews/mine");
      setState({ loading: false, error: "", items: data.items || [] });
    } catch (error) {
      setState({ loading: false, error: getApiMessage(error, "Your reviews could not be loaded."), items: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        eyebrow="Feedback you have shared"
        title="My reviews"
        description="Reviews can only be written for an accepted engagement that you marked complete. Each completed engagement allows one review."
        actions={
          <Link to="/dashboard/inquiries?status=completed" className={buttonClass("secondary", "md")}>
            View completed engagements
          </Link>
        }
      />

      {state.loading ? (
        <LoadingBlock label="Loading your reviews" />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={load} />
      ) : state.items.length ? (
        <div className="space-y-3">
          {state.items.map((review) => (
            <Panel key={review._id} padded={false}>
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
                <Avatar src={review.provider?.avatar} name={review.provider?.displayName} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/providers/${review.provider?.slug || ""}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-white transition hover:text-brand-200"
                    >
                      {review.provider?.displayName || "Provider"}
                      <ArrowUpRight size={11} className="text-slate-600" />
                    </Link>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {PROVIDER_TYPE_LABELS[review.provider?.type] || "Provider"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Rating value={review.rating} size={12} showValue={false} />
                    <span className="text-[11px] font-medium text-amber-200">{review.rating}/5</span>
                    <span className="text-[10px] text-slate-600">· {formatDate(review.createdAt)}</span>
                  </div>
                  {review.title ? <p className="mt-3 text-xs font-semibold text-slate-100">{review.title}</p> : null}
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{review.comment}</p>
                  <p className="mt-3 text-[10px] text-slate-600">
                    Tied to a completed engagement · published on the provider&apos;s public profile
                  </p>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Once a project reaches completed, you can leave one review for that engagement from the inquiry page."
          action={
            <Link to="/dashboard/inquiries" className={buttonClass("primary", "sm")}>
              Open your inquiries
            </Link>
          }
        />
      )}
    </div>
  );
}
