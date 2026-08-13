import { useParams } from 'react-router-dom'
import {
  getOpenIssuesForSite,
  getSite,
  getSupervisor,
  getVisits,
  siteProgress,
  siteStatus,
} from '../data/store'
import { useStoreVersion } from '../lib/useStore'
import { durationBetween, shortDate, sqm, timeOf } from '../lib/format'
import { metersLabel } from '../lib/geo'
import {
  BackButton,
  Badge,
  PoweredByHalcyon,
  ProgressBar,
  Screen,
  StageBreakdown,
} from '../components/ui'

const STATUS_LABEL = {
  in_progress: { label: 'In Progress', tone: 'green' as const },
  issue_reported: { label: 'Issue Reported', tone: 'red' as const },
  completed_today: { label: 'Completed Today', tone: 'blue' as const },
  not_started: { label: 'Not Started', tone: 'slate' as const },
}

export default function SiteDetail() {
  useStoreVersion()
  const { siteId } = useParams()
  const site = getSite(siteId!)

  if (!site) {
    return (
      <Screen>
        <div className="p-6">Site not found.</div>
      </Screen>
    )
  }

  const prog = siteProgress(site.id)
  const status = STATUS_LABEL[siteStatus(site.id)]
  const issues = getOpenIssuesForSite(site.id)
  const visits = getVisits()
    .filter((v) => v.siteId === site.id)
    .sort((a, b) => (a.checkinTime < b.checkinTime ? 1 : -1))

  return (
    <Screen>
      <header className="safe-top bg-brand-700 px-5 pb-6 text-white">
        <BackButton />
        <p className="text-xs uppercase tracking-wide text-brand-100">Site</p>
        <h1 className="text-xl font-bold leading-tight">{site.name}</h1>
        <p className="text-sm text-brand-100">{site.client}</p>
      </header>

      <div className="space-y-4 px-4 py-5">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Overall progress</span>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar percent={prog.overall} />
            <span className="num w-10 shrink-0 text-right text-sm font-bold text-emerald-700">
              {prog.overall}%
            </span>
          </div>
          <div className="mt-4">
            <StageBreakdown stages={prog.stages} />
          </div>
          <p className="mt-3 text-[11px] leading-snug text-slate-400">
            Each stage is credited by the area logged against it at check-out, divided by the site
            area. The overall figure is the average of the stages, so it always matches the
            breakdown above.
          </p>
        </div>

        <div className="card p-4">
          <h3 className="mb-2 font-semibold text-slate-700">Details</h3>
          <dl className="space-y-1.5 text-sm">
            <Row label="System" value={site.system} />
            <Row label="Area" value={sqm(site.areaSqm)} />
            <Row label="Address" value={site.address} />
            <Row label="Started" value={shortDate(site.startDate)} />
            <Row label="Target end" value={shortDate(site.targetEndDate)} />
          </dl>
        </div>

        {issues.length > 0 && (
          <div className="card p-4">
            <h3 className="mb-2 font-semibold text-rose-700">Open issues ({issues.length})</h3>
            <div className="space-y-3">
              {issues.map((i) => (
                <div key={i.id} className="flex items-start gap-3">
                  <span
                    className={`mt-[0.3rem] h-2 w-2 shrink-0 rounded-full ${
                      i.type === 'safety' ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate-500">
                      {i.type} · {i.severity}
                    </p>
                    <p className="text-sm leading-snug text-slate-700">{i.description}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {getSupervisor(i.supervisorId)?.name} · {timeOf(i.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-2 px-1 font-semibold text-slate-700">Visit history</h3>
          {visits.length === 0 ? (
            <div className="card p-4 text-center text-sm text-slate-400">No visits logged yet.</div>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => (
                <div key={v.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">
                        {getSupervisor(v.supervisorId)?.name}
                      </p>
                      <p className="num text-xs text-slate-400">
                        {shortDate(v.date)} · {timeOf(v.checkinTime)}
                        {v.checkoutTime ? ` – ${timeOf(v.checkoutTime)}` : ''}
                      </p>
                    </div>
                    {v.status === 'active' ? (
                      <Badge tone="green">On site</Badge>
                    ) : (
                      <Badge tone="slate">
                        {durationBetween(v.checkinTime, v.checkoutTime!)}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-semibold">Target:</span> {v.targetWork}
                  </p>
                  {v.actualWork && (
                    <p className="mt-1 text-xs text-slate-600">
                      <span className="font-semibold">Done:</span> {v.actualWork}
                    </p>
                  )}
                  {v.incompleteReason && (
                    <p className="mt-1 text-xs text-amber-700">
                      <span className="font-semibold">Shortfall:</span> {v.incompleteReason}
                    </p>
                  )}

                  {v.coverage.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {v.coverage.map((c, i) => (
                        <span
                          key={i}
                          className="num rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {c.qty.toLocaleString('en-IN')} {c.unit}
                          {c.thicknessMm ? ` @ ${c.thicknessMm}mm` : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-2 text-[11px] text-slate-400">
                    {v.headcount} workers · GPS verified{' '}
                    <span className="num">{metersLabel(v.checkinDistance)}</span> from site
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <PoweredByHalcyon className="pb-4 pt-2" />
      </div>
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right text-slate-800">{value}</dd>
    </div>
  )
}
