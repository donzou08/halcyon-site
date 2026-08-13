import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, ContactRoutes, Page } from '../components/chrome'
import { NoResults, SearchField } from '../components/Search'
import { SystemCard } from '../components/SystemCard'
import { NICHES, SYSTEMS, systemBySlug } from '../data/catalogue'
import { PRICING_STANCE, SAMPLE_DATA_NOTE } from '../data/site'
import { search } from '../lib/search'

/**
 * The portfolio.
 *
 * This site is the work and nothing else. There is no marketing funnel above it
 * and no pricing table below it: halcyon.uno is the company site and is
 * unchanged, and this is designed to be mounted at halcyon.uno/works.
 *
 * The search field is the whole design. A visitor arrives thinking in one of two
 * ways, either about their trade ("we do pest control") or about the job that
 * keeps coming back ("we keep retyping quotations"), and both have to return
 * something. A match on a trade Halcyon has never worked in is a first-class
 * result, because the systems generalise by workflow and the visitor cannot know
 * that yet.
 */
export default function Home() {
  const [query, setQuery] = useState('')
  const hits = useMemo(() => search(query), [query])
  const searching = query.trim().length > 0
  const lead = systemBySlug('command-center')

  return (
    <Page>
      <div className="border-b border-rule bg-sunk">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5">
          <span className="field field-teal">The Halcyon Works</span>
          <span className="field">Custom software, built for one business each</span>
          <span className="field ml-auto hidden sm:block">Sample data throughout</span>
        </Container>
      </div>

      {/* -------------------------------------------------- Opening */}
      <section className="border-b border-rule">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-10">
          <div className="lg:col-span-5">
            <h1 className="display text-[2.5rem] leading-[1.02] sm:text-[3.2rem]">
              The products we have built.
            </h1>
            <p className="prose-measure mt-6 text-[1.05rem] leading-relaxed text-ink-2">
              Halcyon builds operational software to order, one business at a time. Every system
              below is the actual application rather than a picture of one. It runs in your browser,
              filled with invented data, so you can press anything without breaking anything.
            </p>
            <p className="prose-measure mt-4 text-[0.95rem] leading-relaxed text-ink-3">
              Use them the way your people would. Start by searching for what you do, or for the job
              you keep doing twice.
            </p>

            <div className="mt-9">
              <SearchField value={query} onChange={setQuery} />
            </div>
          </div>

          <div className="lg:col-span-7 lg:row-span-2">
            {lead && (
              <div className="plot border border-rule-strong bg-raised">
                <div className="flex items-center justify-between border-b border-rule px-3 py-2">
                  <span className="field">{lead.name}</span>
                  <span className="field">Sample data</span>
                </div>
                <div style={{ aspectRatio: '1360 / 850' }} className="overflow-hidden bg-sunk">
                  <img
                    src={`/shots/${lead.shots[0].src}.png`}
                    alt={lead.shots[0].caption}
                    width={1360}
                    height={850}
                    fetchPriority="high"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
            )}
            {lead && (
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[0.82rem] text-ink-3">{lead.shots[0].caption}</p>
                <Link
                  to={`/${lead.slug}`}
                  className="shrink-0 text-[0.84rem] font-500 text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
                >
                  Open this one
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <ul className="border-t border-rule-strong">
              {SYSTEMS.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/${s.slug}`}
                    className="group flex items-center gap-3 border-b border-rule py-3 transition-colors hover:text-gold-ink"
                  >
                    <span className="field w-[3.4rem] shrink-0 whitespace-nowrap">{s.code}</span>
                    <span className="min-w-0 flex-1 text-[0.95rem] text-ink transition-colors group-hover:text-gold-ink">
                      {s.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-[0.8rem] text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- The catalogue */}
      <section>
        <Container className="py-12 sm:py-16">
          {searching ? (
            hits.length > 0 ? (
              <div className="settle">
                <div className="mb-8 flex items-baseline gap-3 border-b border-rule-strong pb-4">
                  <span className="num text-[1.05rem] font-500 text-gold-ink">{hits.length}</span>
                  <span className="text-[0.9rem] text-ink-2">
                    {hits.length === 1 ? 'system' : 'systems'} for “{query.trim()}”
                  </span>
                  <button
                    onClick={() => setQuery('')}
                    className="ml-auto text-[0.84rem] text-ink-3 transition-colors hover:text-ink"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-5">
                  {hits.map((h) => (
                    <SystemCard key={h.system.slug} system={h.system} reasons={h.reasons} />
                  ))}
                </div>
              </div>
            ) : (
              <NoResults query={query.trim()} />
            )
          ) : (
            <div className="space-y-20">
              {NICHES.map((niche) => {
                const systems = SYSTEMS.filter((s) => s.niche === niche.slug)
                if (systems.length === 0) return null
                return (
                  <div key={niche.slug} id={niche.slug}>
                    <div className="mb-8 flex flex-col gap-4 border-b border-rule-strong pb-5 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h2 className="display text-[1.7rem] sm:text-[2.1rem]">{niche.name}</h2>
                        <p className="prose-measure mt-3 text-[0.94rem] leading-relaxed text-ink-2">
                          {niche.blurb}
                        </p>
                      </div>
                      <span className="field shrink-0">
                        {systems.length} {systems.length === 1 ? 'system' : 'systems'}
                      </span>
                    </div>
                    <div className="space-y-5">
                      {systems.map((s) => (
                        <SystemCard key={s.slug} system={s} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Container>
      </section>

      {!searching && (
        <>
          {/* ---------------------------------------------- How to read it */}
          <section className="border-t border-rule">
            <Container className="py-16">
              <span className="field field-teal">How to read this page</span>
              <div className="hairline-grid mt-8 md:grid-cols-3">
                <Note title="Grouped by trade, useful by workflow">
                  The headings above are industries because that is how people look. The systems
                  themselves are not industry software. One that proves a supervisor went to a site
                  works the same whether the site is a factory floor or a restaurant kitchen.
                </Note>
                <Note title="Nothing here is real data">{SAMPLE_DATA_NOTE}</Note>
                <Note title="Nothing here is off the shelf">
                  Each of these was built for one business and its actual working method. What
                  transfers between them is the shape of the problem, not the software. Yours would
                  be built the same way.
                </Note>
              </div>
            </Container>
          </section>

          {/* ---------------------------------------------- Cost */}
          <section className="on-obsidian bg-obsidian py-16 text-on-obsidian-2 sm:py-20">
            <Container>
              <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <span className="field text-gold">What it costs</span>
                  <h2 className="display mt-4 text-[1.9rem] text-on-obsidian sm:text-[2.5rem]">
                    {PRICING_STANCE.heading}
                  </h2>
                  <p className="prose-measure mt-5 text-[1rem] leading-relaxed">
                    {PRICING_STANCE.body}
                  </p>
                  <p className="prose-measure mt-4 text-[0.9rem] leading-relaxed text-on-obsidian-2">
                    {PRICING_STANCE.note}
                  </p>
                </div>
              </div>
            </Container>
          </section>

          {/* ---------------------------------------------- Close */}
          <section>
            <Container className="py-16 sm:py-24">
              <div className="max-w-3xl">
                <h2 className="display text-[2rem] sm:text-[2.7rem]">
                  The useful conversation is about the job you are doing twice.
                </h2>
                <p className="prose-measure mt-5 text-[1.02rem] leading-relaxed text-ink-2">
                  Not about software. Tell us how work actually moves through your business,
                  including the parts held together by one person who knows where everything is. We
                  will tell you what is worth building and what is not.
                </p>
                <div className="mt-9">
                  <ContactRoutes />
                </div>
              </div>
            </Container>
          </section>
        </>
      )}
    </Page>
  )
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6">
      <h3 className="display-sm text-[1.02rem]">{title}</h3>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-2">{children}</p>
    </div>
  )
}
