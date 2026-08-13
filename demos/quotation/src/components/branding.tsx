/**
 * Branding chrome.
 *
 * Two marks live here and they are deliberately different in weight:
 *
 *  - `MeridianLogo` is the *client's* identity. It owns the screen.
 *  - `PoweredByHalcyon` is the builder's signature: small, muted, and plain
 *    text — never a link, so a field user can't tap out of the tool by accident.
 *
 * `DemoBadge` is not branding; it's a safety label. It must be visible on every
 * screen so nobody in a meeting mistakes this for a live production system.
 */

/** Meridian's mark — a layered-floor emblem plus the company wordmark. */
export function MeridianLogo({
  className = '',
  tone = 'dark',
}: {
  className?: string
  tone?: 'dark' | 'light'
}) {
  const text = tone === 'light' ? 'text-white' : 'text-brand-800'
  const sub = tone === 'light' ? 'text-white/70' : 'text-slate-500'
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          tone === 'light' ? 'bg-white/15' : 'bg-brand-600'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"
            stroke={tone === 'light' ? '#fff' : '#fff'}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m3 13 9 4.5L21 13"
            stroke={tone === 'light' ? '#fff' : '#fff'}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
          <path
            d="m3 17.5 9 4.5 9-4.5"
            stroke={tone === 'light' ? '#fff' : '#fff'}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block text-[1.05rem] font-extrabold tracking-tight ${text}`}>Meridian</span>
        <span className={`block text-[0.58rem] font-semibold tracking-[0.2em] ${sub}`}>
          INDUSTRIAL FLOORING
        </span>
      </span>
    </div>
  )
}

/**
 * Quiet "Powered by Halcyon" signature. Plain, non-clickable, muted — the
 * smallest text on the screen. Halcyon is the builder, not the headline.
 */
export function PoweredByHalcyon({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center ${className}`} style={{ fontSize: '12px', color: '#888480' }}>
      Powered by{' '}
      <span style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.06em' }}>
        Halcyon
      </span>
    </div>
  )
}

/**
 * Persistent "Demo — Sample Data" indicator. Fixed to the top of the viewport
 * so it survives scrolling and screenshots on every screen.
 */
export function DemoBadge() {
  return (
    <div className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="pointer-events-none flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-300 shadow-sm backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        DEMO — SAMPLE DATA
      </div>
    </div>
  )
}

/** Spacer that keeps page content clear of the fixed DemoBadge. */
export function DemoBadgeSpacer() {
  return <div className="h-9" aria-hidden="true" />
}
