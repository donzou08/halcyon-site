import { useNavigate } from 'react-router-dom'
import {
  getActiveVisit,
  getFieldStaff,
  getSite,
  getSites,
  getVisits,
  getWorkDay,
  siteProgress,
  siteStatus,
  today,
} from '../data/store'
import { useStoreVersion } from '../lib/useStore'
import { shortDate, sqm, timeOf } from '../lib/format'
import { BackButton, Badge, PoweredByHalcyon, ProgressBar, Screen } from '../components/ui'

const STATUS_LABEL = {
  in_progress: { label: 'In Progress', tone: 'green' as const },
  issue_reported: { label: 'Issue Reported', tone: 'red' as const },
  completed_today: { label: 'Completed Today', tone: 'blue' as const },
  not_started: { label: 'Not Started', tone: 'slate' as const },
}

/** The management layer: every site and every supervisor in one place. */
export default function TeamList() {
  useStoreVersion()
  const nav = useNavigate()
  const sites = getSites()
  const staff = getFieldStaff()
  const t = today()

  return (
    <Screen wide>
      <header className="safe-top bg-brand-700 px-5 pb-6 text-white">
        <BackButton />
        <h1 className="text-xl font-bold">Sites &amp; team</h1>
        <p className="text-sm text-brand-100">{shortDate(t)}</p>
      </header>

      <div className="space-y-5 px-4 py-5">
        <section>
          <h2 className="mb-2 px-1 font-semibold text-slate-700">Sites ({sites.length})</h2>
          <div className="space-y-3">
            {sites.map((s) => {
              const prog = siteProgress(s.id)
              const status = STATUS_LABEL[siteStatus(s.id)]
              return (
                <button
                  key={s.id}
                  onClick={() => nav(`/site/${s.id}`)}
                  className="card w-full p-4 text-left transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold leading-tight">{s.name}</h3>
                      <p className="truncate text-xs text-slate-500">{s.client}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {s.system} · {sqm(s.areaSqm)}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge tone={status.tone}>{status.label}</Badge>
                      <span className="text-slate-300">›</span>
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar percent={prog.overall} />
                    <span className="num w-10 shrink-0 text-right text-xs font-bold text-emerald-700">
                      {prog.overall}%
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    {shortDate(s.startDate)} → {shortDate(s.targetEndDate)}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-1 font-semibold text-slate-700">Supervisors ({staff.length})</h2>
          <div className="card divide-y divide-slate-100">
            {staff.map((sup) => {
              const active = getActiveVisit(sup.id)
              const wd = getWorkDay(sup.id)
              const visitsToday = getVisits().filter(
                (v) => v.supervisorId === sup.id && v.date === t,
              )
              return (
                <div key={sup.id} className="flex items-start gap-3 px-4 py-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
                    {sup.name
                      .replace(/\./g, '')
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{sup.name}</p>
                    <p className="num truncate text-xs text-slate-500">{sup.phone}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {active
                        ? `On site at ${getSite(active.siteId)?.name} since ${timeOf(active.checkinTime)}`
                        : wd?.status === 'ended' && wd.type === 'work'
                          ? `Day ended ${timeOf(wd.endTime)}`
                          : wd?.type === 'holiday' || wd?.type === 'rest'
                            ? `${wd.type === 'holiday' ? 'Holiday' : 'Rest day'}`
                            : wd
                              ? `Work started ${timeOf(wd.startTime)}`
                              : 'Not started today'}
                    </p>
                  </div>
                  <span className="num shrink-0 text-xs font-semibold text-slate-500">
                    {visitsToday.length} visit{visitsToday.length === 1 ? '' : 's'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <PoweredByHalcyon className="pb-4 pt-2" />
      </div>
    </Screen>
  )
}
