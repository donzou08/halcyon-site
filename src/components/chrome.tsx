import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CONTACT, HAS_PHONE, HAS_WHATSAPP, PHONE_HREF, REACH, whatsappHref } from '../data/site'

/**
 * React Router keeps scroll position across routes, and a new page should start
 * at the top.
 *
 * The effect body must stay a block. Written `useEffect(() => window.scrollTo(0, 0))`
 * the arrow returns whatever scrollTo yields, React takes that as the cleanup
 * function and calls it on unmount, and the tree dies with "destroy is not a
 * function". Because this sits above every route, that took down every page on
 * an earlier version of this site, including ones with no demo on them.
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

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

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
          <span className="leading-none">
            <span className="block text-[0.8rem] font-600 tracking-[0.26em] text-ink">HALCYON</span>
            <span className="field mt-1 block">The Works</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `relative py-1 text-[0.875rem] transition-colors ${
                isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'
              } ${isActive ? "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-gold after:content-['']" : ''}`
            }
          >
            The work
          </NavLink>
          <a
            href={CONTACT.site}
            target="_blank"
            rel="noreferrer"
            className="py-1 text-[0.875rem] text-ink-3 transition-colors hover:text-ink"
          >
            halcyon.uno
          </a>
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
            <NavLink
              to="/"
              end
              className="block border-b border-rule py-3.5 text-[1rem] text-ink-2"
            >
              The work
            </NavLink>
            <a
              href={CONTACT.site}
              target="_blank"
              rel="noreferrer"
              className="block border-b border-rule py-3.5 text-[1rem] text-ink-2"
            >
              halcyon.uno
            </a>
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
    <footer className="on-obsidian mt-24 bg-obsidian text-on-obsidian-2">
      <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8">
        <div className="flex items-center gap-3">
          <Mark size={26} />
          <span className="text-[0.82rem] font-600 tracking-[0.26em] text-on-obsidian">
            HALCYON
          </span>
        </div>

        <div className="hairline-grid mt-10 sm:grid-cols-2 lg:grid-cols-4">
          <TitleCell label="Reach us">
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
            {HAS_WHATSAPP && (
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-[0.9rem] text-on-obsidian transition-colors hover:text-gold"
              >
                WhatsApp
              </a>
            )}
            <p className="mt-3 text-[0.82rem] leading-relaxed">
              {CONTACT.founder}
              <br />
              {CONTACT.role}
            </p>
          </TitleCell>

          <TitleCell label="Where">
            <p className="text-[0.85rem] leading-relaxed">{REACH}</p>
            <a
              href={CONTACT.site}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-[0.85rem] text-on-obsidian transition-colors hover:text-gold"
            >
              halcyon.uno →
            </a>
          </TitleCell>

          <TitleCell label="This page">
            <p className="text-[0.82rem] leading-relaxed">
              The systems Halcyon has built, each one running rather than pictured. Everything here
              can be opened and used.
            </p>
          </TitleCell>

          <TitleCell label="On the sample data">
            <p className="text-[0.82rem] leading-relaxed">
              Every business, person, price and figure inside these is invented. No client data
              appears anywhere on this site.
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

/**
 * The contact block, reused at the bottom of every system page and on /contact.
 *
 * `system` names what the visitor was looking at, which rides along into the
 * WhatsApp message and the email subject. A first message that already says what
 * it is about gets answered; "Hi" from an unknown number does not.
 */
export function ContactRoutes({ system }: { system?: string }) {
  const subject = encodeURIComponent(system ? `Halcyon, ${system}` : 'Halcyon')
  return (
    <div className="flex flex-wrap items-center gap-3">
      {HAS_WHATSAPP && (
        <a
          href={whatsappHref(system)}
          target="_blank"
          rel="noreferrer"
          className="border border-ink bg-ink px-6 py-3.5 text-[0.9rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
        >
          Message on WhatsApp
        </a>
      )}
      {HAS_PHONE && (
        <a
          href={PHONE_HREF}
          className={`border px-6 py-3.5 text-[0.9rem] font-500 transition-colors ${
            HAS_WHATSAPP
              ? 'border-rule-strong text-ink hover:border-ink'
              : 'border-ink bg-ink text-paper hover:bg-transparent hover:text-ink'
          }`}
        >
          <span className="num">{CONTACT.phone}</span>
        </a>
      )}
      <a
        href={`mailto:${CONTACT.email}?subject=${subject}`}
        className={`border px-6 py-3.5 text-[0.9rem] font-500 transition-colors ${
          HAS_WHATSAPP || HAS_PHONE
            ? 'border-rule-strong text-ink hover:border-ink'
            : 'border-ink bg-ink text-paper hover:bg-transparent hover:text-ink'
        }`}
      >
        {CONTACT.email}
      </a>
      <Link
        to="/contact"
        className="text-[0.88rem] text-ink-3 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-ink"
      >
        or send the details
      </Link>
    </div>
  )
}
