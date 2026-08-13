import { Link } from 'react-router-dom'
import { Container, Page } from '../components/chrome'
import { SYSTEMS } from '../data/catalogue'

export default function NotFound() {
  return (
    <Page>
      <Container className="py-24 sm:py-32">
        <span className="field field-teal">404</span>
        <h1 className="display mt-5 max-w-2xl text-[2.4rem] sm:text-[3rem]">
          There is no page here.
        </h1>
        <p className="prose-measure mt-5 text-[1.02rem] leading-relaxed text-ink-2">
          The link may be old, or it may be a typo. Everything on this site is one of the five
          systems below, or one of four pages.
        </p>

        <ul className="mt-10 max-w-2xl border-t border-rule-strong">
          {SYSTEMS.map((s) => (
            <li key={s.slug}>
              <Link
                to={`/works/${s.slug}`}
                className="flex items-baseline justify-between gap-4 border-b border-rule py-4 transition-colors hover:text-gold-ink"
              >
                <span className="text-[1rem] text-ink">{s.name}</span>
                <span className="field shrink-0">{s.code}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/"
            className="border border-ink bg-ink px-7 py-4 text-[0.95rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
          >
            Back to the start
          </Link>
          <Link
            to="/works"
            className="border border-rule-strong px-7 py-4 text-[0.95rem] font-500 text-ink transition-colors hover:border-ink"
          >
            The Works
          </Link>
        </div>
      </Container>
    </Page>
  )
}
