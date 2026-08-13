import { useState } from 'react'
import { PORTALS, TENDERS } from '../data/seed'
import { PASS_REASONS, decide, undecide, useDemoState } from '../lib/store'
import {
  Button,
  Closing,
  FitScore,
  Header,
  PoweredByHalcyon,
  Screen,
  rupees,
  shortRupees,
} from '../components/ui'

/**
 * One tender, in the order an owner reads it: what is it, what is it worth,
 * when does it close, why did the machine put it in front of me, and what will
 * go wrong. Then two buttons.
 */
export default function Detail({ id, onBack }: { id: string; onBack: () => void }) {
  const tender = TENDERS.find((t) => t.id === id)!
  const portal = PORTALS.find((p) => p.id === tender.portal)!
  const { decisions } = useDemoState()
  const decision = decisions[id]
  const [picking, setPicking] = useState(false)

  return (
    <Screen>
      <Header
        title={tender.title}
        subtitle={tender.department}
        onBack={onBack}
        right={
          <div className="shrink-0 rounded-xl bg-white/12 p-2.5">
            <FitScore value={tender.fit} />
          </div>
        }
      />

      <div className="px-4 py-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[0.7rem] font-semibold tracking-wide text-slate-500">
            {portal.name}
          </span>
          <Closing days={tender.daysLeft} />
          <span className="num text-[0.72rem] text-slate-400">{tender.ref}</span>
        </div>

        <div className="card mb-4 p-4">
          <p className="text-[0.92rem] leading-relaxed text-slate-700">{tender.summary}</p>
        </div>

        <div className="card mb-4 grid grid-cols-2 gap-px overflow-hidden bg-slate-100 sm:grid-cols-3">
          <Fact label="Estimated value" value={shortRupees(tender.value)} strong />
          <Fact label="EMD" value={rupees(tender.emd)} />
          <Fact label="Closes" value={tender.closing} />
          <Fact label="Location" value={tender.location} />
          <Fact label="Completion" value={`${tender.completionWeeks} weeks`} />
          <Fact label="Source" value={portal.short} />
        </div>

        <SectionTitle>Why this came through</SectionTitle>
        <div className="card mb-4 overflow-hidden">
          {tender.signals.map((s, i) => (
            <div
              key={s.label}
              className={`flex gap-3 px-4 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <WeightMark weight={s.weight} />
              <div className="min-w-0">
                <div className="text-[0.88rem] font-semibold text-slate-800">{s.label}</div>
                <div className="mt-0.5 text-[0.82rem] leading-relaxed text-slate-500">
                  {s.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        <SectionTitle>What to watch</SectionTitle>
        <div className="card mb-5 overflow-hidden">
          {tender.flags.map((f, i) => (
            <div
              key={f}
              className={`flex gap-3 px-4 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-500" />
              <div className="text-[0.85rem] leading-relaxed text-slate-600">{f}</div>
            </div>
          ))}
        </div>

        {/* Decision */}
        {decision ? (
          <div className="card p-4">
            <div className="text-[0.9rem] font-bold text-slate-800">
              {decision.verdict === 'shortlisted' ? 'Shortlisted' : 'Passed'}
            </div>
            {decision.reason && (
              <div className="mt-1 text-[0.83rem] text-slate-500">{decision.reason}</div>
            )}
            <div className="mt-3">
              <Button variant="ghost" onClick={() => undecide(id)} full>
                Change my mind
              </Button>
            </div>
          </div>
        ) : picking ? (
          <div className="card rise p-4">
            <div className="mb-3 text-[0.9rem] font-bold text-slate-800">Why are we passing?</div>
            <div className="space-y-2">
              {PASS_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    decide(id, 'passed', r)
                    setPicking(false)
                  }}
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-left text-[0.88rem] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Button variant="ghost" onClick={() => setPicking(false)} full>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="success" onClick={() => decide(id, 'shortlisted')} full>
              Shortlist
            </Button>
            <Button variant="danger" onClick={() => setPicking(true)} full>
              Not for us
            </Button>
          </div>
        )}

        <PoweredByHalcyon className="mt-6" />
      </div>
    </Screen>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 px-1 text-[0.7rem] font-semibold tracking-[0.18em] text-slate-400">
      {String(children).toUpperCase()}
    </div>
  )
}

function Fact({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="bg-white px-4 py-3">
      <div className="text-[0.7rem] text-slate-400">{label}</div>
      <div
        className={`num mt-1 text-[0.9rem] font-semibold ${strong ? 'text-brand-700' : 'text-slate-800'}`}
      >
        {value}
      </div>
    </div>
  )
}

function WeightMark({ weight }: { weight: 'strong' | 'fair' | 'watch' }) {
  if (weight === 'watch') {
    return (
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-signal-500/15">
        <span className="num text-[0.7rem] font-bold text-signal-600">!</span>
      </span>
    )
  }
  const tone = weight === 'strong' ? 'bg-emerald-100' : 'bg-brand-100'
  const stroke = weight === 'strong' ? '#047857' : '#1459a6'
  return (
    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${tone}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m5 13 4 4L19 7"
          stroke={stroke}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
