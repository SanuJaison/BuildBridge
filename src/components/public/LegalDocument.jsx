import PageHero from "./PageHero";

export default function LegalDocument({ eyebrow, title, intro, updated, sections = [], children }) {
  return (
    <div>
      <PageHero
        compact
        eyebrow={eyebrow}
        title={title}
        description={intro}
        breadcrumbs={[{ label: title }]}
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">On this page</p>
              <nav className="mt-3 space-y-1.5" aria-label="Document sections">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block border-l border-white/[0.08] py-1 pl-3 text-[11px] leading-relaxed text-slate-500 transition hover:border-brand-300/50 hover:text-white"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <p className="mt-6 border-t border-white/[0.07] pt-4 text-[10px] leading-relaxed text-slate-600">
                Last updated
                <span className="mt-0.5 block text-slate-500">{updated}</span>
              </p>
            </div>
          </aside>

          <article data-no-motion className="min-w-0 max-w-3xl">
            <div className="mb-8 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3 text-[11px] leading-relaxed text-amber-200/70">
              <span className="font-semibold text-amber-200">Demonstration build.</span> This document describes how the
              BuildBridge demo operates. It is not legal advice and does not create a binding commercial agreement.
            </div>

            <div className="prose-lite">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 data-split>{section.title}</h2>
                  {section.content}
                </section>
              ))}
              {children}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-[11px] text-slate-500">
              <span>Last updated · {updated}</span>
              <div className="flex gap-4">
                <a href="/terms" className="transition hover:text-white">
                  Terms
                </a>
                <a href="/privacy" className="transition hover:text-white">
                  Privacy
                </a>
                <a href="/contact" className="transition hover:text-white">
                  Contact
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
