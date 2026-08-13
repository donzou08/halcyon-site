/**
 * The demo data layer.
 *
 * This mirrors how the production tool's store works — an in-memory cache that
 * screens read synchronously, plus mutations that bump a version number so
 * every mounted screen re-renders — but with the Supabase backend and realtime
 * subscription replaced by localStorage. No network, no database, no auth.
 *
 * `now()` is deliberately routed through the store so the presenter can nudge
 * the demo clock forward and watch durations and statuses move.
 */

import type {
  CoverageEntry,
  DemoState,
  Issue,
  IssueSeverity,
  IssueType,
  Photo,
  Site,
  SiteStatus,
  Supervisor,
  Visit,
  WorkDay,
} from './types'
import { buildSeedState, isoDate } from './seed'

const KEY = 'meridian.supervisor.demo.v1'

let state: DemoState = load()
let version = 0
const listeners = new Set<() => void>()

/**
 * Load the demo state, rebuilding it if the stored copy is from an earlier day.
 *
 * The seed is a story about *today*: a work day open since this morning, someone
 * on site for the last couple of hours, a visit that closed a few hours ago. Reload
 * that story a week later and it falls apart — the work days are keyed by date so
 * they vanish, while the visits keep their old dates and linger. That is how the
 * app came to show "Start your work day" directly above "On site now · 198h 53m".
 *
 * So the state carries the date it was seeded on, and anything older is discarded.
 * A visitor arriving at the public URL months from now sees the same coherent
 * "today" the first visitor did.
 *
 * The comparison uses the real wall-clock date, not `today()`: the presenter's
 * clock offset is a nudge within a session, not a change of day, and it is reset
 * whenever the seed is rebuilt.
 */
function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const stored = JSON.parse(raw) as DemoState
      if (stored?.seededOn === isoDate(new Date())) return stored
    }
  } catch {
    /* corrupt or absent — fall through to a fresh seed */
  }
  return buildSeedState()
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* private browsing / quota — the demo still works from memory */
  }
}

/** Commit a change: persist, bump the version, wake every subscriber. */
function commit() {
  persist()
  version++
  listeners.forEach((l) => l())
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getVersion(): number {
  return version
}

/** Wipe the session and rebuild from the seed. */
export function resetDemo() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  state = buildSeedState()
  commit()
}

// ---- Demo clock -------------------------------------------------------------

/**
 * "Now", including any offset the presenter has added. Everything time-related
 * reads this rather than `new Date()` so advancing the clock moves the whole app
 * at once.
 */
export function now(): Date {
  return new Date(Date.now() + state.clockOffsetMin * 60_000)
}

export function today(): string {
  return isoDate(now())
}

/**
 * Nudge the demo clock forward, staying inside the seeded day.
 *
 * Every seeded work day, visit and issue is stamped with the seed date, so
 * stepping past midnight would strand the whole day in "yesterday" and empty the
 * dashboard — the same failure the day-rollover rebuild exists to prevent, just
 * triggered from inside a session instead of across days.
 */
export function advanceClock(minutes: number): { ok: boolean; message: string } {
  const candidate = new Date(now().getTime() + minutes * 60_000)
  if (isoDate(candidate) !== state.seededOn) {
    return { ok: false, message: 'Demo clock is at the end of the day. Reset to start again.' }
  }
  state.clockOffsetMin += minutes
  commit()
  return { ok: true, message: `Demo clock advanced by ${minutes} minutes.` }
}

export function clockOffsetMin(): number {
  return state.clockOffsetMin
}

// ---- Readers ---------------------------------------------------------------

export const getSupervisors = (): Supervisor[] => state.supervisors
export const getFieldStaff = (): Supervisor[] =>
  state.supervisors.filter((s) => s.role === 'supervisor')
export const getSupervisor = (id: string): Supervisor | undefined =>
  state.supervisors.find((s) => s.id === id)

export const getSites = (): Site[] => state.sites.filter((s) => s.active)
export const getSite = (id: string): Site | undefined => state.sites.find((s) => s.id === id)

export const getVisits = (): Visit[] => state.visits
export const getIssues = (): Issue[] => state.issues
export const getOpenIssues = (): Issue[] => state.issues.filter((i) => i.status === 'open')
export const getOpenIssuesForSite = (siteId: string): Issue[] =>
  state.issues.filter((i) => i.siteId === siteId && i.status === 'open')

export const getVisitsToday = (): Visit[] => state.visits.filter((v) => v.date === today())

/**
 * The supervisor's open visit, if they have one.
 *
 * Scoped to today on purpose. A visit left `active` on a past date is a stale
 * record, not somebody standing on a floor — counting it is what produced a
 * "198h 53m on site" reading against a work day that had never been started.
 * The day-rollover rebuild in `load()` should mean this never has anything to
 * exclude; the scope is here so the two can never contradict each other again.
 */
export function getActiveVisit(supervisorId: string): Visit | undefined {
  return state.visits.find(
    (v) => v.supervisorId === supervisorId && v.status === 'active' && v.date === today(),
  )
}

export function getVisit(id: string): Visit | undefined {
  return state.visits.find((v) => v.id === id)
}

export function getWorkDay(supervisorId: string, date = today()): WorkDay | undefined {
  return state.workDays.find((w) => w.supervisorId === supervisorId && w.date === date)
}

export function getOpenWorkDay(supervisorId: string): WorkDay | undefined {
  const w = getWorkDay(supervisorId)
  return w && w.status === 'open' && w.type === 'work' ? w : undefined
}

/** Who is on a given site right now. Today only — see `getActiveVisit`. */
export function activeVisitsForSite(siteId: string): Visit[] {
  return state.visits.filter(
    (v) => v.siteId === siteId && v.status === 'active' && v.date === today(),
  )
}

/**
 * The site's headline status on the owner dashboard.
 *
 * Order matters: someone being on site beats everything, an unresolved issue
 * beats a finished visit, and "completed today" only applies if work actually
 * closed out today.
 */
export function siteStatus(siteId: string): SiteStatus {
  if (activeVisitsForSite(siteId).length > 0) return 'in_progress'
  if (getOpenIssuesForSite(siteId).length > 0) return 'issue_reported'
  const closedToday = state.visits.some(
    (v) => v.siteId === siteId && v.date === today() && v.status === 'completed',
  )
  return closedToday ? 'completed_today' : 'not_started'
}

/**
 * Rough completion for a site, from logged coverage against its area.
 *
 * Each stage is credited by the area covered for that stage; the overall figure
 * is the average of the stage percentages, so it always reconciles with the
 * breakdown shown underneath it.
 */
export function siteProgress(siteId: string): { overall: number; stages: { stage: string; percent: number }[] } {
  const site = getSite(siteId)
  if (!site) return { overall: 0, stages: [] }

  const catForStage: Record<string, CoverageEntry['category']> = {
    'Surface preparation': 'surface_prep',
    Primer: 'primer',
    'Screed / body coat': 'screed',
    'Top coat': 'top_coat',
    'Line marking': 'line_marking',
  }

  const done = new Map<string, number>()
  for (const v of state.visits) {
    if (v.siteId !== siteId) continue
    for (const c of v.coverage) {
      if (c.unit !== 'sqm') continue
      done.set(c.category, (done.get(c.category) ?? 0) + c.qty)
    }
  }

  const stages = site.stages.map((stage) => {
    const cat = catForStage[stage]
    const covered = cat ? (done.get(cat) ?? 0) : 0
    const percent = site.areaSqm > 0 ? Math.min(100, Math.round((covered / site.areaSqm) * 100)) : 0
    return { stage, percent }
  })

  const overall = stages.length
    ? Math.round(stages.reduce((sum, s) => sum + s.percent, 0) / stages.length)
    : 0

  return { overall, stages }
}

// ---- Mutations -------------------------------------------------------------

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`

export function startWorkDay(supervisorId: string) {
  const date = today()
  const existing = getWorkDay(supervisorId, date)
  if (existing) {
    existing.type = 'work'
    existing.status = 'open'
    existing.startTime = existing.startTime ?? now().toISOString()
    existing.endTime = null
  } else {
    state.workDays.push({
      id: uid('wd'),
      supervisorId,
      date,
      type: 'work',
      startTime: now().toISOString(),
      endTime: null,
      status: 'open',
    })
  }
  commit()
}

/**
 * Ending the day is gated on the supervisor having closed out of every site.
 * That gate is the point: it is what stops a day ending with an open visit and
 * no record of what was actually finished.
 */
export function canEndWorkDay(supervisorId: string): { ok: boolean; reason?: string } {
  const wd = getOpenWorkDay(supervisorId)
  if (!wd) return { ok: false, reason: 'No work day is open.' }
  if (getActiveVisit(supervisorId)) {
    return { ok: false, reason: 'You are still checked in at a site. Check out first.' }
  }
  return { ok: true }
}

export function endWorkDay(supervisorId: string) {
  const wd = getOpenWorkDay(supervisorId)
  if (!wd) return
  wd.endTime = now().toISOString()
  wd.status = 'ended'
  commit()
}

export function reopenWorkDay(supervisorId: string) {
  const wd = getWorkDay(supervisorId)
  if (!wd) return
  wd.status = 'open'
  wd.type = 'work'
  wd.endTime = null
  commit()
}

export function setDayType(supervisorId: string, type: 'holiday' | 'rest') {
  const date = today()
  const wd = getWorkDay(supervisorId, date)
  if (wd) {
    wd.type = type
    wd.status = 'ended'
    commit()
    return
  }
  state.workDays.push({
    id: uid('wd'),
    supervisorId,
    date,
    type,
    startTime: null,
    endTime: null,
    status: 'ended',
  })
  commit()
}

export function checkIn(args: {
  siteId: string
  supervisorId: string
  lat: number
  lng: number
  accuracy: number
  distance: number
  targetWork: string
  headcount: number
  materials: string[]
  photos: Photo[]
  notes: string
}): string {
  const id = uid('v')
  state.visits.push({
    id,
    siteId: args.siteId,
    supervisorId: args.supervisorId,
    date: today(),
    status: 'active',
    checkinTime: now().toISOString(),
    checkinLat: args.lat,
    checkinLng: args.lng,
    checkinAccuracy: args.accuracy,
    checkinDistance: args.distance,
    targetWork: args.targetWork,
    headcount: args.headcount,
    materials: args.materials,
    checkinPhotos: args.photos,
    checkinNotes: args.notes,
    checkoutTime: null,
    actualWork: '',
    stageReached: '',
    coverage: [],
    incompleteReason: '',
    checkoutPhotos: [],
  })
  commit()
  return id
}

export function checkOut(
  visitId: string,
  args: {
    actualWork: string
    stageReached: string
    coverage: CoverageEntry[]
    incompleteReason: string
    photos: Photo[]
  },
) {
  const v = getVisit(visitId)
  if (!v) return
  v.status = 'completed'
  v.checkoutTime = now().toISOString()
  v.actualWork = args.actualWork
  v.stageReached = args.stageReached
  v.coverage = args.coverage
  v.incompleteReason = args.incompleteReason
  v.checkoutPhotos = args.photos
  commit()
}

export function addIssue(args: {
  siteId: string
  supervisorId: string
  type: IssueType
  severity: IssueSeverity
  description: string
  photos: Photo[]
}): string {
  const id = uid('iss')
  state.issues.unshift({
    id,
    siteId: args.siteId,
    supervisorId: args.supervisorId,
    type: args.type,
    severity: args.severity,
    description: args.description,
    status: 'open',
    photos: args.photos,
    createdAt: now().toISOString(),
    resolvedAt: null,
  })
  commit()
  return id
}

export function resolveIssue(issueId: string) {
  const i = state.issues.find((x) => x.id === issueId)
  if (!i) return
  i.status = 'resolved'
  i.resolvedAt = now().toISOString()
  commit()
}

// ---- Presenter controls ----------------------------------------------------

/**
 * Check a supervisor into a site with plausible details, without walking through
 * the form. This is the control the presenter taps mid-meeting so the owner
 * dashboard visibly changes while the client is watching it.
 */
export function simulateCheckIn(): { ok: boolean; message: string } {
  const site = getSites().find((s) => siteStatus(s.id) === 'not_started') ?? getSites()[0]
  const free = getFieldStaff().find((s) => !getActiveVisit(s.id))
  if (!site || !free) {
    return { ok: false, message: 'Every supervisor is already checked in somewhere.' }
  }
  if (!getOpenWorkDay(free.id)) startWorkDay(free.id)

  checkIn({
    siteId: site.id,
    supervisorId: free.id,
    lat: site.lat + 0.0002,
    lng: site.lng + 0.0002,
    accuracy: 11,
    distance: 31,
    targetWork: `Begin ${site.stages[0].toLowerCase()} across the main bay.`,
    headcount: 5,
    materials: [],
    photos: [],
    notes: '',
  })
  return { ok: true, message: `${free.name} checked in at ${site.name}.` }
}

/** Close out whoever has been on site longest, so the dashboard visibly settles. */
export function simulateCheckOut(): { ok: boolean; message: string } {
  const active = state.visits
    .filter((v) => v.status === 'active')
    .sort((a, b) => (a.checkinTime < b.checkinTime ? -1 : 1))[0]
  if (!active) return { ok: false, message: 'Nobody is checked in right now.' }

  const site = getSite(active.siteId)
  const sup = getSupervisor(active.supervisorId)
  checkOut(active.id, {
    actualWork: `${active.targetWork.replace(/\.$/, '')} — completed as planned.`,
    stageReached: site?.stages[1] ?? '',
    coverage: [{ category: 'primer', qty: Math.round((site?.areaSqm ?? 500) * 0.35), unit: 'sqm', thicknessMm: null }],
    incompleteReason: '',
    photos: [],
  })
  return { ok: true, message: `${sup?.name ?? 'Supervisor'} checked out of ${site?.name ?? 'site'}.` }
}
