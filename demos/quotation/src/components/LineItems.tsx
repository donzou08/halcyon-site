import type { QuoteLine } from '../types'
import { formatINR, formatQty } from '../lib/format'

/**
 * The quote's line items.
 *
 * Two layouts, because a four-column money table cannot fit a phone without
 * either shrinking the figures past readability or scrolling sideways — and on
 * the screen where someone checks an amount before sending it, the amount must
 * never be the column that falls off the edge.
 *
 * So: stacked rows on mobile, the familiar table from `sm:` up.
 */
export function LineItems({ lines, decimals }: { lines: QuoteLine[]; decimals: number }) {
  const dp = decimals

  return (
    <>
      {/* Mobile — stacked, amount always visible */}
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 sm:hidden">
        {lines.map((l) => (
          <li key={l.sno} className="p-3">
            <div className="text-sm font-medium text-slate-800">{l.description}</div>
            {l.detail && <div className="mt-0.5 text-[11px] text-slate-400">{l.detail}</div>}
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <span className="num text-xs text-slate-500">
                {formatQty(l.qty, dp)} {l.uom} × {formatINR(l.rate, dp)}
              </span>
              <span className="num shrink-0 text-sm font-bold text-slate-900">
                {formatINR(l.amount, dp)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop — the familiar quotation table */}
      <div className="hidden overflow-hidden rounded-2xl ring-1 ring-slate-200 sm:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-2 py-2 text-right">Qty</th>
              <th className="px-2 py-2 text-right">Rate</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {lines.map((l) => (
              <tr key={l.sno}>
                <td className="px-3 py-2 text-slate-800">
                  {l.description}
                  {l.detail && <span className="block text-[11px] text-slate-400">{l.detail}</span>}
                </td>
                <td className="num whitespace-nowrap px-2 py-2 text-right text-slate-600">
                  {formatQty(l.qty, dp)} {l.uom}
                </td>
                <td className="num whitespace-nowrap px-2 py-2 text-right text-slate-600">
                  {formatINR(l.rate, dp)}
                </td>
                <td className="num whitespace-nowrap px-3 py-2 text-right font-medium text-slate-800">
                  {formatINR(l.amount, dp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/** A label/value row in the totals block. */
export function TotalRow({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={bold ? 'font-semibold text-slate-900' : 'text-slate-600'}>{label}</span>
      <span
        className={`num shrink-0 ${
          bold ? 'text-base font-bold text-slate-900 sm:text-lg' : 'font-medium text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
