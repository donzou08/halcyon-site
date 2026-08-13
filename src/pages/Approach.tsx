import { Link } from 'react-router-dom'
import { Container, Page } from '../components/chrome'
import { CAPABILITIES, CLIENT, HOW, REACH } from '../data/site'

/**
 * How the work happens.
 *
 * Mode: read. A visitor arrives here after seeing the systems, wanting to know
 * whether working with a small firm is a risk. So the page answers the questions
 * that are actually being asked and not the ones a consultancy prefers: how long,
 * what happens if you disappear, who owns it, and why there is only one client.
 */
export default function Approach() {
  return (
    <Page>
      <div className="border-b border-rule bg-sunk">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5">
          <span className="field field-teal">Approach</span>
          <span className="field ml-auto hidden sm:block">{REACH}</span>
        </Container>
      </div>

      <section className="border-b border-rule">
        <Container className="py-14 sm:py-20">
          <h1 className="display max-w-3xl text-[2.4rem] leading-[1.03] sm:text-[3.2rem]">
            We map the operation first, and you keep the map either way.
          </h1>
          <p className="prose-measure mt-6 text-[1.05rem] leading-relaxed text-ink-2">
            Most software for small businesses fails in the same way. It is bought before anyone has
            written down how the work actually moves, so it encodes a process nobody follows and
            gets quietly abandoned. We start at the other end.
          </p>
        </Container>
      </section>

      <section className="border-b border-rule">
        <Container className="py-16 sm:py-20">
          <ol className="grid gap-px bg-rule md:grid-cols-2">
            {HOW.map((step) => (
              <li key={step.n} className="bg-paper p-7 sm:p-9">
                <span className="num text-[1.2rem] text-gold-ink">{step.n}</span>
                <h2 className="display-sm mt-4 text-[1.35rem]">{step.title}</h2>
                <p className="mt-3 text-[0.96rem] leading-relaxed text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-b border-rule">
        <Container className="py-16">
          <div className="hairline-grid md:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="p-7">
                <h2 className="display-sm text-[1.15rem]">{c.title}</h2>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-2">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* The questions a careful buyer actually asks. */}
      <section className="border-b border-rule">
        <Container className="py-16 sm:py-20">
          <span className="field field-teal">Straight answers</span>
          <div className="mt-8 max-w-3xl">
            {[
              {
                q: 'How many clients do you have?',
                a: `One. ${CLIENT.name}, with three systems running. We would rather say that than imply a roster, because you will find out either way and the work stands up better than the count does.`,
              },
              {
                q: 'What does it cost to find out whether this is worth doing?',
                a: 'Nothing. The discovery session and the map it produces are included, and they are yours whether or not you go ahead. If the answer is that your problem does not need software, that is what we will tell you.',
              },
              {
                q: 'What happens if you get hit by a bus?',
                a: 'The code, the data and the hosting accounts are in your name from the first day. Any competent developer can pick it up, and none of it is locked to a platform you cannot leave.',
              },
              {
                q: 'How long before something is running?',
                a: 'A first working version of one system is usually weeks rather than months, because it is built around one workflow rather than a whole business. You see it early and tell us where it is wrong while changing it is still cheap.',
              },
              {
                q: 'Do you work outside Chennai?',
                a: 'Yes. In-person delivery across Chennai and Tamil Nadu is the part no larger firm will match, and everything else works over a call. Businesses anywhere in India are welcome.',
              },
              {
                q: 'Is this an AI product?',
                a: 'No. Some of these systems use it where it earns its place, such as reading tender documents, and most of the value is ordinary software that fits your process exactly. What is being sold is the operation running better, not the technology it uses.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group border-b border-rule py-5 first:border-t first:border-rule"
              >
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 text-[1.05rem] font-500 text-ink marker:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="mt-2 shrink-0 text-[0.9rem] text-gold-ink transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="prose-measure mt-3 text-[0.96rem] leading-relaxed text-ink-2">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-24">
          <h2 className="display max-w-2xl text-[2rem] sm:text-[2.6rem]">
            The fastest way to judge this is to open one.
          </h2>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/works"
              className="border border-ink bg-ink px-7 py-4 text-[0.95rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              Open the systems
            </Link>
            <Link
              to="/contact"
              className="border border-rule-strong px-7 py-4 text-[0.95rem] font-500 text-ink transition-colors hover:border-ink"
            >
              Start a conversation
            </Link>
          </div>
        </Container>
      </section>
    </Page>
  )
}
