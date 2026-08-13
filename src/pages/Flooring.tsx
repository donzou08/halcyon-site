import { Link } from 'react-router-dom'
import { Container, ContactRoutes, Page } from '../components/chrome'
import { SYSTEMS, systemBySlug, type System } from '../data/catalogue'
import { KNOWS_THE_TRADE, LEAKS, LIMITS, RATE_CARD, STAGES } from '../data/flooring'
import { asset } from '../lib/paths'

/**
 * The industrial flooring landing page.
 *
 * Mode: persuade, at one trade. This is the page an advertisement aimed at
 * flooring contractors should land on, and the only page here whose reader knows
 * the subject better than the site does. So it does not explain flooring back to
 * them. It shows that the software already speaks it, and then gets out of the
 * way and lets them open the three systems.
 *
 * The spine is the order the money leaks out in: finding the job, pricing the
 * job, running the job. Those are the three applications, in the sequence a
 * contract actually happens, which is why this trade earns a page rather than a
 * card on the index.
 */
export default function Flooring() {
  const three = ['tender', 'quotation', 'supervisor']
    .map((s) => systemBySlug(s))
    .filter((s): s is System => Boolean(s))

  const quotation = systemBySlug('quotation')

  return (
    <Page>
      <div className="border-b border-rule bg-sunk">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5">
          <span className="field field-teal">Industrial flooring and coatings</span>
          <span className="field">Three systems</span>
          <span className="field ml-auto hidden sm:block">Sample data throughout</span>
        </Container>
      </div>

      {/* -------------------------------------------------- Hero */}
      <section className="border-b border-rule">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-10">
          <div className="lg:col-span-5">
            <h1 className="display text-[2.4rem] leading-[1.02] sm:text-[3.1rem]">
              Software that knows what a screed coat is.
            </h1>
            <p className="prose-measure mt-6 text-[1.05rem] leading-relaxed text-ink-2">
              Three systems built for one industrial flooring contractor, and shaped around the way
              flooring work actually runs: find the job, price the job, run the job. Not a
              construction package with a flooring template dropped into it.
            </p>
            <p className="prose-measure mt-4 text-[0.95rem] leading-relaxed text-ink-3">
              All three are on this page and all three are the real applications. Open one and use
              it. The data inside is invented, so press anything.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#systems"
                className="border border-ink bg-ink px-7 py-4 text-center text-[0.95rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                Open the three systems
              </a>
              <a
                href="#trade"
                className="border border-rule-strong px-7 py-4 text-center text-[0.95rem] font-500 text-ink transition-colors hover:border-ink"
              >
                What it already knows
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 lg:row-span-2">
            {quotation && (
              <>
                <div className="plot border border-rule-strong bg-raised">
                  <div className="flex items-center justify-between border-b border-rule px-3 py-2">
                    <span className="field">Quotation Engine</span>
                    <span className="field">Sample data</span>
                  </div>
                  {/* Cropped to the part that sells it: the line item, the tax
                      split and the total payable. A taller window shows more of
                      the phone and less of the point, and leaves the text
                      column short beside it. */}
                  <div style={{ aspectRatio: '390 / 400' }} className="overflow-hidden bg-sunk">
                    <img
                      src={asset('shots/quotation-review.png')}
                      alt="A finished quotation: the line item, basic amount, the CGST and SGST split and the total payable."
                      width={390}
                      height={844}
                      fetchPriority="high"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: '50% 45%' }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-3">
                  18,000 sq.ft of 3mm epoxy self-levelling, priced from the rate card, split into
                  CGST and SGST because the site is in state, and ready to send as a PDF.
                </p>
              </>
            )}
          </div>

          <div className="lg:col-span-5">
            <dl className="grid grid-cols-3 divide-x divide-rule border-t border-rule-strong">
              {[
                { value: 'Under 1 min', label: 'per quotation, from an hour' },
                { value: '23', label: 'sites tracked live' },
                { value: '5 min', label: 'per tender scan, from 5 hours' },
              ].map((f, i) => (
                <div key={f.label} className={`pt-5 pb-1 ${i === 0 ? 'pr-3' : 'px-3'}`}>
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <span className="num block text-[0.95rem] leading-tight font-500 text-gold-ink sm:text-[1.2rem]">
                      {f.value}
                    </span>
                    <span className="mt-2 block text-[0.72rem] leading-snug text-ink-3">
                      {f.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-3">
              Measured on the flooring contractor these were built for, in daily use. Method
              available on request.
            </p>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Where it leaks */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-20">
          <span className="field field-teal">Where a flooring contract loses money</span>
          <h2 className="display mt-4 max-w-2xl text-[2rem] sm:text-[2.6rem]">
            Three places, in the order they happen.
          </h2>

          <ol className="mt-12 space-y-px bg-rule">
            {LEAKS.map((leak, i) => {
              const system = systemBySlug(leak.slug)
              return (
                <li key={leak.slug} className="bg-paper">
                  <div className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-3">
                      <span className="num text-[0.85rem] text-gold-ink">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="display-sm mt-2 text-[1.2rem]">{leak.stage}</h3>
                      {system && (
                        <Link
                          to={`/${system.slug}`}
                          className="mt-3 inline-block text-[0.84rem] font-500 text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
                        >
                          {system.name} →
                        </Link>
                      )}
                    </div>
                    <div className="lg:col-span-5">
                      <p className="text-[1.02rem] leading-relaxed text-ink">{leak.title}</p>
                      <p className="mt-3 text-[0.94rem] leading-relaxed text-ink-2">{leak.body}</p>
                    </div>
                    <div className="lg:col-span-4">
                      <span className="field">What it costs</span>
                      <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-2">{leak.cost}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </Container>
      </section>

      {/* -------------------------------------------------- It knows the trade */}
      <section id="trade" className="scroll-mt-20 border-b border-rule bg-sunk/60">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <span className="field field-teal">Built for the trade, not configured for it</span>
              <h2 className="display mt-4 text-[2rem] sm:text-[2.5rem]">
                It already knows how flooring is priced and how it is run.
              </h2>
              <p className="prose-measure mt-5 text-[1rem] leading-relaxed text-ink-2">
                Everything below is in the applications on this page. None of it had to be
                explained to them, and all of it is the sort of thing you would spend a week
                teaching a general-purpose tool before giving up.
              </p>

              <div className="mt-10 border border-rule bg-raised">
                <div className="border-b border-rule px-5 py-2.5">
                  <span className="field">The rate card it ships with</span>
                </div>
                <ul className="divide-y divide-rule">
                  {RATE_CARD.map((s) => (
                    <li key={s.name} className="px-5 py-3">
                      <span className="block text-[0.9rem] text-ink">{s.name}</span>
                      <span className="mt-0.5 block text-[0.78rem] text-ink-3">{s.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <span className="field">And the stages it tracks a job through</span>
                <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
                  {STAGES.map((stage, i) => (
                    <li key={stage} className="flex items-center gap-2">
                      <span className="border border-rule-strong bg-raised px-3 py-1.5 text-[0.84rem] text-ink-2">
                        {stage}
                      </span>
                      {i < STAGES.length - 1 && (
                        <span aria-hidden="true" className="text-[0.8rem] text-ink-3">
                          →
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ul className="border-t border-rule-strong">
                {KNOWS_THE_TRADE.map((d) => (
                  <li key={d.label} className="border-b border-rule py-5">
                    <div className="grid grid-cols-[0.9rem_1fr] gap-x-4">
                      <span aria-hidden="true" className="mt-2.5 h-px w-3 bg-gold" />
                      <div>
                        <h3 className="text-[1rem] leading-snug font-500 text-ink">{d.label}</h3>
                        <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-2">{d.body}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- The three systems */}
      <section id="systems" className="scroll-mt-20 border-b border-rule">
        <Container className="py-16 sm:py-20">
          <span className="field field-teal">The three systems</span>
          <h2 className="display mt-4 max-w-2xl text-[2rem] sm:text-[2.6rem]">
            Every one of them opens. None of them is a video.
          </h2>

          <div className="mt-14 space-y-16 sm:space-y-24">
            {three.map((system, i) => {
              const shot = system.shots[0]
              const flipped = i % 2 === 1
              return (
                <article key={system.slug} className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                  <div
                    className={`lg:col-span-5 ${flipped ? 'lg:order-2' : ''}`}
                  >
                    <div className="border border-rule-strong bg-raised">
                      <div className="flex items-center justify-between border-b border-rule px-3 py-2">
                        <span className="field">{system.code}</span>
                        <span className="field">Sample data</span>
                      </div>
                      <div
                        style={{ aspectRatio: shot.kind === 'phone' ? '390 / 620' : '1360 / 850' }}
                        className="overflow-hidden bg-sunk"
                      >
                        <img
                          src={asset(`shots/${shot.src}.png`)}
                          alt={shot.caption}
                          width={shot.kind === 'phone' ? 390 : 1360}
                          height={shot.kind === 'phone' ? 844 : 850}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: shot.focus ?? '50% 0%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`lg:col-span-7 ${flipped ? 'lg:order-1' : ''}`}>
                    <h3 className="display text-[1.8rem] sm:text-[2.2rem]">{system.name}</h3>
                    <p className="prose-measure mt-4 text-[1.02rem] leading-relaxed text-ink-2">
                      {system.tagline}
                    </p>

                    <ul className="mt-7 border-t border-rule-strong">
                      {system.does.slice(0, 4).map((d) => (
                        <li
                          key={d}
                          className="grid grid-cols-[0.9rem_1fr] gap-x-4 border-b border-rule py-3.5"
                        >
                          <span aria-hidden="true" className="mt-2 h-px w-3 bg-gold" />
                          <span className="text-[0.93rem] leading-relaxed text-ink-2">{d}</span>
                        </li>
                      ))}
                    </ul>

                    {system.proof.length > 0 && (
                      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
                        {system.proof.map((p) => (
                          <div key={p.label}>
                            <dt className="text-[0.72rem] leading-snug text-ink-3">{p.label}</dt>
                            <dd className="num mt-0.5 text-[1rem] font-500 text-gold-ink">
                              {p.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    <Link
                      to={`/${system.slug}`}
                      className="mt-8 inline-block border border-ink bg-ink px-6 py-3.5 text-[0.9rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
                    >
                      Open {system.name}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Limits */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <span className="field field-teal">Before you ask</span>
              <h2 className="display mt-4 text-[1.8rem] sm:text-[2.2rem]">
                What it does not do.
              </h2>
              <p className="prose-measure mt-4 text-[0.94rem] leading-relaxed text-ink-2">
                You have been sold software before. The limits are worth more than the features, and
                saying them first is cheaper than being caught on them later.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="hairline-grid sm:grid-cols-2">
                {LIMITS.map((l) => (
                  <div key={l.label} className="p-6">
                    <h3 className="text-[0.98rem] font-500 text-ink">{l.label}</h3>
                    <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink-2">{l.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Close */}
      <section className="on-obsidian bg-obsidian py-16 text-on-obsidian-2 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="display text-[2rem] text-on-obsidian sm:text-[2.7rem]">
                Yours would be built from your rate card.
              </h2>
              <p className="prose-measure mt-5 text-[1rem] leading-relaxed">
                Not from this one. The first conversation is about how a job moves through your
                business: who measures it, who prices it, who signs it off, and which part of it is
                held together by one person who knows where everything is. We will tell you what is
                worth building and what is not.
              </p>
              <div className="mt-9">
                <ContactRoutes system="industrial flooring systems" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <span className="field text-on-obsidian-2">Also built by us</span>
              <ul className="mt-4 border-t border-obsidian-rule">
                {SYSTEMS.filter((s) => s.niche !== 'flooring').map((s) => (
                  <li key={s.slug}>
                    <Link
                      to={`/${s.slug}`}
                      className="flex items-baseline justify-between gap-4 border-b border-obsidian-rule py-3.5 transition-colors hover:text-on-obsidian"
                    >
                      <span className="text-[0.95rem]">{s.name}</span>
                      <span className="field shrink-0">{s.code}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/"
                className="mt-6 inline-block text-[0.88rem] text-on-obsidian underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold"
              >
                All five systems →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </Page>
  )
}
