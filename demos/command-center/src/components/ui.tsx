import { useState, type ReactNode } from 'react'
import type { MonthPoint } from '../data/seed'

// ---------------------------------------------------------------------------
// Money formatting
// ---------------------------------------------------------------------------

/** How an owner says it out loud: 18.4 L, 1.24 Cr. */
export function money(n: number): string {
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')} L`
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function exactMoney(n: number): string {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export function HalcyonMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2.5 28 9.25v13.5L16 29.5 4 22.75V9.25L16 2.5Z"
        stroke="#c49a38"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M11.5 11v10M20.5 11v10M11.5 16h9" stroke="#c49a38" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Shell pieces
// ---------------------------------------------------------------------------

export function Card({
  title,
  meta,
  children,
  className = '',
}: {
  title: string
  meta?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card flex flex-col p-5 ${className}`}>
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="display text-[1.25rem] leading-none text-offwhite">{title}</h2>
        {meta && <div className="num shrink-0 text-[0.72rem] text-faint">{meta}</div>}
      </header>
      {children}
    </section>
  )
}

/** Stat tile: label, value, and a plain sub-line. No sparkline, no delta arrow. */
export function Stat({
  label,
  value,
  sub,
  tone = 'plain',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'plain' | 'gold' | 'serious'
}) {
  const color =
    tone === 'gold' ? 'text-gold' : tone === 'serious' ? 'text-serious' : 'text-offwhite'
  return (
    <div className="card px-5 py-4">
      <div className="text-[0.72rem] tracking-wide text-stone">{label}</div>
      <div className={`num mt-2 text-[1.7rem] leading-none font-medium ${color}`}>{value}</div>
      {sub && <div className="mt-2 text-[0.72rem] text-faint">{sub}</div>}
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'default',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'gold' | 'quiet'
}) {
  const styles = {
    default:
      'border border-smoke text-body hover:border-stone hover:text-offwhite',
    gold: 'border border-golddim bg-golddim/25 text-gold hover:bg-golddim/45',
    quiet: 'border border-transparent text-faint hover:text-body',
  }
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-[0.78rem] tracking-wide transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

/** A thin progress rule. Gold when the job is behind on money, stone otherwise. */
export function Rule({ percent, tone = 'stone' }: { percent: number; tone?: 'stone' | 'gold' }) {
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-smoke">
      <div
        className={`h-full rounded-full ${tone === 'gold' ? 'bg-gold' : 'bg-stone'}`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// The chart
// ---------------------------------------------------------------------------

/**
 * Money banked per month, six months.
 *
 * One series, so there is no legend: the card title says what is plotted. Bars
 * are capped in thickness with the band's leftover left as air, the data end is
 * rounded and the baseline end is square, and only two values are labelled, the
 * best month and the current one. Everything else is in the hover.
 */
export function MoneyChart({ data }: { data: MonthPoint[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const max = Math.max(...data.map((d) => d.amount))
  // A clean ceiling so the axis ticks are round numbers.
  const ceiling = Math.ceil(max / 1000000) * 1000000
  const best = data.reduce((a, b) => (b.amount > a.amount ? b : a))
  const current = data[data.length - 1]

  const ticks = [0, ceiling / 2, ceiling]

  return (
    <div className="relative">
      <div className="flex gap-3">
        {/* Y axis */}
        <div className="flex w-10 shrink-0 flex-col justify-between py-[2px] text-right">
          {[...ticks].reverse().map((t) => (
            <div key={t} className="num text-[0.62rem] leading-none text-faint">
              {t === 0 ? '0' : `${t / 100000}L`}
            </div>
          ))}
        </div>

        {/* Plot */}
        <div className="relative min-w-0 flex-1">
          {/* Recessive hairline gridlines, solid, one step off the surface. */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <div key={t} className="h-px w-full bg-hairline" />
            ))}
          </div>

          <div className="relative flex h-40 items-end gap-[2px]">
            {data.map((d, i) => {
              const h = (d.amount / ceiling) * 100
              const isHover = hover === i
              const labelled = d.month === best.month || d.month === current.month
              return (
                <div
                  key={d.month}
                  className="group relative flex h-full flex-1 cursor-default items-end justify-center"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                >
                  {labelled && (
                    <div
                      className="num absolute w-full text-center text-[0.62rem] text-body"
                      style={{ bottom: `calc(${h}% + 6px)` }}
                    >
                      {money(d.amount)}
                    </div>
                  )}
                  <div
                    className="w-full max-w-[24px] rounded-t-[4px] transition-colors"
                    style={{
                      height: `${h}%`,
                      background: d.partial ? '#8a6d27' : '#c49a38',
                      opacity: isHover ? 1 : 0.92,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* X axis */}
      <div className="mt-2 flex gap-3">
        <div className="w-10 shrink-0" />
        <div className="flex min-w-0 flex-1 gap-[2px]">
          {data.map((d, i) => (
            <div
              key={d.month}
              className={`num flex-1 text-center text-[0.65rem] ${hover === i ? 'text-offwhite' : 'text-faint'}`}
            >
              {d.month}
            </div>
          ))}
        </div>
      </div>

      {/* Hover readout. Kept in flow so it never covers the bars. */}
      <div className="mt-3 min-h-[1.1rem] text-[0.72rem] text-stone">
        {hover !== null ? (
          <span>
            <span className="num text-offwhite">{exactMoney(data[hover].amount)}</span>{' '}
            banked in {data[hover].full}
            {data[hover].partial ? ', part month so far' : ''}
          </span>
        ) : (
          <span className="text-faint">
            {current.partial ? `${current.full} is a part month.` : ''} Hover a bar for the figure.
          </span>
        )}
      </div>
    </div>
  )
}
