import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  CheckCircle2,
  FileWarning,
  Flag,
  LockKeyhole,
  MessageSquareWarning,
  Scale,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import PageHero from "../../components/public/PageHero";
import SectionHeader from "../../components/public/SectionHeader";
import { buttonClass } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const PILLARS = [
  {
    icon: BadgeCheck,
    title: "Verification is explicit",
    body: "A verified mark is set by platform administrators after review. It is not implied by profile completeness, payment, or featured placement. Featured profiles are labeled separately.",
  },
  {
    icon: Star,
    title: "Reviews require a completed record",
    body: "Only the customer on a completed engagement can submit one review. Providers cannot review themselves or each other, and ratings are recomputed from published reviews.",
  },
  {
    icon: LockKeyhole,
    title: "Private means access-checked",
    body: "Inquiry attachments are served through an endpoint that verifies the requester is the customer, an authorized provider team member, or an administrator.",
  },
  {
    icon: ShieldCheck,
    title: "Moderation leaves a trail",
    body: "Sensitive administrator actions such as suspensions, review removal, and category changes are recorded in an admin audit log.",
  },
];

const CUSTOMER_RULES = [
  "Describe the work truthfully. Do not use briefs for spam, scraping, or unrelated outreach.",
  "Keep payments and sensitive financial details outside the platform. BuildBridge does not process payments in this build.",
  "Do not upload files you do not have the right to share.",
  "Use the report flow for content that breaks these guidelines instead of retaliating in messages.",
  "A review is for a completed engagement only. It should describe the work, not personal attacks.",
];

const PROVIDER_RULES = [
  "Only claim skills, experience, and portfolio work you can substantiate.",
  "Keep service pricing and delivery expectations honest and current.",
  "Do not send proposals off-platform to avoid the record, or pressure a customer into paying upfront through the platform.",
  "Do not share a customer's private brief, files, or conversation without permission.",
  "Respond to an inquiry you cannot take by declining or cancelling it, rather than leaving it in limbo.",
];

const REPORTABLE = [
  "Misleading or false information",
  "Spam, scam, or impersonation",
  "Inappropriate or harmful content",
  "Intellectual property concerns",
  "Harassment in messages or reviews",
  "Services that promise prohibited or deceptive outcomes",
];

export default function Trust() {
  usePageTitle("Trust & safety");

  return (
    <div>
      <PageHero
        eyebrow="Trust & safety"
        title={
          <>
            Trust is a system, not a <span className="serif-accent text-gradient">badge.</span>
          </>
        }
        description="BuildBridge separates what is verified, what is earned through completed work, and what is simply labeled demo data. This page explains the controls that exist in the product and the limits of this build."
        breadcrumbs={[{ label: "Trust & safety" }]}
        aside={
          <div className="surface rounded-2xl p-5">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-mint-300">
              <ShieldCheck size={12} />
              Platform controls
            </p>
            <ul className="mt-3 space-y-2 text-[11px] text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-mint-400" /> Access-checked records
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-mint-400" /> Rate-limited writes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-mint-400" /> Moderated reports
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-mint-400" /> Admin audit logging
              </li>
            </ul>
            <Link to="/contact" className={buttonClass("secondary", "sm", "mt-4 w-full")}>
              Contact the team
            </Link>
          </div>
        }
      />

      <div className="border-b border-white/[0.06] bg-ink-900/40">
        <div className="container-page flex flex-wrap gap-2 py-4">
          {[
            { href: "#verification", label: "Verification" },
            { href: "#reviews", label: "Reviews" },
            { href: "#privacy", label: "Privacy" },
            { href: "#reporting", label: "Reporting" },
            { href: "#guidelines", label: "Community guidelines" },
            { href: "#demo", label: "Demo disclosure" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-slate-400 transition hover:border-brand-300/30 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <section className="section-pad">
        <div className="container-page">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <article key={title} className="surface rounded-2xl p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-200">
                  <Icon size={17} />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-white">{title}</h2>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="verification" className="border-t border-white/[0.06] bg-ink-900/40 section-pad scroll-mt-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Verification</p>
            <h2 className="mt-3 heading-lg text-white">
              What a verified mark <span className="serif-accent text-brand-200">means.</span>
            </h2>
            <p data-scroll-words className="mt-5 text-sm leading-relaxed text-slate-400">
              Verification is a moderation decision, not an automated score. An administrator can mark a provider profile
              as verified after reviewing the information available to the platform. The mark does not certify quality,
              pricing, availability, or the outcome of future work.
            </p>
            <ul className="mt-5 space-y-2.5 text-xs leading-relaxed text-slate-400">
              <li className="flex gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-mint-400" />
                Verified and featured are separate signals. Featured placement is labeled and is not a quality guarantee.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-mint-400" />
                A suspended profile is removed from public discovery until an administrator restores it.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-mint-400" />
                Ratings display only if they derive from published reviews. A blank rating is shown as “New,” not a hidden score.
              </li>
            </ul>
          </div>

          <div className="surface rounded-2xl p-6">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <UserCheck size={12} className="text-brand-300" />
              Provider account states
            </p>
            <div className="mt-4 space-y-3">
              {[
                { state: "Draft", tone: "slate", copy: "The profile exists but is not visible or discoverable. Inquiries cannot be received." },
                { state: "Published", tone: "mint", copy: "Visible in public discovery and eligible to receive project inquiries." },
                { state: "Suspended", tone: "red", copy: "Removed from public discovery following a moderation decision. Existing records remain for administrators." },
              ].map((item) => (
                <div key={item.state} className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                  <Badge tone={item.tone}>{item.state}</Badge>
                  <p className="flex-1 text-[11px] leading-relaxed text-slate-500">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="section-pad scroll-mt-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="eyebrow">Reviews & ratings</p>
            <h2 className="mt-3 heading-lg text-white">
              Feedback follows <span className="serif-accent text-brand-200">finished work.</span>
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-400">
              <p>
                A review can only be created by the customer on an engagement whose status is completed. Each engagement
                accepts one review. The provider rating is calculated from reviews that remain published, so hidden or
                removed reviews no longer contribute.
              </p>
              <p>
                Reviews are not editable by providers and cannot be purchased or inflated through the platform interface.
                Administrators can hide or remove a review when it breaks the content guidelines, and the action is
                recorded in the audit log.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Eligibility checklist</p>
            <ul className="mt-4 space-y-3">
              {[
                "You are the customer who created the inquiry.",
                "The engagement status is completed.",
                "No review already exists for this engagement.",
                "The review names no private personal data.",
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-400">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-mint-400/25 bg-mint-400/10 font-serif text-[10px] italic text-mint-300">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/dashboard/reviews" className="mt-5 inline-flex items-center gap-1 text-[11px] text-brand-300 hover:text-brand-200">
              My reviews <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </section>

      <section id="privacy" className="border-t border-white/[0.06] bg-ink-900/40 section-pad scroll-mt-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Privacy & files</p>
            <h2 className="mt-3 heading-lg text-white">
              A brief is not <span className="serif-accent text-brand-200">public content.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              Inquiry briefs, attachments, and conversations are visible only to the people involved. Uploads are stored
              outside the public demo asset directory and served through a route that checks the signed-in requester
              against the inquiry relationship.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Account passwords are hashed with bcrypt and session tokens are delivered in an httpOnly cookie where
              available. Secrets, database URLs, and signing keys are read from environment variables and are not exposed
              to the browser.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: LockKeyhole, title: "Private uploads", body: "Access check on every file request, including attachment downloads." },
              { icon: MessageSquareWarning, title: "Scoped conversations", body: "Socket rooms require authentication and conversation access." },
              { icon: Scale, title: "Least privilege", body: "Provider team roles determine which workspace actions are allowed." },
              { icon: Ban, title: "Session controls", body: "Passwords are never stored in plain text; sessions can be cleared on demand." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <Icon size={16} className="text-brand-300" />
                <h3 className="mt-3 text-xs font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reporting" className="section-pad scroll-mt-24">
        <div className="container-page">
          <SectionHeader
            eyebrow="Reporting & moderation"
            title={
              <>
                A path for things that <span className="serif-accent text-brand-200">go wrong.</span>
              </>
            }
            description="Signed-in users can report providers, services, portfolio items, reviews, and messages. Duplicate open reports for the same item are rejected to keep the queue usable."
          />

          <div className="mt-9 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface rounded-2xl p-6">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                <Flag size={12} className="text-rose-300" />
                What can be reported
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {REPORTABLE.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">
                    <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-300" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                Reports are reviewed by administrators, not automatically enforced. A report does not by itself remove a
                profile or review. Abusive reporting can affect the reporting account.
              </p>
            </div>

            <div className="surface rounded-2xl p-6">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                <ShieldCheck size={12} className="text-mint-400" />
                Moderation actions
              </p>
              <ul className="mt-4 space-y-2.5 text-[11px] leading-relaxed text-slate-400">
                <li>• Mark a report as reviewing, resolved, or dismissed.</li>
                <li>• Hide or remove a review that breaks guidelines.</li>
                <li>• Suspend or restore a provider profile.</li>
                <li>• Suspend or reactivate a member account.</li>
                <li>• Create, edit, deactivate, or reorder categories.</li>
                <li>• Record the action and actor in an audit log.</li>
              </ul>
              <p className="mt-4 border-t border-white/[0.07] pt-3.5 text-[10px] leading-relaxed text-slate-600">
                Moderators do not adjudicate payments or contracts in this build. For emergencies, contact local
                authorities first.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="guidelines" className="border-t border-white/[0.06] bg-ink-900/40 section-pad scroll-mt-24">
        <div className="container-page">
          <SectionHeader
            eyebrow="Community guidelines"
            title={
              <>
                Keep the marketplace <span className="serif-accent text-brand-200">useful.</span>
              </>
            }
            description="These rules apply to profiles, services, portfolio descriptions, messages, proposals, reviews, and reports."
          />
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {[
              { title: "For customers", items: CUSTOMER_RULES },
              { title: "For providers", items: PROVIDER_RULES },
            ].map((group) => (
              <div key={group.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <FileWarning size={13} className="text-brand-300" />
                  {group.title}
                </h3>
                <ul className="mt-3.5 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="border-t border-white/[0.06] py-16 scroll-mt-24">
        <div className="container-page">
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-6 sm:p-8">
            <Badge tone="amber">
              <AlertTriangle size={11} />
              Demo disclosure
            </Badge>
            <h2 className="mt-4 text-xl font-semibold text-white">This is a demonstration marketplace</h2>
            <div className="mt-3 grid gap-4 text-[11px] leading-relaxed text-amber-100/60 sm:grid-cols-2">
              <p>
                Provider profiles, names, reviews, ratings, services, portfolio projects, and engagement histories are
                fictional seed data created to demonstrate the workflow. They do not represent real people or real
                marketplace activity.
              </p>
              <p>
                No payments, escrow, identity verification, background checks, or legal contracts are provided. Do not
                send money or sensitive personal information to anyone you meet through this demo. Report suspicious
                content rather than engaging with it.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/contact" className={buttonClass("secondary", "sm")}>
                Ask a safety question
              </Link>
              <Link to="/privacy" className={buttonClass("ghost", "sm")}>
                Privacy overview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
