import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { SiteStatus, Supervisor } from '../data/types'
import {
  advanceClock,
  clockOffsetMin,
  getFieldStaff,
  getOpenIssues,
  getActiveVisit,
  getSite,
  getSites,
  getSupervisor,
  getVisitsToday,
  getWorkDay,
  now,
  resetDemo,
  resolveIssue,
  siteProgress,
  siteStatus,
  simulateCheckIn,
  simulateCheckOut,
  today,
} from '../data/store'
import { useStoreVersion } from '../lib/useStore'
import { CLEAN_CAPTURE } from '../lib/captureMode'
import { logout } from '../lib/session'
import { durationBetween, shortDate, sqm, timeOf } from '../lib/format'
import {
  Badge,
  InfoDot,
  Logo,
  PoweredByHalcyon,
  ProgressBar,
  Screen,
  Toast,
} from '../components/ui'

const STATUS_META: Record<SiteStatus, { label: string; tone: 'green' | 'red' | 'blue' | 'slate'; dot: string }> = {
  in_progress: { label: 'In Progress', tone: 'green', dot: 'bg-emerald-500' },
  issue_reported: { label: 'Issue Reported', tone: 'red', dot: 'bg-rose-500' },
  completed_today: { label: 'Completed Today', tone: 'blue', dot: 'bg-brand-500' },
  not_started: { label: 'Not Started', tone: 'slate', dot: 'bg-slate-300' },
}

export default function OwnerDashboard({ user }: { user: Supervisor }) {
  useStoreVersion()
  const nav = useNavigate()
  const [toast, setToast] = useState('')

  const t = today()
  const clock = now()
  const visitsToday = getVisitsToday()
  const onSite = visitsToday.filter((v) => v.status === 'active')
  const completed = visitsToday.filter((v) => v.status === 'completed')
  const sites = getSites()
  const openIssues = getOpenIssues()
  const staff = getFieldStaff()

  function flash(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 2600)
  }

  const supervisorsOut = new Set(visitsToday.map((v) => v.supervisorId)).size

  return (
    <Screen wide>
      <header className="safe-top rounded-b-3xl bg-brand-700 px-5 pb-7 text-white">
        <div className="flex items-center justify-between">
          <Logo className="text-white" />
          <button onClick={logout} className="text-sm font-medium text-brand-100">
            Log out
          </button>
        </div>
        <p className="mt-5 text-sm text-brand-100">{shortDate(t)}</p>
        <h1 className="text-2xl font-bold">Hi, {user.name.split(' ')[0]}</h1>
        <p className="num mt-1 text-sm text-brand-100">
          {clock.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
          {!CLEAN_CAPTURE && clockOffsetMin() !== 0 && ` · demo clock +${clockOffsetMin()} min`}
        </p>
      </header>

      <div className="-mt-4 space-y-4 px-4">
        {/* ---- Presenter controls ----------------------------------------
            The single most persuasive thing in a meeting: tap this and the
            dashboard visibly changes while the client is looking at it.

            Hidden under `?clean=1`, because in a screenshot the same panel
            makes a working system look staged. See lib/captureMode.ts. */}
        {!CLEAN_CAPTURE && (
          <div className="card border-l-4 border-signal-500 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Demo controls</h3>
              <span className="text-[11px] text-slate-400">Presenter only</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Trigger a live change and watch every tile and site card below update instantly.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <DemoBtn
                label="Simulate check-in"
                onClick={() => {
                  const r = simulateCheckIn()
                  flash(r.message)
                }}
              />
              <DemoBtn
                label="Simulate check-out"
                onClick={() => {
                  const r = simulateCheckOut()
                  flash(r.message)
                }}
              />
              <DemoBtn
                label="Advance 45 min"
                onClick={() => {
                  const r = advanceClock(45)
                  flash(r.message)
                }}
              />
              <DemoBtn
                label="Reset demo"
                onClick={() => {
                  resetDemo()
                  flash('Demo data reset.')
                }}
              />
            </div>
          </div>
        )}

        {/* ---- Summary tiles ---- */}
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Supervisors out"
            value={supervisorsOut}
            info="How many supervisors have logged at least one site visit today."
          />
          <Stat
            label="On site now"
            value={onSite.length}
            tone="green"
            info="Checked in and not yet checked out — on a site at this moment."
          />
          <Stat
            label="Visits completed"
            value={completed.length}
            tone="green"
            info="Visits that were checked in and then properly checked out today."
          />
          <Stat
            label="Open issues"
            value={openIssues.length}
            tone={openIssues.length ? 'red' : 'slate'}
            info="Quality or safety problems raised from site that nobody has resolved yet."
          />
        </div>

        {/* ---- Open issues ---- */}
        {openIssues.length > 0 && (
          <section className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 pb-3 pt-3.5">
              <span className="text-sm font-bold leading-none text-rose-500">⚠</span>
              <h3 className="text-[0.9rem] font-semibold text-rose-700">
                Needs attention
                <InfoDot title="Needs attention">
                  Open quality and safety issues raised by supervisors, newest first. Resolving one
                  here clears it from the site's status straight away.
                </InfoDot>
              </h3>
              <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                {openIssues.length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {openIssues.map((i) => (
                <div key={i.id} className="px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-[0.3rem] h-2 w-2 shrink-0 rounded-full ${
                        i.type === 'safety' ? 'bg-rose-500' : 'bg-amber-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`mb-0.5 text-[0.68rem] font-semibold uppercase tracking-wide ${
                          i.type === 'safety' ? 'text-rose-500' : 'text-amber-600'
                        }`}
                      >
                        {i.type} · {i.severity} severity
                      </p>
                      <p className="text-sm leading-snug text-slate-700">{i.description}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {getSite(i.siteId)?.name} · {getSupervisor(i.supervisorId)?.name} ·{' '}
                        {timeOf(i.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        resolveIssue(i.id)
                        flash('Issue marked resolved.')
                      }}
                      className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- Who is where, right now ---- */}
        <section>
          <h3 className="mb-2 px-1 font-semibold text-slate-700">
            On site right now
            <InfoDot title="On site right now">
              Live view of who is checked in at this moment and how long they have been there.
            </InfoDot>
          </h3>
          {onSite.length === 0 ? (
            <div className="card p-4 text-center text-sm text-slate-400">
              Nobody is checked in at the moment.
            </div>
          ) : (
            <div className="space-y-3">
              {onSite.map((v) => {
                const site = getSite(v.siteId)
                return (
                  <div key={v.id} className="card border-l-4 border-emerald-500 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {getSupervisor(v.supervisorId)?.name}
                        </p>
                        <p className="truncate text-sm text-slate-500">{site?.name}</p>
                      </div>
                      <Badge tone="green">
                        {durationBetween(v.checkinTime, clock.toISOString())} on site
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Since {timeOf(v.checkinTime)} · {v.headcount} workers · GPS verified{' '}
                      <span className="num">{v.checkinDistance} m</span> from site
                    </p>
                    {v.targetWork && (
                      <p className="mt-1.5 text-xs text-slate-600">
                        <span className="font-semibold">Today's target:</span> {v.targetWork}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ---- Team status ---- */}
        <section>
          <h3 className="mb-2 px-1 font-semibold text-slate-700">
            Team status today
            <InfoDot title="Team status today">
              Where every supervisor stands right now — started, on a site, day ended, or not yet in.
            </InfoDot>
          </h3>
          <div className="card divide-y divide-slate-100">
            {staff.map((sup) => {
              const wd = getWorkDay(sup.id)
              const active = getActiveVisit(sup.id)
              let label = 'Not started'
              let dot = 'bg-slate-200'
              let text = 'text-slate-400'
              if (active) {
                label = `On site · ${getSite(active.siteId)?.name ?? ''}`
                dot = 'bg-emerald-500'
                text = 'text-emerald-700'
              } else if (wd) {
                if (wd.type === 'holiday') {
                  ;[label, dot, text] = ['Holiday', 'bg-amber-400', 'text-amber-700']
                } else if (wd.type === 'rest') {
                  ;[label, dot, text] = ['Rest day', 'bg-amber-400', 'text-amber-700']
                } else if (wd.status === 'ended') {
                  ;[label, dot, text] = ['Day ended', 'bg-slate-400', 'text-slate-500']
                } else {
                  ;[label, dot, text] = ['Work started', 'bg-brand-500', 'text-brand-700']
                }
              }
              return (
                <div key={sup.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
                  <span className="flex-1 truncate text-sm font-medium text-slate-700">{sup.name}</span>
                  <span className={`shrink-0 truncate text-xs font-semibold ${text}`}>{label}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ---- All sites ---- */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="font-semibold text-slate-700">
              All sites
              <InfoDot title="All sites">
                Every active site with its live status and completion worked out from the coverage
                supervisors log at check-out.
              </InfoDot>
            </h3>
            <Link to="/team" className="text-sm font-medium text-brand-600">
              Sites &amp; team →
            </Link>
          </div>
          <div className="space-y-3">
            {sites.map((s) => {
              const st = siteStatus(s.id)
              const meta = STATUS_META[st]
              const prog = siteProgress(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => nav(`/site/${s.id}`)}
                  className="card w-full p-4 text-left transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold leading-tight">{s.name}</h4>
                      <p className="truncate text-xs text-slate-400">
                        {s.system} · {sqm(s.areaSqm)}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge tone={meta.tone}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </Badge>
                      <span className="text-slate-300">›</span>
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar percent={prog.overall} />
                    <span className="num w-10 shrink-0 text-right text-sm font-bold text-emerald-700">
                      {prog.overall}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <PoweredByHalcyon className="pb-4 pt-2" />
      </div>

      {toast && <Toast message={toast} />}
    </Screen>
  )
}

function DemoBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-signal-400 hover:bg-signal-50 active:scale-[0.98]"
    >
      {label}
    </button>
  )
}

function Stat({
  label,
  value,
  tone = 'slate',
  info,
}: {
  label: string
  value: number
  tone?: 'slate' | 'green' | 'red'
  info: string
}) {
  const color =
    tone === 'green' ? 'text-emerald-600' : tone === 'red' ? 'text-rose-600' : 'text-slate-800'
  return (
    <div className="card relative p-4 text-left">
      <div className="absolute right-2 top-2">
        <InfoDot title={label}>{info}</InfoDot>
      </div>
      <div className={`num text-3xl font-extrabold ${color}`}>{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
    </div>
  )
}
