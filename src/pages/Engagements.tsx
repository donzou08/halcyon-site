import { Link } from 'react-router-dom'
import { Container, Page } from '../components/chrome'
import { TIER_NOTE, TIERS } from '../data/site'

/**
 * Engagements.
 *
 * Presented as a rate card, because that is the document this audience reads
 * when deciding, and because publishing the numbers at all is the differentiator.
 * Most firms selling to Indian SMEs put "contact us" here, which reads as "the
 * price depends on what we think you can pay".
 */
export default function Engagements() {
  return (
    <Page>
      <div className="border-b border-rule bg-sunk">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5">
          <span className="field field-teal">Engagements</span>
          <span className="field ml-auto hidden sm:block">Indicative, scoped in discovery</span>
        </Container>
      </div>

      <section className="border-b border-rule">
        <Container className="py-14 sm:py-18">
          <h1 className="display max-w-3xl text-[2.4rem] leading-[1.03] sm:text-[3.2rem]">
            What it costs, before you ask.
          </h1>
          <p className="prose-measure mt-6 text-[1.02rem] leading-relaxed text-ink-2">
            These are the shapes an engagement usually takes. The setup figure covers building the
            system; the retainer covers keeping it alive, which is the part most software quietly
            skips. Every project is scoped properly in discovery, so treat these as the range rather
            than a quotation.
          </p>
        </Container>
      </section>

      <section className="border-b border-rule">
        <Container className="py-14">
          <div className="hairline-grid lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div key={tier.name} className="flex flex-col p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="display-sm text-[1.5rem]">{tier.name}</h2>
                </div>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-3">{tier.forWhom}</p>

                <dl className="mt-7 border-t border-rule pt-5">
                  <div className="flex items-baseline justify-between gap-4 pb-3">
                    <dt className="field">Setup</dt>
                    <dd className="num text-[1.05rem] font-500 text-ink">{tier.setup}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="field">Monthly</dt>
                    <dd className="num text-[1.05rem] font-500 text-gold-ink">
                      {tier.monthly}
                      {tier.monthly.startsWith('₹') && (
                        <span className="text-[0.75rem] font-400 text-ink-3"> /mo</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 border-t border-rule pt-5 text-[0.92rem] leading-relaxed text-ink">
                  {tier.scope}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {tier.includes.map((inc) => (
                    <li key={inc} className="grid grid-cols-[0.9rem_1fr] gap-x-3">
                      <span aria-hidden="true" className="mt-2.5 h-px w-3 bg-gold" />
                      <span className="text-[0.9rem] leading-relaxed text-ink-2">{inc}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto border-t border-rule pt-5">
                  <span className="field">Support</span>
                  <p className="mt-2 text-[0.9rem] text-ink-2">{tier.support}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="prose-measure mt-8 text-[0.9rem] leading-relaxed text-ink-3">{TIER_NOTE}</p>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <h2 className="display text-[2rem] sm:text-[2.6rem]">
              Which one you need is usually obvious after twenty minutes.
            </h2>
            <p className="prose-measure mt-5 text-[1rem] leading-relaxed text-ink-2">
              Most businesses start with one system, because one working system is worth more than a
              plan for five. Tell us what the operation looks like and we will say plainly which of
              these fits, including when the answer is none of them yet.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
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
                See what gets built
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </Page>
  )
}
