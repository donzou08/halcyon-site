import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Supervisor } from '../data/types'
import {
  canEndWorkDay,
  endWorkDay,
  getActiveVisit,
  getOpenIssuesForSite,
  getOpenWorkDay,
  getSite,
  getSites,
  getVisits,
  getWorkDay,
  now,
  reopenWorkDay,
  setDayType,
  siteProgress,
  startWorkDay,
  today,
} from '../data/store'
import { useStoreVersion } from '../lib/useStore'
import { logout } from '../lib/session'
import { durationBetween, shortDate, sqm, timeOf } from '../lib/format'
import {
  Badge,
  Button,
  ConfirmModal,
  Logo,
  PoweredByHalcyon,
  ProgressBar,
  Screen,
  Toast,
} from '../components/ui'

export default function SupervisorHome({ user }: { user: Supervisor }) {
  useStoreVersion()
  const nav = useNavigate()
  const [confirmStart, setConfirmStart] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [blocked, setBlocked] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const t = today()
  const clock = now()
  const openWd = getOpenWorkDay(user.id)
  const todayWd = getWorkDay(user.id, t)
  const active = getActiveVisit(user.id)
  const sites = getSites()
  const myVisitsToday = getVisits().filter((v) => v.supervisorId === user.id && v.date === t)

  const onRestDay = !openWd && !!todayWd && (todayWd.type === 'holiday' || todayWd.type === 'rest')
  const dayEnded = !openWd && !!todayWd && todayWd.status === 'ended' && todayWd.type === 'work'

  function flash(m: string) {
    setToast(m)
    setTimeout(() => setToast(''), 2600)
  }

  function tryEndDay() {
    const check = canEndWorkDay(user.id)
    if (!check.ok) {
      setBlocked(check.reason ?? 'Cannot end the day yet.')
      return
    }
    setConfirmEnd(true)
  }

  return (
    <Screen>
      <header className="safe-top rounded-b-3xl bg-brand-700 px-5 pb-7 text-white">
        <div className="flex items-center justify-between">
          <Logo className="text-white" />
          <button onClick={logout} className="text-sm font-medium text-brand-100">
            Log out
          </button>
        </div>
        <p className="mt-5 text-sm text-brand-100">{shortDate(t)}</p>
        <h1 className="text-2xl font-bold">Hi, {user.name.split(' ').slice(-1)[0]}</h1>
      </header>

      <div className="-mt-4 space-y-4 px-4">
        {/* ---- Work day ---- */}
        <div className="card p-4">
          {openWd ? (
            <>
              <div className="flex items-center justify-between">
                <Badge tone="green">Work day in progress</Badge>
                <span className="text-xs text-slate-400">
                  Started {timeOf(openWd.startTime)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {durationBetween(openWd.startTime!, clock.toISOString())} since you started.
              </p>
              <div className="mt-3">
                <Button full variant="danger" onClick={tryEndDay}>
                  End work day
                </Button>
                {active && (
                  <p className="mt-2 text-xs text-amber-700">
                    You're still checked in. Check out of your site before ending the day.
                  </p>
                )}
              </div>
            </>
          ) : onRestDay ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold capitalize text-slate-700">{todayWd!.type} day</p>
                <p className="text-xs text-slate-400">No work logged today.</p>
              </div>
              <Button variant="ghost" onClick={() => setConfirmStart(true)}>
                Start work
              </Button>
            </div>
          ) : dayEnded ? (
            <div>
              <p className="font-semibold text-slate-700">Work day complete</p>
              <p className="num mt-0.5 text-xs text-slate-400">
                {timeOf(todayWd!.startTime)} – {timeOf(todayWd!.endTime)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Check-in is closed once the day is ended. Reopen it if you need to work again.
              </p>
              <div className="mt-3">
                <Button
                  full
                  variant="ghost"
                  onClick={() => {
                    reopenWorkDay(user.id)
                    flash('Work day reopened.')
                  }}
                >
                  Reopen work day
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-3 font-semibold text-slate-700">Start your work day</p>
              <Button full variant="success" onClick={() => setConfirmStart(true)}>
                Start work day
              </Button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  full
                  onClick={() => {
                    setDayType(user.id, 'holiday')
                    flash('Marked as a holiday.')
                  }}
                >
                  Holiday
                </Button>
                <Button
                  variant="ghost"
                  full
                  onClick={() => {
                    setDayType(user.id, 'rest')
                    flash('Marked as a rest day.')
                  }}
                >
                  Rest day
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ---- Current visit ---- */}
        {active ? (
          <div className="card border-l-4 border-emerald-500 p-4">
            <div className="flex items-center justify-between">
              <Badge tone="green">● On site now</Badge>
              <span className="text-xs text-slate-400">
                {durationBetween(active.checkinTime, clock.toISOString())} on site
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold leading-tight">
              {getSite(active.siteId)?.name}
            </h2>
            <p className="text-sm text-slate-500">
              Since {timeOf(active.checkinTime)} · {active.headcount} workers
            </p>
            {active.targetWork && (
              <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                <span className="font-semibold">Today's target:</span> {active.targetWork}
              </p>
            )}
            <div className="mt-3 grid gap-2">
              <Button full variant="danger" onClick={() => nav(`/checkout/${active.id}`)}>
                Check out of this site
              </Button>
              <Button full variant="ghost" onClick={() => nav(`/issue/${active.siteId}`)}>
                Report an issue
              </Button>
            </div>
          </div>
        ) : (
          <div className="card p-5 text-center">
            <p className="text-sm text-slate-500">You are not checked in anywhere.</p>
            <p className="mt-1 text-xs text-slate-400">
              {openWd ? 'Pick a site below to start a visit.' : 'Start your work day first.'}
            </p>
          </div>
        )}

        {myVisitsToday.length > 0 && (
          <p className="px-1 text-sm text-slate-500">
            Today: {myVisitsToday.filter((v) => v.status === 'completed').length} visit(s) completed
            {active ? ', 1 in progress' : ''}.
          </p>
        )}

        {/* ---- Sites ---- */}
        <div>
          <h3 className="mb-2 px-1 font-semibold text-slate-700">Sites</h3>
          <div className="space-y-3">
            {sites.map((s) => {
              const prog = siteProgress(s.id)
              const isHere = active?.siteId === s.id
              const openIssues = getOpenIssuesForSite(s.id).length
              return (
                <div key={s.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold leading-tight">{s.name}</h4>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {s.system} · {sqm(s.areaSqm)}
                      </p>
                    </div>
                    {isHere && <Badge tone="green">Here</Badge>}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar percent={prog.overall} />
                    <span className="num w-10 shrink-0 text-right text-xs font-semibold text-slate-500">
                      {prog.overall}%
                    </span>
                  </div>

                  {openIssues > 0 && (
                    <p className="mt-2 text-xs text-rose-600">
                      ⚠ {openIssues} open issue{openIssues > 1 ? 's' : ''} at this site
                    </p>
                  )}

                  <button
                    onClick={() => nav(`/site/${s.id}`)}
                    className="mt-2 block text-xs font-medium text-brand-600"
                  >
                    View site details →
                  </button>

                  <div className="mt-3">
                    {active ? (
                      isHere ? (
                        <Button full variant="danger" onClick={() => nav(`/checkout/${active.id}`)}>
                          Check out
                        </Button>
                      ) : (
                        <Button full variant="ghost" disabled>
                          Already on another site
                        </Button>
                      )
                    ) : !openWd ? (
                      <Button full variant="ghost" disabled>
                        {onRestDay
                          ? `${todayWd!.type === 'holiday' ? 'Holiday' : 'Rest'} day — start work to check in`
                          : dayEnded
                            ? 'Work day ended — reopen to check in'
                            : 'Start your work day to check in'}
                      </Button>
                    ) : (
                      <Button full variant="success" onClick={() => nav(`/checkin/${s.id}`)}>
                        Check in here
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <PoweredByHalcyon className="pb-4 pt-2" />
      </div>

      <ConfirmModal
        open={confirmStart}
        title="Start your work day?"
        message="This records your start time. You'll be able to check in to sites afterwards."
        confirmLabel="Yes, start"
        confirmVariant="success"
        onCancel={() => setConfirmStart(false)}
        onConfirm={() => {
          startWorkDay(user.id)
          setConfirmStart(false)
          flash('Work day started.')
        }}
      />

      <ConfirmModal
        open={confirmEnd}
        title="End your work day?"
        message="This closes out your day. You can reopen it if you need to work again."
        confirmLabel="Yes, end day"
        confirmVariant="danger"
        onCancel={() => setConfirmEnd(false)}
        onConfirm={() => {
          endWorkDay(user.id)
          setConfirmEnd(false)
          flash('Work day ended.')
        }}
      />

      {/* The gate that matters: you cannot end the day with an open visit. */}
      <ConfirmModal
        open={blocked !== null}
        title="Check out first"
        message={blocked ?? ''}
        confirmLabel="Go to check-out"
        confirmVariant="danger"
        onCancel={() => setBlocked(null)}
        onConfirm={() => {
          setBlocked(null)
          if (active) nav(`/checkout/${active.id}`)
        }}
      />

      {toast && <Toast message={toast} />}
    </Screen>
  )
}
