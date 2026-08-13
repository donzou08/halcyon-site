import { Link } from 'react-router-dom'
import { Container, Page } from '../components/chrome'
import { Plate } from '../components/Plate'
import { Provenance } from '../components/SystemCard'
import { SYSTEMS, systemBySlug } from '../data/catalogue'
import { CAPABILITIES, CLIENT, HOW, PRODUCTION, REACH } from '../data/site'

/**
 * The home page.
 *
 * Mode: persuade. The visitor is a business owner arriving from an
 * advertisement who has never heard of Halcyon and does not care what a
 * consultancy believes. Within one viewport they have to see software, know it
 * is real, and know they can open it. So the first screen carries a claim, a
 * figure that stands behind it, and an actual application. Every section after
 * that shows the work rather than describing the approach.
 */
export default function Home() {
  const commandCenter = systemBySlug('command-center')
  const quotation = systemBySlug('quotation')
  const supervisor = systemBySlug('supervisor')

  return (
    <Page>
      {/* -------------------------------------------------- Sheet header */}
      <div className="border-b border-rule bg-sunk">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5">
          <span className="field field-teal">Operational intelligence</span>
          <span className="field">Chennai, India</span>
          <span className="field ml-auto hidden sm:block">
            {CLIENT.systems} systems in production · 5 you can open
          </span>
        </Container>
      </div>

      {/* -------------------------------------------------- Hero

          Three blocks in a twelve column grid, which resolves to two rows on a
          wide screen (claim and figures stacked on the left, the screen on the
          right) and to claim, screen, figures on a phone.

          The order matters on the phone: this page is an advertisement's landing
          page, it opens by promising these are not screenshots, and the proof of
          that has to arrive before the figures rather than after a full screen
          of body copy. */}
      <section className="border-b border-rule">
        <Container className="grid gap-10 py-14 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-10 lg:py-20">
          <div className="lg:col-span-5">
            <h1 className="display text-[2.6rem] leading-[1.02] sm:text-[3.4rem] lg:text-[3.7rem]">
              Software your business actually runs on.
            </h1>
            <p className="prose-measure mt-7 text-[1.05rem] leading-relaxed text-ink-2">
              We build operational systems for businesses that have outgrown the spreadsheet and
              have no interest in buying software written for somebody else. Five of them are on
              this site, and they are not screenshots. Open one and use it.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                to="/works"
                className="border border-ink bg-ink px-7 py-4 text-center text-[0.95rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                Open the systems
              </Link>
              <Link
                to="/contact"
                className="border border-rule-strong px-7 py-4 text-center text-[0.95rem] font-500 text-ink transition-colors hover:border-ink"
              >
                Start a conversation
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 lg:row-span-2">
            {commandCenter && (
              <div className="plot">
                <Plate shot={commandCenter.shots[0]} priority showCaption={false} />
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[0.82rem] text-ink-3">{commandCenter.shots[0].caption}</p>
                  <Link
                    to={`/works/${commandCenter.slug}`}
                    className="shrink-0 text-[0.84rem] font-500 text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
                  >
                    Open this one
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* The figures stand in ruled cells rather than in cards. They are
              evidence attached to the claim above, not a statistics display, and
              the rules are what let three values of very different widths sit
              together without looking dropped in. */}
          <div className="lg:col-span-5">
            <dl className="grid grid-cols-3 divide-x divide-rule border-t border-rule-strong">
              {[
                { value: 'Under 1 min', label: 'per quotation, from an hour' },
                { value: '23', label: 'sites tracked live' },
                { value: '5 min', label: 'per scan, from 5 hours' },
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
              Measured on {CLIENT.name}, in production. Method available on request.
            </p>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- The index */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="field field-teal">The Works</span>
              <h2 className="display mt-4 max-w-xl text-[2rem] sm:text-[2.6rem]">
                Five systems. Every one of them opens.
              </h2>
            </div>
            <Link
              to="/works"
              className="shrink-0 text-[0.9rem] font-500 text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
            >
              Search all five by your trade →
            </Link>
          </div>

          <ol className="mt-10 border-t border-rule-strong">
            {SYSTEMS.map((s) => (
              <li key={s.slug}>
                <Link
                  to={`/works/${s.slug}`}
                  className="group grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1 border-b border-rule py-5 transition-colors hover:bg-raised sm:grid-cols-[3.5rem_14rem_1fr_auto] sm:items-center sm:gap-x-6"
                >
                  <span className="field">{s.code}</span>
                  <span className="display-sm text-[1.15rem] transition-colors group-hover:text-gold-ink sm:text-[1.25rem]">
                    {s.name}
                  </span>
                  <span className="col-span-2 text-[0.9rem] leading-relaxed text-ink-2 sm:col-span-1">
                    {s.tagline}
                  </span>
                  <span className="col-span-2 sm:col-span-1 sm:justify-self-end">
                    <Provenance system={s} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* -------------------------------------------------- Proof, on obsidian */}
      <section className="on-obsidian bg-obsidian py-16 text-on-obsidian-2 sm:py-24">
        <Container>
          <span className="field text-gold">In production</span>
          <h2 className="display mt-4 max-w-3xl text-[2rem] text-on-obsidian sm:text-[2.7rem]">
            One client. Three systems. Every figure on this page comes from theirs.
          </h2>
          <p className="prose-measure mt-6 text-[1rem] leading-relaxed">
            {CLIENT.name} runs industrial flooring and coatings. They are the only client, and
            saying so is deliberate: a page of logos would raise a question we cannot answer yet,
            and the work stands up better than the roster does.
          </p>

          <div className="hairline-grid mt-12 lg:grid-cols-3">
            {PRODUCTION.map((p) => (
              <div key={p.name} className="flex flex-col p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[1.15rem] font-600 text-on-obsidian">{p.name}</h3>
                  <span
                    className={`shrink-0 border px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.12em] uppercase ${
                      p.status === 'Live'
                        ? 'border-gold text-gold'
                        : 'border-obsidian-rule text-on-obsidian-2'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="mt-4 text-[0.9rem] leading-relaxed">{p.summary}</p>
                <dl className="mt-7 space-y-2.5 border-t border-obsidian-rule pt-5">
                  {p.figures.map((f) => (
                    <div key={f.label} className="flex items-baseline justify-between gap-4">
                      <dt className="text-[0.82rem]">{f.label}</dt>
                      <dd className="num shrink-0 text-[0.95rem] font-500 text-gold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  to={`/works/${p.slug}`}
                  className="mt-auto pt-6 text-[0.85rem] font-500 text-on-obsidian underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold"
                >
                  Open the demonstration
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[0.8rem] leading-relaxed">
            The demonstrations are public rebuilds. Every name, price and figure inside them is
            invented, because a client's data is theirs.
          </p>
        </Container>
      </section>

      {/* -------------------------------------------------- Two applications, shown */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-24">
          <span className="field field-teal">What one looks like</span>
          <h2 className="display mt-4 max-w-2xl text-[2rem] sm:text-[2.6rem]">
            The same two workflows sit under most of what we are asked for.
          </h2>

          <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-10">
            {quotation && (
              <div>
                <Plate shot={quotation.shots[0]} index={1} />
                <h3 className="display-sm mt-7 text-[1.3rem]">
                  A custom job, priced and turned into a document
                </h3>
                <p className="prose-measure mt-3 text-[0.95rem] leading-relaxed text-ink-2">
                  Underneath, this is not flooring software. It is the shape of any business that
                  measures something up, prices it from a rate card, and has to send a document
                  before the customer loses interest. Interiors, signage, fabrication, printing,
                  events.
                </p>
                <Link
                  to="/works/quotation"
                  className="mt-5 inline-block text-[0.88rem] font-500 text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
                >
                  Open the Quotation Engine →
                </Link>
              </div>
            )}

            {supervisor && (
              <div>
                <Plate shot={supervisor.shots[0]} index={2} />
                <h3 className="display-sm mt-7 text-[1.3rem]">
                  People go to places, and the office finds out
                </h3>
                <p className="prose-measure mt-3 text-[0.95rem] leading-relaxed text-ink-2">
                  Pest control, servicing and AMC, solar, cleaning, security, catering. Anywhere
                  staff go somewhere on your behalf, prove they were there, and the owner currently
                  finds out by ringing four people at six in the evening.
                </p>
                <Link
                  to="/works/supervisor"
                  className="mt-5 inline-block text-[0.88rem] font-500 text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
                >
                  Open the Field Supervisor →
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- How */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span className="field field-teal">How we work</span>
              <h2 className="display mt-4 text-[2rem] sm:text-[2.4rem]">
                Four steps, and you keep the first one either way.
              </h2>
              <p className="prose-measure mt-5 text-[0.95rem] leading-relaxed text-ink-2">
                {REACH}
              </p>
            </div>

            <ol className="lg:col-span-8">
              {HOW.map((step) => (
                <li
                  key={step.n}
                  className="grid grid-cols-[3rem_1fr] gap-x-5 border-t border-rule py-6 first:border-t-0 first:pt-0 sm:grid-cols-[4rem_1fr] sm:gap-x-8"
                >
                  <span className="num text-[1.1rem] text-gold-ink">{step.n}</span>
                  <div>
                    <h3 className="display-sm text-[1.15rem]">{step.title}</h3>
                    <p className="prose-measure mt-2.5 text-[0.95rem] leading-relaxed text-ink-2">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Capabilities */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-20">
          <div className="hairline-grid md:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="p-7">
                <h3 className="display-sm text-[1.15rem]">{c.title}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-2">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Close */}
      <section>
        <Container className="py-20 sm:py-28">
          <div className="max-w-3xl">
            <h2 className="display text-[2.1rem] sm:text-[3rem]">
              The useful conversation is about the job you are doing twice.
            </h2>
            <p className="prose-measure mt-6 text-[1.05rem] leading-relaxed text-ink-2">
              Not about software. Tell us how work actually moves through your business, including
              the parts held together by one person who knows where everything is. We will tell you
              what is worth building and what is not, and you keep that either way.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="border border-ink bg-ink px-7 py-4 text-[0.95rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                Start a conversation
              </Link>
              <Link
                to="/works"
                className="border border-rule-strong px-7 py-4 text-[0.95rem] font-500 text-ink transition-colors hover:border-ink"
              >
                Look at the work first
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </Page>
  )
}
