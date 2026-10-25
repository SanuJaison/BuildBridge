import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Compass,
  FileSignature,
  Handshake,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import PageHero from "../../components/public/PageHero";
import SectionHeader from "../../components/public/SectionHeader";
import Accordion from "../../components/public/Accordion";
import { buttonClass } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const CUSTOMER_STEPS = [
  {
    icon: Compass,
    number: "01",
    title: "Explore with context",
    body: "Filter by discipline, skill, budget, availability, and location. Profiles show services, published work, and reviews that can only come from completed engagements.",
    detail: "Start from a category page or search directly if you already know the craft you need.",
  },
  {
    icon: FileSignature,
    number: "02",
    title: "Write a useful brief",
    body: "Explain the problem, the audience, your budget range, and the timing. Add up to three private reference files. Attachments stay scoped to you, the provider, and moderators.",
    detail: "A clear brief gets a clearer response. You can send it from a provider profile or the Start a project page.",
  },
  {
    icon: MessageSquare,
    number: "03",
    title: "Talk, then compare",
    body: "Every inquiry opens a private conversation. Ask questions, narrow scope, and review the proposal when it arrives. Proposals record cost, timeline, and deliverables.",
    detail: "Nothing is charged on BuildBridge. A proposal is an agreement in principle, not a payment.",
  },
  {
    icon: Handshake,
    number: "04",
    title: "Deliver and close the loop",
    body: "Accept the scope that fits, keep delivery decisions in the conversation, and mark the engagement complete when the work lands. Only then can you publish a review.",
    detail: "Reviews are tied to the engagement record, one per customer, and cannot be edited into a different engagement.",
  },
];

const PROVIDER_STEPS = [
  {
    icon: Users,
    number: "01",
    title: "Create a provider workspace",
    body: "Choose your provider type, set your categories and skills, and publish a profile with pricing, availability, and links to real work.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Package what you do",
    body: "Add focused services with starting prices and delivery expectations, then publish portfolio case studies that show how you think.",
  },
  {
    icon: BadgeCheck,
    number: "03",
    title: "Respond with clarity",
    body: "Review incoming inquiries, open the discussion, and send a proposal with a clear scope, cost, and timeline. Update status as work progresses.",
  },
  {
    icon: Star,
    number: "04",
    title: "Build a verifiable record",
    body: "Completed engagements count toward your profile. Customers can leave one review per completed engagement, which strengthens the signal over time.",
  },
];

const FAQS = [
  {
    question: "Does BuildBridge handle payments or escrow?",
    answer:
      "No. This build does not process payments, hold funds, or charge commissions. Pricing on services and proposals is recorded information, not a transaction. Any real-world agreement happens outside the demo platform.",
  },
  {
    question: "How do I know a profile is legitimate?",
    answer:
      "Administrators can set a verified mark on profiles after review. Reviews are tied to completed engagement records, and reports route to moderators. In this demo, all provider profiles and reviews are clearly labeled fictional seed data.",
  },
  {
    question: "Can I start an inquiry without an account?",
    answer:
      "You need an account to send a brief. Creating a customer account is free. Provider accounts need a profile before they can receive inquiries.",
  },
  {
    question: "How does an agency manage multiple people?",
    answer:
      "Company, agency, and studio accounts receive an organization workspace. Owners and admins can invite provider accounts, assign roles, and share access to services, portfolio, inquiries, and conversations. Profile and organization settings stay restricted to managers.",
  },
  {
    question: "What happens if an engagement goes wrong?",
    answer:
      "You can cancel an inquiry before completion, report a profile, service, review, message, or project, and contact the platform team. Administrators can review reports, moderate content, and suspend accounts. There is no payment dispute process because there are no payments on this build.",
  },
  {
    question: "Can a provider review a customer?",
    answer:
      "No. Reviews are one-directional in this build: only the customer on a completed engagement can publish a single review. This keeps the review record tied to delivered work.",
  },
];

export default function HowItWorks() {
  usePageTitle("How BuildBridge works");

  return (
    <div>
      <PageHero
        eyebrow="How it works"
        title={
          <>
            A calmer path from <span className="serif-accent text-gradient">brief to build.</span>
          </>
        }
        description="BuildBridge is built around one idea: the important parts of hiring a specialist should be visible in one place. Discovery, briefs, proposals, conversations, and completed-work reviews all share a record."
        breadcrumbs={[{ label: "How it works" }]}
        aside={
          <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
            <Link to="/start-project" className={buttonClass("primary", "md")}>
              Start a project brief
              <ArrowUpRight size={14} />
            </Link>
            <Link to="/providers" className={buttonClass("secondary", "md")}>
              Explore talent
            </Link>
          </div>
        }
      />

      <section className="section-pad">
        <div className="container-page">
          <SectionHeader
            eyebrow="For customers"
            title={
              <>
                From “we need help” to a <span className="serif-accent text-brand-200">clear next step.</span>
              </>
            }
            description="No proposals auction, no mystery pricing. A straightforward sequence designed to keep expectations aligned before work starts."
          />

          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            {CUSTOMER_STEPS.map(({ icon: Icon, number, title, body, detail }) => (
              <article key={number} className="surface relative overflow-hidden rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-white/[0.02] text-brand-200">
                    <Icon size={19} />
                  </span>
                  <span className="font-serif text-3xl italic text-white/10">{number}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{body}</p>
                <p className="mt-3 border-t border-white/[0.07] pt-3 text-[11px] leading-relaxed text-slate-500">{detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register" className={buttonClass("primary", "md")}>
              Create a customer account
            </Link>
            <Link to="/how-it-works#trust" className="inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200">
              How reviews and trust work <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-ink-900/40 section-pad">
        <div className="container-page">
          <SectionHeader
            eyebrow="For providers"
            title={
              <>
                Show the work. Set the <span className="serif-accent text-brand-200">terms.</span>
              </>
            }
            description="A provider workspace is a real dashboard, not a static listing. Manage your profile, services, portfolio, inquiries, proposals, and team access from one place."
            action={
              <Link to="/register?role=provider" className={buttonClass("secondary", "md")}>
                Join as a provider <ArrowUpRight size={14} />
              </Link>
            }
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROVIDER_STEPS.map(({ icon: Icon, number, title, body }) => (
              <article key={number} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <Icon size={18} className="text-mint-400" />
                  <span className="text-[10px] font-medium text-slate-600">{number}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Published profile", body: "Only published profiles appear in discovery and can receive inquiries." },
              { title: "Scoped access", body: "Team members only see workspaces their role has been granted access to." },
              { title: "No fake activity", body: "Ratings come from published reviews tied to completed records. Demo data is labeled." },
            ].map((item) => (
              <div key={item.title} className="flex gap-2.5 rounded-xl border border-white/[0.07] bg-ink-950/40 px-4 py-3.5">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-mint-400" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">{item.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="section-pad">
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="eyebrow">The trust model</p>
            <h2 className="mt-3 heading-lg text-white">
              Designed to make claims <span className="serif-accent text-brand-200">checkable.</span>
            </h2>
            <p data-scroll-words className="mt-5 text-sm leading-relaxed text-slate-400">
              Marketplaces often blur what is verified, what is paid placement, and what is simply marketing. BuildBridge
              keeps those categories separate and visible.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="blue">
                <ShieldCheck size={11} />
                Moderated reports
              </Badge>
              <Badge tone="mint">Review gating</Badge>
              <Badge tone="violet">Private files</Badge>
            </div>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08]">
              <img
                src="/static/demo/photos/dev-collab.jpg"
                alt=""
                className="h-44 w-full object-cover opacity-80"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <div className="p-5">
                <p className="text-xs font-semibold text-white">Built as a real workflow</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                  Inquiries, proposals, messages, notifications, reviews, reports, and moderation all persist in the
                  database with access checks on every read.
                </p>
                <Link to="/trust" className="mt-3 inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200">
                  Read the trust and safety detail <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h3 className="heading-md text-white">
              Common <span className="serif-accent text-brand-200">questions.</span>
            </h3>
            <div className="mt-5">
              <Accordion items={FAQS} />
            </div>
            <div className="mt-6 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3.5 text-[11px] leading-relaxed text-amber-200/70">
              <span className="font-semibold text-amber-200">Demo environment.</span> Profiles, services, projects,
              reviews, and engagement records are fictional seed data. No real payments, backgrounds checks, or contracts
              are provided by this build.
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-16 lg:py-24">
        <div className="container-page">
          <div className="gradient-border rounded-[26px] p-7 text-center sm:p-12">
            <Badge tone="violet" className="mx-auto">
              <Search size={11} />
              Ready when you are
            </Badge>
            <h2 className="mx-auto mt-5 max-w-2xl text-balance heading-lg text-white">
              Start with a brief, or start with a <span className="serif-accent text-brand-200">person.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
              Both routes lead to the same place: a private conversation, a clear proposal, and a record of what was
              agreed.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/start-project" className={buttonClass("primary", "lg")}>
                Start a project brief <ArrowUpRight size={14} />
              </Link>
              <Link to="/providers" className={buttonClass("secondary", "lg")}>
                Browse specialists
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
