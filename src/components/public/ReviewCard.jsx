import { Link } from "react-router-dom";
import { Quote } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Rating } from "../ui/Badge";
import { formatDate, timeAgo, truncate } from "../../lib/format";

export default function ReviewCard({ review, limit = 220, showProvider = true }) {
  if (!review) return null;

  return (
    <article className="surface flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <Rating value={review.rating} size={13} showValue={false} />
        <Quote size={18} className="text-brand-400/40" />
      </div>
      {review.title ? <h3 className="mt-3 text-sm font-semibold text-white">{review.title}</h3> : null}
      <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-400">“{truncate(review.comment, limit)}”</p>
      <div className="mt-4 flex items-center gap-2.5 border-t border-white/[0.07] pt-3.5">
        <Avatar src={review.customer?.avatar} name={review.customer?.name || "Customer"} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-200">{review.customer?.name || "Verified customer"}</p>
          <p className="text-[10px] text-slate-500" title={formatDate(review.createdAt)}>
            {review.createdAt ? timeAgo(review.createdAt) : ""}
          </p>
        </div>
        {showProvider && review.provider ? (
          <Link
            to={`/providers/${review.provider.slug}`}
            className="ml-auto truncate text-[10px] text-slate-500 transition hover:text-brand-300"
          >
            for {review.provider.displayName}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
