import Breadcrumbs from "../ui/Breadcrumbs";
import OrbitMotif from "./OrbitMotif";

export default function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
  breadcrumbs,
  wide = false,
  compact = false,
}) {
  return (
    <section className={`relative overflow-hidden border-b border-white/[0.06] ${compact ? "pt-28 pb-10 sm:pt-32 sm:pb-12" : "pt-32 pb-14 sm:pt-36 sm:pb-16"}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-grid absolute inset-0 opacity-70" />
        <div data-parallax="-0.16" className="absolute -top-44 left-1/4 h-80 w-[560px] rounded-full bg-violet-600/12 blur-[120px]" />
        <div data-parallax="0.12" className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-sky-500/8 blur-[100px]" />
        <div data-parallax="-0.06" className="absolute -right-44 top-1/2 hidden h-[34rem] w-[52rem] -translate-y-1/2 lg:block">
          <OrbitMotif className="h-full w-full opacity-60" />
        </div>
      </div>
      <div className={`container-page relative ${wide ? "max-w-[88rem]" : ""}`}>
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-6" /> : null}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? <p className="eyebrow" data-page-enter>{eyebrow}</p> : null}
            <h1 data-split className="mt-3 text-balance text-[clamp(2.1rem,4.8vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white">
              {title}
            </h1>
            {description ? (
              <p data-page-enter className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                {description}
              </p>
            ) : null}
            {children ? <div data-page-enter className="mt-7">{children}</div> : null}
          </div>
          {aside ? <div data-page-enter className="shrink-0">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
