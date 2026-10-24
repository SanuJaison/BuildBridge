import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clock3,
  Layers,
  MessageSquare,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { Avatar, Artwork } from "../../components/ui/Avatar";
import { Badge, Rating } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Accordion from "../../components/public/Accordion";
import CategoryIcon from "../../components/public/CategoryIcon";
import ReportModal from "../../components/public/ReportModal";
import ServiceCard from "../../components/public/ServiceCard";
import { PROVIDER_TYPE_LABELS, money } from "../../lib/format";

export default function ServiceDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: "", notFound: false, data: null });
  const [activeImage, setActiveImage] = useState(0);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get(`/services/${slug}`);
      setState({ loading: false, error: "", notFound: false, data });
      setActiveImage(0);
    } catch (error) {
      setState({
        loading: false,
        error: getApiMessage(error, "This service could not be loaded."),
        notFound: error?.response?.status === 404,
        data: null,
      });
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const service = state.data?.service;
  usePageTitle(service ? `${service.title} · Service` : "Service");

  if (state.loading) {
    return (
      <div className="container-page pt-32">
        <LoadingBlock label="Loading service" />
      </div>
    );
  }

  if (state.error || !service) {
    return (
      <div className="container-page pb-16 pt-32">
        <ErrorState
          title={state.notFound ? "This service is not available" : "We couldn't load this service"}
          message={state.notFound ? "The listing may have been paused or unpublished. Browse other services instead." : state.error}
          onRetry={state.notFound ? undefined : load}
        />
        <div className="mt-5 text-center">
          <Link to="/services" className={buttonClass("secondary", "md")}>
            Browse services
          </Link>
        </div>
      </div>
    );
  }

  const { provider, related = [], providerServices = [] } = state.data;
  const images = service.images?.length ? service.images : [];
  const inquiryHref = `/start-project?provider=${provider.slug}&service=${service.slug}`;
  const priceSuffix = service.pricingType === "hourly" ? " / hour" : service.pricingType === "custom" ? " · custom scope" : "";

  const faqs = (service.faqs || []).map((faq) => ({ question: faq.question, answer: faq.answer }));

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="container-page">
        <Breadcrumbs
          items={[
            { label: "Services", to: "/services" },
            ...(service.category ? [{ label: service.category.name, to: `/categories/${service.category.slug}` }] : []),
            { label: service.title },
          ]}
          className="mb-6"
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-white/[0.09]">
              <Artwork
                src={images[activeImage]}
                alt={service.title}
                label={service.category?.name}
                icon={(props) => <CategoryIcon name={service.category?.icon} {...props} />}
                rounded="rounded-none"
                className="aspect-[16/9] w-full"
              />
            </div>
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${
                      activeImage === index ? "border-brand-300/60" : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Artwork src={image} alt="" rounded="rounded-none" className="h-full w-full" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                {service.category ? <Badge tone="violet">{service.category.name}</Badge> : null}
                {service.subcategory ? <Badge tone="slate">{service.subcategory.name}</Badge> : null}
                {service.pricingType ? <Badge tone="blue">{service.pricingType === "fixed" ? "Fixed scope" : service.pricingType === "hourly" ? "Hourly" : "Custom quote"}</Badge> : null}
              </div>
              <h1 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {service.title}
              </h1>
              <p className="mt-4 whitespace-pre-line text-pretty text-sm leading-relaxed text-slate-400">
                {service.description}
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <div className="surface rounded-2xl p-5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <PackageCheck size={13} className="text-mint-400" />
                  What you get
                </p>
                {service.deliverables?.length ? (
                  <ul className="mt-3 space-y-2">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
                        <Check size={13} className="mt-0.5 shrink-0 text-mint-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Deliverables are agreed in the conversation and written into the proposal before work begins.
                  </p>
                )}
              </div>

              <div className="surface rounded-2xl p-5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <Layers size={13} className="text-brand-300" />
                  What they need from you
                </p>
                {service.requirements?.length ? (
                  <ul className="mt-3 space-y-2">
                    {service.requirements.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Share references, access, and decision-makers at the start so the work can move without stalls.
                  </p>
                )}
              </div>
            </div>

            {service.tags?.length ? (
              <div className="mt-7 flex flex-wrap gap-1.5">
                {service.tags.map((tag) => (
                  <span key={tag} className="chip px-2.5 py-1 text-[11px] text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-10 surface rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={provider.avatar} name={provider.displayName} size="lg" />
                  <div>
                    <Link to={`/providers/${provider.slug}`} className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand-200">
                      {provider.displayName}
                      {provider.verified ? <BadgeCheck size={14} className="text-sky-300" /> : null}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {PROVIDER_TYPE_LABELS[provider.type] || provider.type} · {provider.location || "Remote"}
                    </p>
                    <div className="mt-1">
                      <Rating value={provider.ratingAvg} count={provider.ratingCount} size={11} />
                    </div>
                  </div>
                </div>
                <Link to={`/providers/${provider.slug}`} className={buttonClass("secondary", "sm")}>
                  View profile <ArrowUpRight size={12} />
                </Link>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">{provider.headline}</p>
            </div>

            {faqs.length ? (
              <section className="mt-12">
                <h2 className="heading-md text-white">
                  Common <span className="serif-accent text-brand-200">questions.</span>
                </h2>
                <div className="mt-5">
                  <Accordion items={faqs} />
                </div>
              </section>
            ) : null}

            {providerServices.length ? (
              <section className="mt-12">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="heading-md text-white">More from this provider</h2>
                  <Link to={`/providers/${provider.slug}`} className="text-[11px] text-brand-300 hover:text-brand-200">
                    View all
                  </Link>
                </div>
                <div className="mt-5 space-y-2.5">
                  {providerServices.map((item) => (
                    <Link
                      key={item._id}
                      to={`/services/${item.slug}`}
                      className="surface surface-hover flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-white">{item.title}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {item.deliveryDays ? `${item.deliveryDays} day delivery` : "Flexible delivery"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-slate-200">
                        {item.pricingType === "custom" ? "Custom" : money(item.startingPrice, item.currency)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside>
            <div className="sticky top-24 space-y-4">
              <div className="gradient-border rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Starting price</p>
                <p className="mt-1.5 text-3xl font-semibold tracking-tight text-white">
                  {service.pricingType === "custom" && !service.startingPrice ? "Let's scope it" : money(service.startingPrice, service.currency)}
                  {service.pricingType !== "custom" ? <span className="text-xs font-normal text-slate-500">{priceSuffix}</span> : null}
                </p>
                {service.maxPrice ? (
                  <p className="mt-1 text-[11px] text-slate-500">Up to {money(service.maxPrice, service.currency)}</p>
                ) : null}

                <div className="mt-4 space-y-2.5 border-y border-white/[0.07] py-4 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock3 size={12} /> Delivery
                    </span>
                    <span className="text-slate-300">{service.deliveryDays ? `${service.deliveryDays} days` : "To be agreed"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Sparkles size={12} /> Pricing
                    </span>
                    <span className="text-slate-300">
                      {service.pricingType === "hourly" ? "Hourly rate" : service.pricingType === "custom" ? "Custom quote" : "Fixed starting point"}
                    </span>
                  </div>
                </div>

                <Link to={inquiryHref} className={buttonClass("primary", "md", "mt-4 w-full")}>
                  <MessageSquare size={14} />
                  Start an inquiry
                </Link>
                <p className="mt-2.5 text-center text-[10px] leading-relaxed text-slate-600">
                  Inquiries are free. Nothing is charged on BuildBridge.
                </p>
              </div>

              <div className="surface rounded-2xl p-5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <ShieldCheck size={12} className="text-mint-400" />
                  What happens next
                </p>
                <ol className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-slate-400">
                  <li className="flex gap-2">
                    <span className="font-serif italic text-brand-300">01</span>
                    Send the brief with goals, budget, and timing.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-serif italic text-brand-300">02</span>
                    Talk it through in a private conversation.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-serif italic text-brand-300">03</span>
                    Review a proposal and accept when the scope is right.
                  </li>
                </ol>
                <div className="mt-4 border-t border-white/[0.07] pt-3.5">
                  <ReportModal targetType="service" targetId={service._id} label="Report this service" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="mt-16 border-t border-white/[0.07] pt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Related services</p>
                <h2 className="mt-2 heading-md text-white">Keep exploring the category</h2>
              </div>
              <Link to={`/services?category=${service.category?.slug || ""}`} className={buttonClass("secondary", "sm")}>
                More in {service.category?.name || "this category"} <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ServiceCard key={item._id} service={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
