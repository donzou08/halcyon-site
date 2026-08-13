import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CONTACT, HAS_PHONE, PHONE_HREF, REACH } from '../data/site'

/**
 * React Router keeps scroll position across routes, and a new page should start
 * at the top.
 *
 * The effect body must stay a block. Written `useEffect(() => window.scrollTo(0, 0))`
 * the arrow returns whatever scrollTo yields, React takes that as the cleanup
 * function and calls it on unmount, and the tree dies with "destroy is not a
 * function". Because this sits above every route, that took down every page on
 * the previous site, including ones with no demo on them.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/** The brand mark, unchanged. Only its ink varies with the ground it sits on. */
export function Mark({ size = 26, tone = 'gold' }: { size?: number; tone?: 'gold' | 'ink' }) {
  const stroke = tone === 'gold' ? '#a8801f' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 4.5 26.4 10.5v12L16 28.5 5.6 22.5v-12L16 4.5Z"
        stroke={stroke}
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path
        d="M12.4 11.6v8.8M19.6 11.6v8.8M12.4 16h7.2"
        stroke={stroke}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Wordmark({ tone = 'ink' }: { tone?: 'ink' | 'light' }) {
  return (
    <span
      className={`text-[0.82rem] font-600 tracking-[0.26em] ${
        tone === 'ink' ? 'text-ink' : 'text-on-obsidian'
      }`}
    >
      HALCYON
    </span>
  )
}

const NAV = [
  { to: '/works', label: 'The Works' },
  { to: '/approach', label: 'Approach' },
  { to: '/engagements', label: 'Engagements' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Route change closes the menu; an open panel over a new page is disorienting.
  useEffect(() => setOpen(false), [pathname])

  // While the panel is up the page behind it must not scroll.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <Mark size={24} />
          <Wordmark />
        </Link>

        <nav className="ml-auto hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative py-1 text-[0.875rem] transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'
                } ${isActive ? "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-gold after:content-['']" : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            className="border border-ink bg-ink px-4 py-2 text-[0.84rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
          >
            Start a conversation
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto flex h-10 w-10 items-center justify-center border border-rule-strong md:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="relative block h-3 w-4">
            <span
              className={`absolute left-0 block h-px w-4 bg-ink transition-transform duration-200 ${
                open ? 'top-1.5 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-4 bg-ink transition-transform duration-200 ${
                open ? 'top-1.5 -rotate-45' : 'top-3'
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="settle border-t border-rule bg-paper md:hidden">
          <nav className="mx-auto max-w-[1240px] px-5 py-3 sm:px-8">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block border-b border-rule py-3.5 text-[1rem] ${
                    isActive ? 'text-ink' : 'text-ink-2'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="mt-4 mb-2 block bg-ink px-5 py-3.5 text-center text-[0.95rem] font-500 text-paper"
            >
              Start a conversation
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

/**
 * The footer is a drawing's title block: named cells, hairline ruled, carrying
 * the metadata that identifies the sheet. It is the one place the document
 * conceit is stated outright rather than implied.
 */
export function Footer() {
  return (
    <footer className="on-obsidian mt-28 bg-obsidian text-on-obsidian-2">
      <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8">
        <div className="flex items-center gap-3">
          <Mark size={26} />
          <Wordmark tone="light" />
        </div>

        <div className="hairline-grid mt-10 sm:grid-cols-2 lg:grid-cols-4">
          <TitleCell label="Contact">
            <a
              href={`mailto:${CONTACT.email}`}
              className="block text-[0.9rem] text-on-obsidian transition-colors hover:text-gold"
            >
              {CONTACT.email}
            </a>
            {HAS_PHONE && (
              <a
                href={PHONE_HREF}
                className="num mt-2 block text-[0.9rem] text-on-obsidian transition-colors hover:text-gold"
              >
                {CONTACT.phone}
              </a>
            )}
            <p className="mt-3 text-[0.82rem] leading-relaxed">
              {CONTACT.founder}
              <br />
              {CONTACT.role}
            </p>
          </TitleCell>

          <TitleCell label="Where">
            <p className="text-[0.85rem] leading-relaxed">
              {CONTACT.address.line}
              <br />
              {CONTACT.address.area}
              <br />
              {CONTACT.address.city} {CONTACT.address.postcode}
            </p>
            <p className="mt-3 text-[0.82rem] leading-relaxed">{REACH}</p>
          </TitleCell>

          <TitleCell label="Pages">
            <ul className="space-y-2">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[0.85rem] transition-colors hover:text-on-obsidian"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </TitleCell>

          <TitleCell label="On the demonstrations">
            <p className="text-[0.82rem] leading-relaxed">
              Every company, person, price and figure inside the demonstrations is invented. No
              client data appears anywhere on this site. Where a demonstration rebuilds a system
              running in production, its page says so, and where it does not, its page says that
              too.
            </p>
          </TitleCell>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-[0.75rem] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Halcyon. Operational intelligence, Chennai.</span>
          <span className="num tracking-[0.1em]">TRANQUILITY ENGINEERED</span>
        </div>
      </div>
    </footer>
  )
}

function TitleCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="p-6">
      <div className="field mb-4 text-on-obsidian-2">{label}</div>
      {children}
    </div>
  )
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

/** Standard page width. Every section uses this so the grid never drifts. */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`mx-auto max-w-[1240px] px-5 sm:px-8 ${className}`}>{children}</div>
}
