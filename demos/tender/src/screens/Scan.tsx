import { useEffect, useRef, useState } from 'react'
import { LAST_SCAN, PORTALS, SCAN_DATE, TENDERS, TOTAL_READ, type PortalId } from '../data/seed'
import { markScanned } from '../lib/store'
import { Button, Header, PoweredByHalcyon, Screen } from '../components/ui'

/**
 * The scan screen.
 *
 * This is the screen that explains the product without a word of pitching: nine
 * portals go past, four of them stop to solve a CAPTCHA, a counter climbs to
 * 129, and nine come out the other side. What used to be a person with nine
 * browser tabs and most of a morning.
 *
 * The real scan takes about five minutes. This one is compressed to roughly
 * twelve seconds, because nobody watches a demo for five minutes.
 */

type Stage = 'queued' | 'connecting' | 'captcha' | 'reading' | 'done'

interface Row {
  id: PortalId
  stage: Stage
  read: number
}

const STEP_MS = 460

export default function Scan({ onDone }: { onDone: () => void }) {
  const [running, setRunning] = useState(false)
  const [rows, setRows] = useState<Row[]>(
    PORTALS.map((p) => ({ id: p.id, stage: 'queued', read: 0 })),
  )
  const [finished, setFinished] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function start() {
    setRunning(true)
    setFinished(false)
    setRows(PORTALS.map((p) => ({ id: p.id, stage: 'queued', read: 0 })))

    let t = 0
    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms))
    }

    PORTALS.forEach((portal, i) => {
      // Portals are worked two at a time, which is what makes nine of them
      // finish in the time one person opens three.
      const lane = Math.floor(i / 2)
      const base = lane * STEP_MS * (portal.captcha ? 3.1 : 2.3)

      const set = (stage: Stage, read = 0) =>
        setRows((prev) => prev.map((r) => (r.id === portal.id ? { ...r, stage, read } : r)))

      at(base, () => set('connecting'))
      if (portal.captcha) {
        at(base + STEP_MS, () => set('captcha'))
        at(base + STEP_MS * 2.1, () => set('reading'))
        at(base + STEP_MS * 3.1, () => set('done', portal.read))
      } else {
        at(base + STEP_MS, () => set('reading'))
        at(base + STEP_MS * 2.3, () => set('done', portal.read))
      }
      t = Math.max(t, base + STEP_MS * (portal.captcha ? 3.1 : 2.3))
    })

    at(t + 600, () => {
      setFinished(true)
      setRunning(false)
      markScanned()
    })
  }

  const readSoFar = rows.reduce((s, r) => s + r.read, 0)
  const doneCount = rows.filter((r) => r.stage === 'done').length

  return (
    <Screen>
      <Header
        title="Tender Intelligence"
        subtitle={`Nine procurement portals, scanned in one pass. ${SCAN_DATE}.`}
      />

      <div className="px-4 py-5">
        {!running && !finished && (
          <div className="card rise mb-4 p-5">
            <div className="text-[0.7rem] font-semibold tracking-[0.18em] text-slate-400">
              LAST SCAN
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <Stat value={LAST_SCAN.when} label="ran" wide />
              <Stat value={LAST_SCAN.read} label="notices read" />
              <Stat value={LAST_SCAN.matched} label="worth reading" />
              <Stat value={LAST_SCAN.shortlisted} label="shortlisted" />
            </div>
            <p className="mt-4 text-[0.88rem] leading-relaxed text-slate-500">
              Every portal below is opened, logged into, read and closed without anyone sitting in
              front of it. Four of the nine put a CAPTCHA in the way first.
            </p>
            <div className="mt-4">
              <Button onClick={start} full>
                Run today&apos;s scan
              </Button>
            </div>
          </div>
        )}

        {(running || finished) && (
          <div className="card mb-4 p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="num text-[2.6rem] leading-none font-bold text-brand-700">
                  {readSoFar}
                </div>
                <div className="mt-1 text-[0.8rem] text-slate-500">
                  notices read {finished ? '' : 'so far'}
                </div>
              </div>
              <div className="text-right">
                <div className="num text-[1.4rem] leading-none font-bold text-slate-700">
                  {doneCount}/9
                </div>
                <div className="mt-1 text-[0.75rem] text-slate-400">portals</div>
              </div>
            </div>

            {finished && (
              <div className="rise mt-5 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <div className="text-[0.95rem] font-bold text-emerald-800">
                  {TENDERS.length} worth reading, out of {TOTAL_READ}.
                </div>
                <p className="mt-1 text-[0.85rem] leading-relaxed text-emerald-700">
                  The other {TOTAL_READ - TENDERS.length} were read and set aside, each with a
                  reason you can check.
                </p>
                <div className="mt-3">
                  <Button variant="success" onClick={onDone} full>
                    See the {TENDERS.length} matches
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card overflow-hidden">
          {PORTALS.map((portal, i) => {
            const row = rows.find((r) => r.id === portal.id)!
            return (
              <div
                key={portal.id}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <StageDot stage={row.stage} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[0.9rem] font-semibold text-slate-800">
                    {portal.name}
                  </div>
                  <div className="mt-0.5 text-[0.75rem] text-slate-400">
                    {stageLabel(row.stage, portal.captcha)}
                  </div>
                </div>
                <div className="num w-14 text-right text-[0.9rem] font-semibold text-slate-700">
                  {row.stage === 'done' ? row.read : ''}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 px-1 text-[0.78rem] leading-relaxed text-slate-400">
          Sample data. Portal names describe the categories of public procurement source the real
          system covers; no notice, reference number or department shown here is real.
        </p>

        <PoweredByHalcyon className="mt-6" />
      </div>
    </Screen>
  )
}

function Stat({ value, label, wide }: { value: string | number; label: string; wide?: boolean }) {
  return (
    <div>
      <div
        className={`${wide ? '' : 'num'} text-[1.05rem] leading-none font-bold text-slate-800`}
      >
        {value}
      </div>
      <div className="mt-1 text-[0.72rem] text-slate-400">{label}</div>
    </div>
  )
}

function stageLabel(stage: Stage, captcha: boolean): string {
  switch (stage) {
    case 'queued':
      return captcha ? 'Waiting, CAPTCHA expected' : 'Waiting'
    case 'connecting':
      return 'Opening'
    case 'captcha':
      return 'Solving CAPTCHA'
    case 'reading':
      return 'Reading the notice list'
    case 'done':
      return 'Read and closed'
  }
}

function StageDot({ stage }: { stage: Stage }) {
  if (stage === 'done') {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m5 13 4 4L19 7"
            stroke="#047857"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }
  if (stage === 'queued') {
    return <span className="h-6 w-6 shrink-0 rounded-full bg-slate-100" />
  }
  const tone = stage === 'captcha' ? 'border-signal-500' : 'border-brand-500'
  return (
    <span
      className={`h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-slate-200 ${tone} border-t-transparent`}
      style={{ animationDuration: '900ms' }}
    />
  )
}
