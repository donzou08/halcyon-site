import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Container, Page } from '../components/chrome'
import { NoResults, SearchField } from '../components/Search'
import { SystemCard } from '../components/SystemCard'
import { NICHES, SYSTEMS } from '../data/catalogue'
import { search } from '../lib/search'

/**
 * The Works: the portfolio portal.
 *
 * The search field is the whole design. A visitor arrives thinking in one of two
 * ways, either about their trade ("we do pest control") or about the job that
 * keeps coming back ("we keep retyping quotations"), and both have to return
 * something. A match on a trade Halcyon has never worked in is a first-class
 * result, because the systems generalise by workflow and the visitor cannot know
 * that yet.
 *
 * Below the field, the catalogue is grouped by industry, because that is how
 * people look even when the grouping is not the useful part.
 */
export default function Works() {
  const [query, setQuery] = useState('')
  const hits = useMemo(() => search(query), [query])
  const searching = query.trim().length > 0

  return (
    <Page>
      <div className="border-b border-rule bg-sunk">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5">
          <span className="field field-teal">The Halcyon Works</span>
          <span className="field">Five systems</span>
          <span className="field ml-auto hidden sm:block">Sample data throughout</span>
        </Container>
      </div>

      <section className="border-b border-rule">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h1 className="display text-[2.3rem] leading-[1.04] sm:text-[3rem]">
              Every system here is a working application, not a picture of one.
            </h1>
            <p className="prose-measure mt-6 text-[1.02rem] leading-relaxed text-ink-2">
              They run in your browser, filled with invented data, so you can press anything without
              breaking anything. Use them the way your people would. Start by searching for what you
              do, or for the job you keep doing twice.
            </p>

            <div className="mt-10">
              <SearchField value={query} onChange={setQuery} />
            </div>
          </div>

          {/* The index. Without it the right half of a desktop screen is empty
              while the visitor is deciding what to type, and the fastest answer
              for somebody who already knows what they want is the plain list. */}
          <div className="lg:col-span-5">
            <div className="border border-rule bg-raised">
              <div className="border-b border-rule px-5 py-2.5">
                <span className="field">Index</span>
              </div>
              <ul>
                {SYSTEMS.map((s) => (
                  <li key={s.slug} className="border-b border-rule last:border-b-0">
                    <Link
                      to={`/works/${s.slug}`}
                      className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-sunk"
                    >
                      <span className="field w-[3.2rem] shrink-0">{s.code}</span>
                      <span className="min-w-0 flex-1 text-[0.95rem] text-ink transition-colors group-hover:text-gold-ink">
                        {s.name}
                      </span>
                      {s.provenance === 'production' && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                          title="Running in production"
                          aria-label="Running in production"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[0.78rem] text-ink-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
              Rebuilt from a system running in production
            </p>
          </div>
        </Container>
      </section>

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
        <section className="border-t border-rule">
          <Container className="py-16">
            <span className="field field-teal">How to read this page</span>
            <div className="hairline-grid mt-8 md:grid-cols-3">
              <Note title="Grouped by trade, useful by workflow">
                The headings above are industries because that is how people look. The systems
                themselves are not industry software. One that proves a supervisor went to a site
                works the same whether the site is a factory floor or a restaurant kitchen.
              </Note>
              <Note title="Nothing here is real data">
                Every business, person, price and figure in every demonstration is invented. Client
                systems are never shown. Where a demonstration rebuilds something running in
                production, its card says so, and where it does not, its card says that too.
              </Note>
              <Note title="Nothing here is off the shelf">
                Each of these was built for one business and its actual working method. What
                transfers between them is the shape of the problem, not the software. Yours would be
                built the same way.
              </Note>
            </div>
          </Container>
        </section>
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
