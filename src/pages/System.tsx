import { Link, useParams } from 'react-router-dom'
import { Container, ContactRoutes, Page } from '../components/chrome'
import { DemoFrame } from '../components/DemoFrame'
import { Plate } from '../components/Plate'
import { nicheBySlug, SYSTEMS, systemBySlug } from '../data/catalogue'
import { SAMPLE_DATA_NOTE } from '../data/site'
import NotFound from './NotFound'

/**
 * One system.
 *
 * The demo is placed above every word of explanation that is not needed to
 * operate it. A visitor who came to see whether this is real settles that
 * question by using the thing, and prose read beforehand is prose read by
 * somebody still deciding whether to bother.
 */
export default function System() {
  const { slug } = useParams()
  const system = slug ? systemBySlug(slug) : undefined

  // `/:slug` is the catch-all for this site, so an unknown one is a 404 rather
  // than a redirect. Bouncing a mistyped link to the index looks like the link
  // worked and hides the typo.
  if (!system) return <NotFound />

  const niche = nicheBySlug(system.niche)
  const others = SYSTEMS.filter((s) => s.slug !== system.slug).slice(0, 4)

  return (
    <Page>
      <div className="border-b border-rule bg-sunk">
        <Container className="py-2.5">
          <Link to="/" className="field transition-colors hover:text-ink">
            ← All systems
          </Link>
        </Container>
      </div>

      {/* Title block. A drawing carries its identity in named cells, and so does
          this: what it is, what trade it was built around, and whose data is in
          it, which is nobody's. */}
      <section className="border-b border-rule">
        <Container className="py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <span className="field">{system.code}</span>

              <h1 className="display mt-4 text-[2.4rem] leading-[1.03] sm:text-[3.1rem]">
                {system.name}
              </h1>
              <p className="prose-measure mt-5 text-[1.05rem] leading-relaxed text-ink-2">
                {system.tagline}
              </p>

              <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-rule-strong pt-6 sm:grid-cols-3">
                <Field label="Built around">{niche?.name ?? '—'}</Field>
                <Field label="Sample company">{system.client}</Field>
                <Field label="Runs on">Sample data only</Field>
              </dl>

              <p className="prose-measure mt-6 border-l border-gold pl-4 text-[0.88rem] leading-relaxed text-ink-2">
                {SAMPLE_DATA_NOTE}
              </p>
            </div>

            {system.proof.length > 0 && (
              <div className="lg:col-span-5">
                <div className="border border-rule bg-raised">
                  <div className="border-b border-rule px-5 py-2.5">
                    <span className="field">What it does in a working week</span>
                  </div>
                  <dl className="divide-y divide-rule">
                    {system.proof.map((p) => (
                      <div
                        key={p.label}
                        className="flex items-baseline justify-between gap-4 px-5 py-4"
                      >
                        <dt className="text-[0.9rem] text-ink-2">{p.label}</dt>
                        <dd className="num shrink-0 text-[1.2rem] font-500 text-gold-ink">
                          {p.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-3">
                  Counted on the client’s production system on 4 August 2026, not on this public
                  version. Any rupee figure is quoted value, not won value. Method available on
                  request.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- The demo */}
      <section className="border-b border-rule bg-sunk/60">
        <Container className="py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <DemoFrame system={system} />
            </div>

            <div className="lg:col-span-4">
              <span className="field field-teal">Try this</span>
              <ol className="mt-5 space-y-4">
                {system.tryThis.map((t, i) => (
                  <li key={t} className="grid grid-cols-[1.6rem_1fr] gap-x-3">
                    <span className="num text-[0.85rem] text-gold-ink">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[0.92rem] leading-relaxed text-ink-2">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Problem and behaviour */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <span className="field field-teal">What it was like before</span>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-ink">{system.problem}</p>

              <div className="mt-9">
                <span className="field">Takes off the desk</span>
                <ul className="mt-4 space-y-2">
                  {system.replaces.map((r) => (
                    <li key={r} className="border-b border-rule pb-2 text-[0.92rem] text-ink-2">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-7">
              <span className="field field-teal">What it does</span>
              <ul className="mt-5 border-t border-rule-strong">
                {system.does.map((d) => (
                  <li
                    key={d}
                    className="grid grid-cols-[0.9rem_1fr] gap-x-4 border-b border-rule py-4"
                  >
                    <span aria-hidden="true" className="mt-2 h-px w-3 bg-gold" />
                    <span className="text-[0.96rem] leading-relaxed text-ink-2">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Plates */}
      {system.shots.length > 1 && (
        <section className="border-b border-rule">
          <Container className="py-16">
            <span className="field field-teal">Screens</span>
            <div
              className={`mt-8 grid gap-8 ${
                system.shots[0].kind === 'phone'
                  ? 'sm:grid-cols-2 lg:grid-cols-3'
                  : 'lg:grid-cols-2'
              }`}
            >
              {system.shots.map((shot, i) => (
                <Plate key={shot.src} shot={shot} index={i + 1} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* -------------------------------------------------- Reach */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span className="field field-teal">The same shape fits</span>
              <h2 className="display mt-4 text-[1.7rem] sm:text-[2rem]">
                This is a workflow, not an industry.
              </h2>
              <p className="prose-measure mt-4 text-[0.94rem] leading-relaxed text-ink-2">
                It was built around one trade. These are the others the same shape reaches, which is
                a different claim from having already been built for them.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-2">
                {system.alsoWorksFor.map((t) => (
                  <span
                    key={t}
                    className="border border-rule bg-raised px-3 py-1.5 text-[0.86rem] text-ink-2"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <span className="field">Workflows</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {system.workflows.map((w) => (
                    <span
                      key={w}
                      className="border border-gold/45 bg-gold-wash px-3 py-1.5 text-[0.86rem] text-gold-ink"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Close */}
      <section className="on-obsidian bg-obsidian py-16 text-on-obsidian-2 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="display text-[1.9rem] text-on-obsidian sm:text-[2.4rem]">
                Yours would not look like this one.
              </h2>
              <p className="prose-measure mt-5 text-[1rem] leading-relaxed">
                It would be built from your rate card, your stages and your paperwork. What carries
                over is the shape of the problem. Tell us how the work moves through your business
                and we will tell you what is worth building.
              </p>
              <div className="mt-8">
                <ContactRoutes system={system.name} />
              </div>
            </div>

            <div className="lg:col-span-5">
              <span className="field text-on-obsidian-2">The rest of the work</span>
              <ul className="mt-4 border-t border-obsidian-rule">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      to={`/${o.slug}`}
                      className="flex items-baseline justify-between gap-4 border-b border-obsidian-rule py-3.5 transition-colors hover:text-on-obsidian"
                    >
                      <span className="text-[0.95rem]">{o.name}</span>
                      <span className="field shrink-0">{o.code}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </Page>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="field">{label}</dt>
      <dd className="mt-2 text-[0.92rem] leading-snug text-ink">{children}</dd>
    </div>
  )
}
