import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Compass,
  Eye,
  HeartHandshake,
  Layers,
  LockKeyhole,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import { useBranding } from "../../contexts/BrandingContext";
import PageHero from "../../components/public/PageHero";
import SectionHeader from "../../components/public/SectionHeader";
import { buttonClass } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const PRINCIPLES = [
  {
    icon: Eye,
    title: "Show the seams",
    body: "We label demo data, explain what is not built, and avoid inventing social proof. A marketplace earns trust by being legible, not by looking busy.",
  },
  {
    icon: LockKeyhole,
    title: "Private by default",
    body: "Briefs, attachments, and conversations are scoped to the people involved. File access is checked server-side, not hidden in the interface.",
  },
  {
    icon: BadgeCheck,
    title: "Reviews with receipts",
    body: "Only customers on completed engagements can publish one review. Provider ratings are derived from those records, not written by the platform.",
  },
  {
    icon: MessageSquare,
    title: "Clarity over ceremony",
    body: "One thread for the brief, the proposal, and the delivery conversation. Less chasing context across inboxes.",
  },
  {
    icon: Users,
    title: "Built for teams, not just individuals",
    body: "Agencies and studios get organization workspaces with roles and invitations, while independent specialists get the same core tools.",
  },
  {
    icon: HeartHandshake,
    title: "No payment theatre",
    body: "This build does not process money. It records scopes and agreements in principle, without pretending to hold funds or guarantee outcomes.",
  },
];

export default function About() {
  usePageTitle("About BuildBridge");
  const { branding } = useBranding();

  return (
    <div>
      <PageHero
        eyebrow="About"
        title={
          <>
            A marketplace for the <span className="serif-accent text-gradient">work behind the work.</span>
          </>
        }
        description="BuildBridge is a digital services marketplace demo built around a simple premise: finding the right specialist should feel considered, not chaotic. The platform connects customers with independent talent, developers, studios, and agencies across eleven disciplines."
        breadcrumbs={[{ label: "About" }]}
        aside={
          <div className="surface max-w-xs rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-300">At a glance</p>
            <ul className="mt-3 space-y-2.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-2">
                <Layers size={12} className="text-slate-500" /> 11 parent categories, 115 subcategories
              </li>
              <li className="flex items-center gap-2">
                <Users size={12} className="text-slate-500" /> Independent talent and team workspaces
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck size={12} className="text-slate-500" /> Moderated profiles and reviews
              </li>
              <li className="flex items-center gap-2">
                <LockKeyhole size={12} className="text-slate-500" /> Access-checked private files
              </li>
            </ul>
            <div className="mt-4 border-t border-white/[0.07] pt-3.5 text-[10px] leading-relaxed text-slate-600">
              This is a demonstration build. All marketplace profiles and activity are seeded sample data.
            </div>
          </div>
        }
      />

      <section className="section-pad">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Why we built this</p>
            <h2 className="mt-3 heading-lg text-white">
              The space between “we need help” and <span className="serif-accent text-brand-200">“we found the right person.”</span>
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-400">
              <p data-scroll-words>
                Hiring digital talent is rarely a search problem. It is a context problem. Portfolios get separated from
                scope. Proposals get buried in email. A conversation moves to another channel and the reasoning behind
                decisions disappears.
              </p>
              <p>
                BuildBridge brings the useful artifacts together: a focused provider profile, a structured brief, a
                proposal with terms, a persistent conversation, and a review that can only exist after work is marked
                complete. Each record checks access before it is returned.
              </p>
              <p>
                The goal is not to make hiring feel effortless. It is to make it feel legible, so both sides can make a
                confident decision without inventing information.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/how-it-works" className={buttonClass("secondary", "md")}>
                See how it works <ArrowUpRight size={13} />
              </Link>
              <Link to="/trust" className={buttonClass("ghost", "md")}>
                Trust & safety
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="surface rounded-2xl p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand-200">
                  <Icon size={16} />
                </span>
                <h3 className="mt-3.5 text-xs font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-ink-900/40 section-pad">
        <div className="container-page">
          <SectionHeader
            eyebrow="Who it serves"
            title={
              <>
                Three sides of the same <span className="serif-accent text-brand-200">marketplace.</span>
              </>
            }
            description="The product separates public discovery, customer workspaces, provider workspaces, and administrator operations so each audience sees only what it needs."
          />
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {[
              {
                title: "Customers with a problem to solve",
                body: "Founders, product teams, and marketing leads who need a specific outcome and want to compare proof, scope, and availability before starting a conversation.",
                link: { to: "/providers", label: "Explore talent" },
              },
              {
                title: "Providers with work to show",
                body: "Freelancers, developers, companies, agencies, and studios who want a structured profile and a clear pipeline of serious inquiries, with team access for larger organizations.",
                link: { to: "/register?role=provider", label: "Join as a provider" },
              },
              {
                title: "Administrators keeping the room usable",
                body: "Moderators who need to review reports, moderate content, manage categories, verify profiles, and keep an audit trail of sensitive actions.",
                link: { to: "/trust", label: "See moderation model" },
              },
            ].map((item, index) => (
              <article key={item.title} className="gradient-border rounded-2xl p-6">
                <span className="font-serif text-3xl italic text-brand-300/40">0{index + 1}</span>
                <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.body}</p>
                <Link to={item.link.to} className="mt-4 inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200">
                  {item.link.label} <ArrowUpRight size={11} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge tone="amber">An honest demo</Badge>
              <h2 className="mt-4 heading-lg text-white">
                What this build is — and what it <span className="serif-accent text-brand-200">isn’t.</span>
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-mint-400/15 bg-mint-400/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-mint-300">What it is</p>
                  <ul className="mt-2.5 space-y-1.5 text-[11px] leading-relaxed text-slate-400">
                    <li>• A working full-stack marketplace</li>
                    <li>• Real authentication, roles, and access checks</li>
                    <li>• Persisted inquiries, proposals, messages, and notifications</li>
                    <li>• Database-driven categories and admin moderation</li>
                    <li>• Seeded with clearly labeled fictional data</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">What it isn’t</p>
                  <ul className="mt-2.5 space-y-1.5 text-[11px] leading-relaxed text-slate-400">
                    <li>• A payment processor or escrow service</li>
                    <li>• A background-check or legal-contract provider</li>
                    <li>• A guarantee of provider outcomes</li>
                    <li>• Real client testimonials</li>
                    <li>• A live production marketplace</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="surface rounded-2xl p-6 text-center">
              <Compass size={26} className="mx-auto text-brand-300" />
              <p className="mt-4 text-sm font-semibold text-white">Want to talk about the product?</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                Questions, feedback, or partnership conversations are welcome. The team inbox is monitored in this demo build.
              </p>
              <Link to="/contact" className={buttonClass("primary", "md", "mt-5 w-full")}>
                Contact {branding.siteName}
              </Link>
              <p className="mt-3 text-[10px] text-slate-600">Support: {branding.supportEmail}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-16">
        <div className="container-page text-center">
          <Sparkles size={22} className="mx-auto text-brand-300" />
          <h2 className="mx-auto mt-4 max-w-xl text-balance heading-md text-white">
            Find the person who has already solved your <span className="serif-accent text-brand-200">next problem.</span>
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/providers" className={buttonClass("primary", "md")}>
              Browse talent <ArrowUpRight size={13} />
            </Link>
            <Link to="/register" className={buttonClass("secondary", "md")}>
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
