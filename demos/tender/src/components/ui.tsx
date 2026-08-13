import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Branding
// ---------------------------------------------------------------------------

/** Meridian's mark, identical to the quotation and supervisor demos. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m3 13 9 4.5L21 13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
          <path
            d="m3 17.5 9 4.5 9-4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[1.05rem] font-extrabold tracking-tight">Meridian</span>
        <span className="block text-[0.58rem] font-semibold tracking-[0.2em] opacity-75">
          INDUSTRIAL FLOORING
        </span>
      </span>
    </div>
  )
}

/** Quiet, non-clickable signature. Never pulls the user out to a website. */
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

/** Persistent demo indicator, fixed above everything. */
export function DemoBadge() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.4rem,env(safe-area-inset-top))]">
      <div className="pointer-events-none flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-300 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        DEMO — SAMPLE DATA
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-full w-full max-w-3xl pb-24">
      <DemoBadge />
      {children}
    </div>
  )
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <div className="bg-brand-700 px-4 pt-11 pb-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {onBack ? (
            <button
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[0.8rem] font-semibold transition hover:bg-white/25 active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
          ) : (
            <Logo className="mb-3" />
          )}
          <h1 className="text-[1.35rem] leading-tight font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-[0.85rem] text-white/70">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

export function Button({
  children,
  onClick,
  variant = 'primary',
  full,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'success' | 'ghost' | 'danger'
  full?: boolean
  disabled?: boolean
}) {
  const styles: Record<string, string> = {
    primary: 'bg-brand-700 text-white hover:bg-brand-600',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500',
    danger: 'bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50',
    ghost: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.95rem] font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${styles[variant]} ${full ? 'w-full' : ''}`}
    >
      {children}
    </button>
  )
}

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[0.8rem] font-semibold transition ${
        active
          ? 'bg-brand-700 text-white'
          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Data display
// ---------------------------------------------------------------------------

/** Rupees in the Indian grouping, no decimals. */
export function rupees(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

/** Rupees as an owner says them out loud: 42.8 L, 1.2 Cr. */
export function shortRupees(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')} L`
  return rupees(n)
}

/** Fit as a number plus a bar. Green above 85, blue above 70, grey below. */
export function FitScore({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const tone =
    value >= 85
      ? { text: 'text-emerald-700', bar: 'bg-emerald-600', track: 'bg-emerald-100' }
      : value >= 70
        ? { text: 'text-brand-700', bar: 'bg-brand-600', track: 'bg-brand-100' }
        : { text: 'text-slate-600', bar: 'bg-slate-400', track: 'bg-slate-200' }
  return (
    <div className={size === 'md' ? 'w-16' : 'w-12'}>
      <div className={`num text-right font-bold ${tone.text} ${size === 'md' ? 'text-[1.4rem]' : 'text-[1.05rem]'} leading-none`}>
        {value}
      </div>
      <div className={`mt-1.5 h-1 w-full overflow-hidden rounded-full ${tone.track}`}>
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${value}%` }} />
      </div>
      <div className="mt-1 text-right text-[0.6rem] font-semibold tracking-wider text-slate-400">
        FIT
      </div>
    </div>
  )
}

/** Days left, loud when the deadline is close. */
export function Closing({ days }: { days: number }) {
  const urgent = days <= 6
  return (
    <span
      className={`num inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.75rem] font-semibold ${
        urgent ? 'bg-signal-500/12 text-signal-600' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {days} {days === 1 ? 'day' : 'days'} left
    </span>
  )
}
