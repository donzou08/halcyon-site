import { Link } from 'react-router-dom'
import { Container, ContactRoutes, Page } from '../components/chrome'
import { SYSTEMS, systemBySlug, type System } from '../data/catalogue'
import {
  BUILT_FROM_YOURS,
  EXAMPLE_RATE_CARD,
  LEAKS,
  LIMITS,
  QUOTATION_DEPTH,
  STAGES,
  SUPERVISOR_DEPTH,
  type Feature,
} from '../data/flooring'
import { asset } from '../lib/paths'

/**
 * The industrial flooring landing page.
 *
 * Mode: persuade, at one trade. The reader knows flooring better than the page
 * does, so it never explains their business back to them. It shows that the
 * software already speaks the trade, then gets out of the way.
 *
 * **Ordered for comprehension, not for drama.** An earlier version opened with
 * the problem and only named the three systems most of the way down, which meant
 * the reader spent the first two screens without knowing what was being offered.
 * Now: what it is, what the three are, why they matter, then each in depth. Every
 * section carries a number for the same reason a drawing does, so a reader who
 * scrolled past something knows there was something to scroll past.
 */
export default function Flooring() {
  const three = ['tender', 'quotation', 'supervisor']
    .map((s) => systemBySlug(s))
    .filter((s): s is System => Boolean(s))

  const quotation = systemBySlug('quotation')
  const supervisor = systemBySlug('supervisor')
  const tender = systemBySlug('tender')

  return (
    <Page>
      <div className="border-b border-rule bg-sunk">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5">
          <span className="field field-teal">Industrial flooring and coatings</span>
          <span className="field">Three systems</span>
          <span className="field ml-auto hidden sm:block">Sample data throughout</span>
        </Container>
      </div>

      {/* ============================================ Hero */}
      <section className="border-b border-rule">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-10">
          <div className="lg:col-span-5">
            <h1 className="display text-[2.4rem] leading-[1.02] sm:text-[3.1rem]">
              Software that knows what a screed coat is.
            </h1>
            <p className="prose-measure mt-6 text-[1.05rem] leading-relaxed text-ink-2">
              Three systems, built for one industrial flooring contractor and running in their
              business every day. Not a construction package with a flooring template dropped into
              it.
            </p>
            <p className="prose-measure mt-4 text-[0.95rem] leading-relaxed text-ink-3">
              Public versions of all three are on this page, filled with invented data. Open one and
              press anything.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#systems"
                className="border border-ink bg-ink px-7 py-4 text-center text-[0.95rem] font-500 text-paper transition-[background-color,color,transform] duration-200 ease-out hover:bg-transparent hover:text-ink active:scale-[0.98]"
              >
                See the three systems
              </a>
              <a
                href="#yours"
                className="border border-rule-strong px-7 py-4 text-center text-[0.95rem] font-500 text-ink transition-[border-color,transform] duration-200 ease-out hover:border-ink active:scale-[0.98]"
              >
                How yours would be built
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
                  18,000 sq.ft of 3mm epoxy self-levelling, priced from the contractor’s own rate
                  card and split into CGST and SGST because the site is in state.
                </p>
              </>
            )}
          </div>

          <div className="lg:col-span-5">
            <dl className="grid grid-cols-3 divide-x divide-rule border-t border-rule-strong">
              {[
                { value: '5 min', label: 'per tender scan, from 5 hours' },
                { value: '₹47.54 cr', label: 'quoted through it' },
                { value: '289', label: 'site visits logged' },
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
              Counted on the contractor’s own production systems on 4 August 2026. Quoted value,
              not won value. Method available on request.
            </p>
          </div>
        </Container>
      </section>

      {/* ============================================ 01 · At a glance
          The orientation strip. Three lines that let a reader know the whole
          shape of the offer before deciding whether to read any further. */}
      <section className="border-b border-rule bg-sunk/60">
        <Container className="py-14 sm:py-16">
          <SectionHead
            n="01"
            kicker="What the three are"
            title="Find the job. Price the job. Run the job."
          />
          <ol className="hairline-grid mt-10 lg:grid-cols-3">
            {three.map((s, i) => (
              <li key={s.slug} className="flex flex-col p-6 sm:p-7">
                <span className="num text-[0.8rem] text-gold-ink">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="display-sm mt-3 text-[1.3rem]">{s.name}</h3>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-ink-2">{s.tagline}</p>
                <div className="mt-5">
                  <span className="field">Replaces</span>
                  <ul className="mt-2 space-y-1">
                    {s.replaces.map((r) => (
                      <li key={r} className="text-[0.85rem] leading-snug text-ink-3">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={`/${s.slug}`}
                  className="mt-auto pt-6 text-[0.86rem] font-500 text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors duration-200 ease-out hover:text-gold-ink"
                >
                  Open it →
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ============================================ 02 · Where it leaks */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-20">
          <SectionHead
            n="02"
            kicker="Why they exist"
            title="Three places a flooring contract loses money."
          />

          <ol className="mt-10 border-t border-rule-strong">
            {LEAKS.map((leak) => {
              const system = systemBySlug(leak.slug)
              return (
                <li key={leak.slug} className="border-b border-rule">
                  <div className="grid gap-5 py-7 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-3">
                      <h3 className="display-sm text-[1.15rem]">{leak.stage}</h3>
                      {system && (
                        <Link
                          to={`/${system.slug}`}
                          className="field mt-2 block transition-colors duration-200 ease-out hover:text-gold-ink"
                        >
                          {system.name}
                        </Link>
                      )}
                    </div>
                    <div className="lg:col-span-5">
                      <p className="text-[1rem] leading-relaxed text-ink">{leak.title}</p>
                      <p className="mt-2.5 text-[0.93rem] leading-relaxed text-ink-2">{leak.body}</p>
                    </div>
                    <div className="lg:col-span-4">
                      <span className="field">What it costs</span>
                      <p className="mt-2.5 text-[0.91rem] leading-relaxed text-ink-2">{leak.cost}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </Container>
      </section>

      {/* ============================================ 03 · The systems, in depth */}
      <section id="systems" className="scroll-mt-20 border-b border-rule">
        <Container className="py-16 sm:py-20">
          <SectionHead
            n="03"
            kicker="In depth"
            title="What each one actually does."
            lead="The public versions below are simplified. What follows is the system running in production."
          />

          <div className="mt-14 space-y-20 sm:space-y-28">
            {quotation && (
              <Deep
                system={quotation}
                shotSrc="quotation-home"
                shotAlt="The quotation app's home screen, showing quotes on record and the open pipeline."
                features={QUOTATION_DEPTH}
              />
            )}
            {supervisor && (
              <Deep
                system={supervisor}
                shotSrc="supervisor-dashboard"
                shotAlt="The owner dashboard: who is on site now, every job with its stage and progress."
                features={SUPERVISOR_DEPTH}
                flipped
              />
            )}
            {tender && (
              <Deep
                system={tender}
                shotSrc="tender-scan"
                shotAlt="The morning scan running across nine procurement sources."
                features={tender.does.slice(0, 5).map((d) => ({ label: d, body: '' }))}
                note="This one is being built now. What is described here is the working system; the public version is a rebuild of it."
              />
            )}
          </div>
        </Container>
      </section>

      {/* ============================================ 04 · Built from yours */}
      <section id="yours" className="scroll-mt-20 border-b border-rule bg-sunk/60">
        <Container className="py-16 sm:py-20">
          <SectionHead
            n="04"
            kicker="How yours would be built"
            title="Nothing here ships with a rate card."
            lead="These were built for one contractor, from that contractor's systems, brands, rates and paperwork. Yours would start from yours. That is the whole product."
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <ul className="border-t border-rule-strong">
                {BUILT_FROM_YOURS.map((d) => (
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

            <div className="lg:col-span-5">
              <div className="border border-rule bg-raised">
                <div className="border-b border-rule px-5 py-2.5">
                  <span className="field">One contractor’s rate card, as an example</span>
                </div>
                <ul className="divide-y divide-rule">
                  {EXAMPLE_RATE_CARD.map((s) => (
                    <li key={s.label} className="px-5 py-3">
                      <span className="block text-[0.9rem] text-ink">{s.label}</span>
                      <span className="mt-0.5 block text-[0.78rem] text-ink-3">{s.body}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-3">
                Yours would carry your build-ups, your material brands and your densities. These are
                someone else’s, and they are editable in the app without calling us.
              </p>

              <div className="mt-9">
                <span className="field">And one contractor’s stages</span>
                <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
                  {STAGES.map((stage, i) => (
                    <li key={stage} className="flex items-center gap-2">
                      <span className="border border-rule-strong bg-raised px-3 py-1.5 text-[0.83rem] text-ink-2">
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
                <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-3">
                  Set per site, each with its own target date. Progress is measured against whatever
                  you set.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================ 05 · Limits */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <SectionHead n="05" kicker="Before you ask" title="What it does not do." />
          <div className="hairline-grid mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {LIMITS.map((l) => (
              <div key={l.label} className="p-6">
                <h3 className="text-[0.98rem] font-500 text-ink">{l.label}</h3>
                <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink-2">{l.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================ Close */}
      <section className="on-obsidian bg-obsidian py-16 text-on-obsidian-2 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="display text-[2rem] text-on-obsidian sm:text-[2.7rem]">
                Send us the quotation you send today.
              </h2>
              <p className="prose-measure mt-5 text-[1rem] leading-relaxed">
                That, and a description of how a job moves through your business: who measures it,
                who prices it, who signs it off, and which part is held together by one person who
                knows where everything is. We will tell you what is worth building and what is not.
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
                      className="flex items-baseline justify-between gap-4 border-b border-obsidian-rule py-3.5 transition-colors duration-200 ease-out hover:text-on-obsidian"
                    >
                      <span className="text-[0.95rem]">{s.name}</span>
                      <span className="field shrink-0">{s.code}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/"
                className="mt-6 inline-block text-[0.88rem] text-on-obsidian underline decoration-gold decoration-2 underline-offset-4 transition-colors duration-200 ease-out hover:text-gold"
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

/**
 * A numbered section heading.
 *
 * The number is the comprehension device. On a long page a reader needs to know
 * both where they are and that there is an order to it, and a drawing numbers its
 * sections for exactly that reason.
 */
function SectionHead({
  n,
  kicker,
  title,
  lead,
}: {
  n: string
  kicker: string
  title: string
  lead?: string
}) {
  return (
    <div className="border-t border-rule-strong pt-5">
      <div className="flex items-baseline gap-4">
        <span className="num text-[0.85rem] text-gold-ink">{n}</span>
        <span className="field field-teal">{kicker}</span>
      </div>
      <h2 className="display mt-4 max-w-3xl text-[1.9rem] sm:text-[2.5rem]">{title}</h2>
      {lead && (
        <p className="prose-measure mt-4 text-[1rem] leading-relaxed text-ink-2">{lead}</p>
      )}
    </div>
  )
}

/** One system, at length, with its screenshot held beside the detail. */
function Deep({
  system,
  shotSrc,
  shotAlt,
  features,
  flipped = false,
  note,
}: {
  system: System
  shotSrc: string
  shotAlt: string
  features: Feature[]
  flipped?: boolean
  note?: string
}) {
  return (
    <article className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* The plate sticks while the detail scrolls past it, so the screen stays
          in view for the whole list rather than leaving the reader to remember
          what they were looking at. */}
      <div className={`lg:col-span-5 ${flipped ? 'lg:order-2' : ''}`}>
        <div className="lg:sticky lg:top-24">
          <div className="border border-rule-strong bg-raised">
            <div className="flex items-center justify-between border-b border-rule px-3 py-2">
              <span className="field">{system.code}</span>
              <span className="field">Sample data</span>
            </div>
            <div style={{ aspectRatio: '390 / 500' }} className="overflow-hidden bg-sunk">
              <img
                src={asset(`shots/${shotSrc}.png`)}
                alt={shotAlt}
                width={390}
                height={844}
                loading="lazy"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
          <Link
            to={`/${system.slug}`}
            className="mt-4 inline-block border border-ink bg-ink px-6 py-3.5 text-[0.9rem] font-500 text-paper transition-[background-color,color,transform] duration-200 ease-out hover:bg-transparent hover:text-ink active:scale-[0.98]"
          >
            Open {system.name}
          </Link>
        </div>
      </div>

      <div className={`lg:col-span-7 ${flipped ? 'lg:order-1' : ''}`}>
        <h3 className="display text-[1.7rem] sm:text-[2.1rem]">{system.name}</h3>
        <p className="prose-measure mt-3 text-[1rem] leading-relaxed text-ink-2">
          {system.tagline}
        </p>

        {system.proof.length > 0 && (
          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 border-t border-rule pt-5">
            {system.proof.map((p) => (
              <div key={p.label}>
                <dt className="text-[0.72rem] leading-snug text-ink-3">{p.label}</dt>
                <dd className="num mt-0.5 text-[1rem] font-500 text-gold-ink">{p.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <ul className="mt-7 border-t border-rule-strong">
          {features.map((f) => (
            <li key={f.label} className="border-b border-rule py-4">
              <div className="grid grid-cols-[0.9rem_1fr] gap-x-4">
                <span aria-hidden="true" className="mt-2.5 h-px w-3 bg-gold" />
                <div>
                  <h4 className="text-[0.97rem] leading-snug font-500 text-ink">{f.label}</h4>
                  {f.body && (
                    <p className="mt-1.5 text-[0.91rem] leading-relaxed text-ink-2">{f.body}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {note && <p className="mt-5 text-[0.85rem] leading-relaxed text-ink-3">{note}</p>}
      </div>
    </article>
  )
}

