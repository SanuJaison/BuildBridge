import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck, Clock3 } from "lucide-react";
import { Avatar, Artwork } from "../ui/Avatar";
import { Rating } from "../ui/Badge";
import CategoryIcon from "./CategoryIcon";
import { money, truncate } from "../../lib/format";

export default function ServiceCard({ service, horizontal = false }) {
  if (!service) return null;
  const image = service.images?.[0];

  return (
    <article
      data-card
      className={`surface surface-hover group relative flex h-full overflow-hidden rounded-2xl ${
        horizontal ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      <Link
        to={`/services/${service.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View service ${service.title}`}
        data-cursor-label="View service"
      />
      <div className={`relative shrink-0 overflow-hidden ${horizontal ? "sm:w-56" : ""}`}>
        <Artwork
          src={image}
          alt={service.title}
          label={service.category?.name}
          icon={(props) => <CategoryIcon name={service.category?.icon} {...props} />}
          rounded="rounded-none"
          className={`w-full ${horizontal ? "aspect-[16/10] sm:h-full sm:min-h-[168px]" : "aspect-[16/10]"}`}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
          <span className="chip border-white/15 bg-ink-950/60 text-[10px] text-white/80 backdrop-blur">
            {service.category?.name || "Digital service"}
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-ink-950/50 text-white/70 opacity-0 backdrop-blur transition group-hover:opacity-100">
            <ArrowUpRight size={13} />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-white">
          {service.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {truncate(service.description, 150)}
        </p>

        {service.provider ? (
          <div className="mt-4 flex items-center gap-2.5">
            <Avatar src={service.provider.avatar} name={service.provider.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <Link
                to={`/providers/${service.provider.slug}`}
                className="relative z-20 flex items-center gap-1 text-[11px] font-medium text-slate-200 hover:text-white"
              >
                <span className="truncate">{service.provider.displayName}</span>
                {service.provider.verified ? <BadgeCheck size={11} className="shrink-0 text-sky-300" /> : null}
              </Link>
              <Rating value={service.provider.ratingAvg} count={service.provider.ratingCount} size={10} />
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.07] pt-3.5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600">Starting at</p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {money(service.startingPrice, service.currency)}
              <span className="ml-1 text-[10px] font-normal text-slate-500">
                {service.pricingType === "hourly" ? "/hr" : ""}
              </span>
            </p>
          </div>
          {service.deliveryDays ? (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock3 size={11} />
              {service.deliveryDays} day delivery
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
