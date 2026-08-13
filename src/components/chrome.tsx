import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { systemBySlug } from '../data/catalogue'
import { CONTACT, HAS_PHONE, HAS_WHATSAPP, PHONE_HREF, REACH, whatsappHref } from '../data/site'

/**
 * The system the visitor is currently reading, or undefined.
 *
 * Read from the URL rather than passed down, so every WhatsApp entry point picks
 * it up without threading a prop through Page. Someone who opens the chat while
 * reading the Field Supervisor should send a message that says so, wherever on
 * the page they pressed.
 */
function useCurrentSystem(): string | undefined {
  const { pathname } = useLocation()
  const slug = pathname.replace(/^\/|\/$/g, '').split('/').pop() ?? ''
  return systemBySlug(slug)?.name
}

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

/**
 * The WhatsApp glyph.
 *
 * DESIGN.md says this site carries no icon set, and that still holds: this is a
 * brand mark rather than an icon, and it is the one place recognition beats
 * restraint. The audience is Indian SME owners who run their working day inside
 * WhatsApp, and the shape is read faster than any word for it. The button stays
 * in the site's own ink and paper rather than WhatsApp green, so the glyph does
 * the recognising and the palette stays intact.
 */
export function WhatsAppMark({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const system = useCurrentSystem()

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
            className="py-1 text-[0.875rem] text-ink-3 transition-colors hover:text-ink"
          >
            Contact
          </Link>
          {HAS_WHATSAPP && (
            <a
              href={whatsappHref(system)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-ink bg-ink px-4 py-2 text-[0.84rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              <WhatsAppMark />
              WhatsApp
            </a>
          )}
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
            <Link to="/contact" className="block border-b border-rule py-3.5 text-[1rem] text-ink-2">
              Contact
            </Link>
            {HAS_WHATSAPP && (
              <a
                href={whatsappHref(system)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 mb-2 flex items-center justify-center gap-2.5 bg-ink px-5 py-3.5 text-center text-[0.95rem] font-500 text-paper"
              >
                <WhatsAppMark size={17} />
                Message on WhatsApp
              </a>
            )}
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
  const system = useCurrentSystem()
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
                href={whatsappHref(system)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-2 text-[0.9rem] text-on-obsidian transition-colors hover:text-gold"
              >
                <WhatsAppMark size={13} />
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
export function ContactRoutes({
  system,
  tone = 'paper',
}: {
  system?: string
  /**
   * The ground this sits on.
   *
   * Not cosmetic. Every colour below is picked for one background, and the
   * default set is near-black ink on paper. Dropped onto the obsidian closing
   * section it rendered `text-ink` (#111110) on `bg-obsidian` (#111110): the
   * phone and email buttons became empty outlines and the WhatsApp button lost
   * its fill, so the only conversion block on six pages was invisible while the
   * markup, the links and every test stayed perfectly green.
   */
  tone?: 'paper' | 'obsidian'
}) {
  const subject = encodeURIComponent(system ? `Halcyon, ${system}` : 'Halcyon')
  const dark = tone === 'obsidian'

  const primary = dark
    ? 'border-gold bg-gold text-obsidian hover:bg-transparent hover:text-gold'
    : 'border-ink bg-ink text-paper hover:bg-transparent hover:text-ink'

  const secondary = dark
    ? 'border-obsidian-rule text-on-obsidian hover:border-gold hover:text-gold'
    : 'border-rule-strong text-ink hover:border-ink'

  const quiet = dark
    ? 'text-on-obsidian-2 decoration-obsidian-rule hover:text-on-obsidian'
    : 'text-ink-3 decoration-rule-strong hover:text-ink'

  const btn =
    'flex items-center gap-2.5 border px-6 py-3.5 text-[0.9rem] font-500 transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.98]'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {HAS_WHATSAPP && (
        <a
          href={whatsappHref(system)}
          target="_blank"
          rel="noreferrer"
          className={`${btn} ${primary}`}
        >
          <WhatsAppMark size={16} />
          Message on WhatsApp
        </a>
      )}
      {HAS_PHONE && (
        <a href={PHONE_HREF} className={`${btn} ${HAS_WHATSAPP ? secondary : primary}`}>
          <span className="num">{CONTACT.phone}</span>
        </a>
      )}
      <a
        href={`mailto:${CONTACT.email}?subject=${subject}`}
        className={`${btn} ${HAS_WHATSAPP || HAS_PHONE ? secondary : primary}`}
      >
        {CONTACT.email}
      </a>
      <Link
        to="/contact"
        className={`text-[0.88rem] underline underline-offset-4 transition-colors duration-200 ease-out ${quiet}`}
      >
        or send the details
      </Link>
    </div>
  )
}
