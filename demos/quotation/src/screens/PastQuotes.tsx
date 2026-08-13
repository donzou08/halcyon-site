import { useMemo, useState } from 'react'
import { ArrowLeft, Eye } from 'lucide-react'
import type { QuoteSnapshot, SavedQuote } from '../types'
import { formatINRWhole } from '../lib/format'
import { displayDate } from '../lib/quote'
import { listQuotes } from '../lib/store'
import type { DemoUser } from '../lib/session'
import { DemoBadge, DemoBadgeSpacer, PoweredByHalcyon } from '../components/branding'
import { Badge } from '../components/ui'

const STATUS_TONE: Record<SavedQuote['status'], 'green' | 'blue' | 'amber' | 'slate'> = {
  Won: 'green',
  Sent: 'blue',
  Pending: 'amber',
  Lost: 'slate',
}

export default function PastQuotes({
  user,
  onBack,
  onView,
}: {
  user: DemoUser
  onBack: () => void
  onView: (s: QuoteSnapshot) => void
}) {
  const [filter, setFilter] = useState<'all' | SavedQuote['status']>('all')

  // Owner sees the whole team's history; a sales rep sees only their own.
  const all = useMemo(() => {
    const rows = listQuotes()
    return user.role === 'owner' ? rows : rows.filter((q) => q.createdByName === user.name)
  }, [user])

  const rows = filter === 'all' ? all : all.filter((q) => q.status === filter)
  const wonValue = all.filter((q) => q.status === 'Won').reduce((s, q) => s + q.grandTotal, 0)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-10">
      <DemoBadge />
      <DemoBadgeSpacer />

      <header className="flex items-center gap-3 py-4">
        <button onClick={onBack} className="btn-ghost px-3 py-2" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Past quotes</h1>
          <p className="text-xs text-slate-500">
            {user.role === 'owner' ? 'All quotes from the team' : 'Quotes you have created'}
          </p>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="num text-xl font-bold text-brand-800">{all.length}</div>
          <div className="mt-0.5 text-xs text-slate-500">Quotes on record</div>
        </div>
        <div className="card p-4">
          <div className="num text-xl font-bold text-emerald-700">{formatINRWhole(wonValue)}</div>
          <div className="mt-0.5 text-xs text-slate-500">Value won</div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(['all', 'Sent', 'Won', 'Pending', 'Lost'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">No quotes match this filter.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((q) => (
            <button
              key={q.id}
              onClick={() => onView(q.data)}
              className="card w-full text-left transition active:scale-[0.99] hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{q.customerName}</div>
                  <div className="truncate text-xs text-slate-500">{q.siteLabel}</div>
                </div>
                <Badge tone={STATUS_TONE[q.status]}>{q.status}</Badge>
              </div>

              <div className="mt-2 truncate text-sm text-slate-600">{q.systemSummary}</div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0 text-[11px] text-slate-400">
                  <div className="num truncate">{q.quoteNumber}</div>
                  <div className="truncate">
                    {displayDate(q.createdAt)} · {q.createdByName} ·{' '}
                    {q.gstMode === 'intra' ? 'CGST+SGST' : 'IGST'}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="num text-lg font-bold text-slate-900">
                    {formatINRWhole(q.grandTotal)}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] font-medium text-brand-600">
                    <Eye size={12} /> View
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <PoweredByHalcyon className="mt-8" />
    </div>
  )
}
