import { useMemo, useState } from 'react'
import {
  PORTALS,
  SET_ASIDE,
  SET_ASIDE_TOTAL,
  TENDERS,
  TOTAL_READ,
  type Tender,
} from '../data/seed'
import { useDemoState } from '../lib/store'
import { Chip, Closing, FitScore, Header, PoweredByHalcyon, Screen, shortRupees } from '../components/ui'

type Filter = 'all' | 'high' | 'closing' | 'shortlisted' | 'passed'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All matches' },
  { id: 'high', label: 'Strong fit' },
  { id: 'closing', label: 'Closing this week' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'passed', label: 'Passed' },
]

export default function Results({ onOpen }: { onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [showSetAside, setShowSetAside] = useState(false)
  const { decisions } = useDemoState()

  const list = useMemo(() => {
    return TENDERS.filter((t) => {
      const d = decisions[t.id]
      switch (filter) {
        case 'high':
          return t.fit >= 85
        case 'closing':
          return t.daysLeft <= 7
        case 'shortlisted':
          return d?.verdict === 'shortlisted'
        case 'passed':
          return d?.verdict === 'passed'
        default:
          return true
      }
    })
  }, [filter, decisions])

  const shortlisted = TENDERS.filter((t) => decisions[t.id]?.verdict === 'shortlisted').length
  const closingSoon = TENDERS.filter((t) => t.daysLeft <= 7).length

  return (
    <Screen>
      <Header
        title="Today's matches"
        subtitle={`${TOTAL_READ} notices read across nine portals. ${TENDERS.length} worth your time.`}
      />

      <div className="px-4 py-5">
        <div className="card mb-4 grid grid-cols-3 divide-x divide-slate-100 p-4">
          <Summary value={TOTAL_READ} label="read" />
          <Summary value={closingSoon} label="closing this week" tone="signal" />
          <Summary value={shortlisted} label="shortlisted" tone="brand" />
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>

        <div className="space-y-3">
          {list.map((t) => (
            <Row key={t.id} tender={t} verdict={decisions[t.id]?.verdict} onOpen={onOpen} />
          ))}
          {list.length === 0 && (
            <div className="card p-8 text-center text-[0.9rem] text-slate-400">
              Nothing in this view yet.
            </div>
          )}
        </div>

        {/* The honest half of the tool: what it threw away, and why. */}
        <div className="card mt-5 overflow-hidden">
          <button
            onClick={() => setShowSetAside((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-slate-50"
          >
            <div>
              <div className="text-[0.92rem] font-bold text-slate-800">
                {SET_ASIDE_TOTAL} read and set aside
              </div>
              <div className="mt-0.5 text-[0.78rem] text-slate-500">
                Every one has a reason. Nothing is padded to look busy.
              </div>
            </div>
            <span
              className={`shrink-0 text-slate-400 transition-transform ${showSetAside ? 'rotate-180' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          {showSetAside && (
            <div className="rise border-t border-slate-100">
              {SET_ASIDE.map((r) => (
                <div key={r.reason} className="flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0">
                  <span className="num w-8 shrink-0 text-[0.95rem] font-bold text-slate-400">
                    {r.count}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[0.88rem] font-semibold text-slate-700">{r.reason}</div>
                    <div className="mt-0.5 text-[0.78rem] text-slate-400">e.g. {r.example}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <PoweredByHalcyon className="mt-6" />
      </div>
    </Screen>
  )
}

function Summary({
  value,
  label,
  tone = 'slate',
}: {
  value: number
  label: string
  tone?: 'slate' | 'signal' | 'brand'
}) {
  const colors = {
    slate: 'text-slate-800',
    signal: 'text-signal-600',
    brand: 'text-brand-700',
  }
  return (
    <div className="px-2 text-center">
      <div className={`num text-[1.6rem] leading-none font-bold ${colors[tone]}`}>{value}</div>
      <div className="mt-1.5 text-[0.72rem] leading-tight text-slate-400">{label}</div>
    </div>
  )
}

function Row({
  tender,
  verdict,
  onOpen,
}: {
  tender: Tender
  verdict?: 'shortlisted' | 'passed'
  onOpen: (id: string) => void
}) {
  const portal = PORTALS.find((p) => p.id === tender.portal)!
  const top = tender.signals.find((s) => s.weight === 'strong')

  return (
    <button
      onClick={() => onOpen(tender.id)}
      className={`card block w-full p-4 text-left transition hover:-translate-y-px ${
        verdict === 'passed' ? 'opacity-55' : ''
      }`}
    >
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide text-slate-500">
              {portal.short}
            </span>
            <Closing days={tender.daysLeft} />
            {verdict === 'shortlisted' && (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[0.68rem] font-bold tracking-wide text-emerald-700">
                SHORTLISTED
              </span>
            )}
            {verdict === 'passed' && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.68rem] font-bold tracking-wide text-slate-500">
                PASSED
              </span>
            )}
          </div>

          <h3 className="mt-2 text-[0.98rem] leading-snug font-bold text-slate-900">
            {tender.title}
          </h3>
          <div className="mt-1 text-[0.8rem] text-slate-500">{tender.department}</div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="num text-[0.95rem] font-bold text-slate-800">
              {shortRupees(tender.value)}
            </span>
            <span className="text-[0.78rem] text-slate-400">{tender.location}</span>
          </div>

          {top && (
            <div className="mt-2.5 flex items-start gap-1.5 text-[0.78rem] text-emerald-700">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              >
                <path
                  d="m5 13 4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{top.detail}</span>
            </div>
          )}
        </div>

        <FitScore value={tender.fit} />
      </div>
    </button>
  )
}
