import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, Sparkles } from "lucide-react";
import { Avatar, Artwork } from "../ui/Avatar";
import { Rating } from "../ui/Badge";
import FavoriteButton from "./FavoriteButton";
import { PROVIDER_TYPE_LABELS, money } from "../../lib/format";
import { roleMeta } from "../../lib/providerRoles";

export default function ProviderCard({ provider }) {
  if (!provider) return null;
  const price =
    provider.hourlyRate && provider.hourlyRate > 0
      ? `${money(provider.hourlyRate, provider.currency)}/hr`
      : provider.startingBudget
        ? `From ${money(provider.startingBudget, provider.currency)}`
        : "Let's talk";
  const primaryRole = roleMeta(provider.primaryRole) || roleMeta(provider.roles?.[0]);
  const RoleIcon = primaryRole?.icon;
  const extraRoles = (provider.roles || []).filter((role) => role !== primaryRole?.value);

  return (
    <article data-card className="surface surface-hover group relative flex h-full flex-col overflow-hidden rounded-2xl">
      <Link
        to={`/providers/${provider.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${provider.displayName}`}
        data-cursor-label="View profile"
      />

      <div className="relative h-24 shrink-0">
        <Artwork
          src={provider.coverImage}
          alt=""
          label=""
          icon={Sparkles}
          rounded="rounded-none"
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink-950/75 px-2.5 py-1 text-[10px] font-semibold text-white/85">
          {RoleIcon ? <RoleIcon size={11} className="text-brand-200" /> : null}
          {primaryRole?.label || PROVIDER_TYPE_LABELS[provider.type] || provider.type}
        </span>
        <div className="absolute right-4 top-4">
          <FavoriteButton providerId={provider._id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="-mt-6 flex items-end justify-between">
          <Avatar src={provider.avatar} name={provider.displayName} size="xl" ring />
          <Rating value={provider.ratingAvg} count={provider.ratingCount} />
        </div>

        <h3 className="mt-3 flex items-center gap-1.5 text-[15px] font-semibold tracking-tight text-white">
          <span className="truncate">{provider.displayName}</span>
          {provider.verified ? <BadgeCheck size={15} className="shrink-0 text-sky-300" /> : null}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-[36px] text-xs leading-relaxed text-slate-400">
          {provider.headline || provider.primaryCategory?.name || "Digital specialist"}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(provider.skills || []).slice(0, 3).map((skill) => (
            <span key={skill} className="chip px-2 py-1 text-[10px]">
              {skill}
            </span>
          ))}
          {!provider.skills?.length && extraRoles.length ? (
            <span className="chip px-2 py-1 text-[10px]">{roleMeta(extraRoles[0])?.label}</span>
          ) : null}
        </div>
        <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.13em] text-slate-600">
          {PROVIDER_TYPE_LABELS[provider.type] || provider.type}
          {extraRoles.length ? ` · +${extraRoles.length} more role${extraRoles.length === 1 ? "" : "s"}` : ""}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.07] pt-3.5 text-[11px]">
          <span className="flex min-w-0 items-center gap-1 text-slate-500">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{provider.location || "Remote"}</span>
          </span>
          <span className="shrink-0 font-semibold text-slate-200">{price}</span>
        </div>
      </div>
    </article>
  );
}
