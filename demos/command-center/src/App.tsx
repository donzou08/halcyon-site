import { useState } from 'react'
import {
  ALERTS,
  COMPANY,
  CREW_ON_SITE,
  JOBS,
  PEOPLE,
  type Alert,
  type Job,
} from './data/seed'
import { chase, clearAlert, collect, resetDemo, useCommandCenter } from './lib/store'
import {
  Button,
  Card,
  HalcyonMark,
  MoneyChart,
  Rule,
  Stat,
  exactMoney,
  money,
} from './components/ui'

/**
 * One screen. The order is the order an owner asks the questions in: what needs
 * me, where is the money, what is running, who owes me an answer, who is where.
 *
 * The panels share one store on purpose. Recording a payment from the alert
 * zone moves the cash tile, shortens the receivables list, grows the August bar
 * and clears the alert, in one click. That connection is the product.
 */
export default function App() {
  const s = useCommandCenter()
  const [openJob, setOpenJob] = useState<Job | null>(null)

  const liveAlerts = ALERTS.filter((a) => {
    if (s.raw.clearedAlerts.includes(a.id)) return false
    if (a.action.kind === 'collect') return !s.raw.collected.includes(a.action.receivableId)
    if (a.action.kind === 'chase') return !s.raw.chased.includes(a.action.followUpId)
    return true
  })

  function act(a: Alert) {
    switch (a.action.kind) {
      case 'collect':
        collect(a.action.receivableId)
        break
      case 'chase':
        chase(a.action.followUpId)
        break
      case 'open': {
        const job = JOBS.find((j) => j.id === (a.action as { jobId: string }).jobId)
        if (job) setOpenJob(job)
        break
      }
      case 'ack':
        clearAlert(a.id)
        break
    }
  }

  const overdueCount = s.outstanding.filter((r) => r.daysOutstanding > 30).length

  return (
    <div className="min-h-full">
      {/* Demo indicator, always visible. */}
      <div className="sticky top-0 z-40 border-b border-hairline bg-obsidian/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <HalcyonMark />
            <span className="display text-[1.05rem] tracking-wide text-offwhite">
              Command Center
            </span>
          </div>
          <span className="hidden h-4 w-px bg-smoke sm:block" />
          <div className="min-w-0">
            <div className="truncate text-[0.85rem] text-body">{COMPANY.name}</div>
            <div className="truncate text-[0.68rem] text-faint">
              {COMPANY.trade} · {COMPANY.headcount} people
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="num hidden text-[0.7rem] text-faint md:inline">{COMPANY.today}</span>
            <span className="num rounded-full border border-golddim px-2.5 py-1 text-[0.62rem] tracking-[0.14em] text-gold">
              DEMO — SAMPLE DATA
            </span>
            <Button variant="quiet" onClick={resetDemo}>
              Start over
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-5 py-6">
        {/* Money at a glance */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Cash in hand"
            value={money(s.cash)}
            tone="gold"
            sub={s.bankedToday > 0 ? `${money(s.bankedToday)} banked today` : 'No movement today'}
          />
          <Stat
            label="Owed to us"
            value={money(s.owedToUs)}
            tone={overdueCount > 0 ? 'serious' : 'plain'}
            sub={
              overdueCount > 0
                ? `${overdueCount} invoice${overdueCount > 1 ? 's' : ''} past 30 days`
                : 'Nothing past 30 days'
            }
          />
          <Stat label="Owed by us" value={money(s.owedByUs)} sub="Suppliers and subcontract" />
          <Stat
            label="Invoiced this month"
            value={money(s.invoicedThisMonth)}
            sub="Raised, not yet all banked"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          {/* Needs you today */}
          <Card
            title="Needs you today"
            meta={liveAlerts.length === 0 ? 'clear' : `${liveAlerts.length} open`}
          >
            {liveAlerts.length === 0 ? (
              <div className="rise flex flex-1 flex-col items-center justify-center py-10 text-center">
                <div className="display text-[1.6rem] text-gold">Nothing needs you.</div>
                <p className="mt-2 max-w-xs text-[0.82rem] leading-relaxed text-stone">
                  Everything raised this morning has been dealt with. This is the state the screen
                  is supposed to be in most days.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {liveAlerts.map((a) => (
                  <li key={a.id} className="rise rounded-lg border border-hairline bg-raised p-4">
                    <div className="flex items-start gap-3">
                      <SeverityMark severity={a.severity} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.9rem] leading-snug text-offwhite">{a.title}</div>
                        <div className="mt-1 text-[0.78rem] leading-relaxed text-stone">
                          {a.detail}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      {a.action.kind !== 'ack' && (
                        <Button variant="quiet" onClick={() => clearAlert(a.id)}>
                          Dismiss
                        </Button>
                      )}
                      <Button variant="gold" onClick={() => act(a)}>
                        {a.actionLabel}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Money in */}
          <Card title="Money banked" meta="last six months">
            <MoneyChart data={s.moneyIn} />

            <div className="mt-5 border-t border-hairline pt-4">
              <div className="label mb-3">Owed to us</div>
              {s.outstanding.length === 0 ? (
                <div className="py-3 text-[0.82rem] text-stone">Everything is collected.</div>
              ) : (
                <ul className="space-y-2">
                  {s.outstanding.map((r) => (
                    <li key={r.id} className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-[0.82rem] text-body">{r.client}</span>
                      <span className="flex shrink-0 items-baseline gap-3">
                        <span
                          className={`num text-[0.7rem] ${r.daysOutstanding > 30 ? 'text-serious' : 'text-faint'}`}
                        >
                          {r.daysOutstanding}d
                        </span>
                        <span className="num w-20 text-right text-[0.82rem] text-offwhite">
                          {money(r.amount)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {s.collectedToday.length > 0 && (
                <div className="rise mt-3 border-t border-hairline pt-3 text-[0.75rem] text-stone">
                  Banked today:{' '}
                  {s.collectedToday.map((r) => r.client).join(', ')}
                </div>
              )}
            </div>
          </Card>

          {/* Work in progress */}
          <Card title="Work in progress" meta={`${JOBS.length} live`}>
            <ul className="divide-y divide-hairline">
              {JOBS.map((j) => {
                const spendPct = Math.round((j.spent / j.value) * 100)
                const adrift = spendPct - j.percent
                return (
                  <li key={j.id}>
                    <button
                      onClick={() => setOpenJob(j)}
                      className="w-full py-3 text-left transition-colors hover:bg-raised"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-[0.88rem] text-offwhite">
                          {j.client}
                        </span>
                        <span className="num shrink-0 text-[0.82rem] text-body">
                          {money(j.value)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-[0.75rem] text-stone">{j.name}</span>
                        <span className="num shrink-0 text-[0.7rem] text-faint">
                          {j.stage} · due {j.due}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-3">
                        <Rule percent={j.percent} tone={adrift >= 5 ? 'gold' : 'stone'} />
                        <span className="num shrink-0 text-[0.68rem] text-faint">{j.percent}%</span>
                      </div>
                      {adrift >= 5 && (
                        <div className="num mt-1.5 text-[0.68rem] text-gold">
                          {spendPct}% of budget spent, {adrift} points adrift
                        </div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Waiting on a reply + people */}
          <div className="flex flex-col gap-5">
            <Card title="Waiting on a reply" meta={`${s.followUps.length} quotes out`}>
              <ul className="divide-y divide-hairline">
                {s.followUps.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.86rem] text-offwhite">{f.client}</div>
                      <div className="truncate text-[0.74rem] text-stone">{f.work}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="num text-[0.82rem] text-body">{money(f.value)}</div>
                      <div
                        className={`num text-[0.68rem] ${f.sentDaysAgo >= 7 && !f.chased ? 'text-gold' : 'text-faint'}`}
                      >
                        {f.chased ? 'chased today' : `${f.sentDaysAgo}d, no reply`}
                      </div>
                    </div>
                    {!f.chased && (
                      <Button onClick={() => chase(f.id)}>Chase</Button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Where everyone is" meta={COMPANY.today.split(',')[0]}>
              <ul className="divide-y divide-hairline">
                {PEOPLE.map((p) => (
                  <li key={p.name} className="flex items-baseline justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-[0.85rem] text-offwhite">{p.name}</span>
                      <span className="block truncate text-[0.72rem] text-faint">{p.role}</span>
                    </span>
                    <span className="shrink-0 text-[0.78rem] text-body">{p.where}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-hairline pt-3 text-[0.76rem] text-stone">
                <span className="num text-offwhite">{CREW_ON_SITE}</span> crew signed in across four
                sites this morning.
              </div>
            </Card>
          </div>
        </div>

        <footer className="mt-8 border-t border-hairline pt-5 text-center">
          <p className="mx-auto max-w-xl text-[0.74rem] leading-relaxed text-faint">
            Ashwood Contracts is invented. No company, person, invoice, job or figure on this screen
            is real. Built as a demonstration of what a single operating screen looks like for a
            business of twenty or so people.
          </p>
        </footer>
      </main>

      {openJob && <JobDrawer job={openJob} onClose={() => setOpenJob(null)} />}
    </div>
  )
}

function SeverityMark({ severity }: { severity: 'serious' | 'warning' | 'watch' }) {
  const map = {
    serious: { color: '#c2544a', letter: '!', label: 'Serious' },
    warning: { color: '#c08a2e', letter: '!', label: 'Warning' },
    watch: { color: '#888480', letter: '·', label: 'Watch' },
  }
  const m = map[severity]
  return (
    <span
      title={m.label}
      className="num mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem]"
      style={{ border: `1px solid ${m.color}`, color: m.color }}
    >
      {m.letter}
    </span>
  )
}

function JobDrawer({ job, onClose }: { job: Job; onClose: () => void }) {
  const spendPct = Math.round((job.spent / job.value) * 100)
  const adrift = spendPct - job.percent
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-obsidian/70 backdrop-blur-[2px]"
      />
      <aside className="rise relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-hairline bg-charcoal p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label mb-2">Job</div>
            <h2 className="display text-[1.6rem] leading-tight text-offwhite">{job.client}</h2>
            <p className="mt-1 text-[0.85rem] text-stone">{job.name}</p>
          </div>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline">
          <Fact label="Contract value" value={exactMoney(job.value)} />
          <Fact label="Committed spend" value={exactMoney(job.spent)} />
          <Fact label="Stage" value={job.stage} />
          <Fact label="Progress" value={`${job.percent}%`} />
          <Fact label="Due" value={job.due} />
          <Fact label="Days to go" value={String(job.daysToDue)} />
          <Fact label="Site lead" value={job.lead} />
          <Fact label="Crew on site" value={String(job.crew)} />
        </dl>

        <div className="mt-6">
          <div className="label mb-3">Money against progress</div>
          <div className="space-y-3">
            <Bar label="Work done" percent={job.percent} tone="stone" />
            <Bar label="Budget spent" percent={spendPct} tone={adrift >= 5 ? 'gold' : 'stone'} />
          </div>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-stone">
            {adrift >= 5
              ? `Spending is ${adrift} points ahead of progress. On a job this size that is ${money(Math.round((adrift / 100) * job.value))} of margin, and it does not come back on its own.`
              : 'Spending is tracking progress. Nothing to do here.'}
          </p>
        </div>

        <div className="mt-6 border-t border-hairline pt-5">
          <div className="label mb-2">Next</div>
          <p className="text-[0.88rem] leading-relaxed text-body">{job.nextMilestone}</p>
        </div>
      </aside>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-charcoal px-4 py-3">
      <dt className="text-[0.68rem] text-faint">{label}</dt>
      <dd className="num mt-1 text-[0.85rem] text-offwhite">{value}</dd>
    </div>
  )
}

function Bar({ label, percent, tone }: { label: string; percent: number; tone: 'stone' | 'gold' }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[0.76rem] text-stone">{label}</span>
        <span className="num text-[0.76rem] text-offwhite">{percent}%</span>
      </div>
      <Rule percent={percent} tone={tone} />
    </div>
  )
}
