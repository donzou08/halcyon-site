/**
 * ============================================================================
 *  DEMO DATA — 100% FICTIONAL
 * ============================================================================
 *
 * Every company, person, site, phone number and coordinate below is invented.
 * "Meridian Industrial Flooring Pvt Ltd" is the same fictional Chennai flooring
 * contractor used in the companion quotation demo, so the two tell one story.
 *
 * Site coordinates are approximate points in the named industrial areas around
 * Chennai. They exist so GPS check-in works reliably indoors during a meeting:
 * the demo never asks for the viewer's real location.
 * ============================================================================
 */

import type { DemoState, Issue, Site, Supervisor, Visit, WorkDay } from './types'

export const COMPANY = {
  name: 'Meridian Industrial Flooring Pvt Ltd',
  short: 'Meridian',
  tagline: 'Industrial Epoxy · PU · Protective Flooring',
  city: 'Chennai, Tamil Nadu',
}

/** Materials a supervisor can log against a visit. All invented product names. */
export const MATERIAL_OPTIONS = [
  'Epoxy primer (20 kg)',
  'Epoxy base resin (20 kg)',
  'Hardener (10 kg)',
  'Quartz aggregate (25 kg)',
  'PU concrete mortar (25 kg)',
  'Conductive primer (10 kg)',
  'Line marking paint (4 L)',
  'Thinner / solvent (5 L)',
]

export const DEMO_SUPERVISORS: Supervisor[] = [
  {
    id: 'sup-ravi',
    name: 'Ravi Meridian',
    phone: '+91 90000 00010',
    role: 'owner',
    homeLat: 13.0067,
    homeLng: 80.2206,
  },
  {
    id: 'sup-kumar',
    name: 'R. Kumar',
    phone: '+91 90000 00031',
    role: 'supervisor',
    homeLat: 13.0878,
    homeLng: 80.2101,
  },
  {
    id: 'sup-devi',
    name: 'A. Devi',
    phone: '+91 90000 00032',
    role: 'supervisor',
    homeLat: 13.0418,
    homeLng: 80.2341,
  },
  {
    id: 'sup-palani',
    name: 'S. Palanisamy',
    phone: '+91 90000 00033',
    role: 'supervisor',
    homeLat: 12.9810,
    homeLng: 80.1930,
  },
]

const STAGES = ['Surface preparation', 'Primer', 'Screed / body coat', 'Top coat', 'Line marking']

export const DEMO_SITES: Site[] = [
  {
    id: 'site-orion',
    name: 'Orion Auto — Ambattur',
    client: 'Orion Auto Components Pvt Ltd',
    address: 'Plot 22, Ambattur Industrial Estate, Chennai 600058',
    lat: 13.1143,
    lng: 80.1548,
    system: '3mm Epoxy Self-Levelling',
    areaSqm: 1672,
    stages: STAGES,
    startDate: '2026-07-13',
    targetEndDate: '2026-08-05',
    active: true,
  },
  {
    id: 'site-sunrise',
    name: 'Sunrise Pharma — Sriperumbudur',
    client: 'Sunrise Pharma Industries',
    address: 'Survey No. 118, SIPCOT Phase II, Sriperumbudur 602105',
    lat: 12.9675,
    lng: 79.943,
    system: '6mm PU Concrete',
    areaSqm: 883,
    stages: STAGES.slice(0, 4),
    startDate: '2026-07-20',
    targetEndDate: '2026-08-12',
    active: true,
  },
  {
    id: 'site-coastal',
    name: 'Coastal Cold Storage — Ennore',
    client: 'Coastal Cold Storage Ltd',
    address: 'Kamarajar Port Road, Ennore, Chennai 600057',
    lat: 13.221,
    lng: 80.321,
    system: '6mm PU Concrete + Anti-Skid',
    areaSqm: 2044,
    stages: STAGES,
    startDate: '2026-07-06',
    targetEndDate: '2026-08-01',
    active: true,
  },
  {
    id: 'site-bluewave',
    name: 'Bluewave Electronics — Oragadam',
    client: 'Bluewave Electronics Manufacturing',
    address: 'Oragadam Industrial Corridor, Kancheepuram 602105',
    lat: 12.81,
    lng: 79.95,
    system: '2mm ESD (Anti-Static)',
    areaSqm: 1152,
    stages: STAGES,
    startDate: '2026-07-27',
    targetEndDate: '2026-08-20',
    active: true,
  },
]

/** Local ISO date (yyyy-mm-dd) — never UTC, or the demo flips day at 5:30am IST. */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** A timestamp `hours` before `base`, as an ISO string. */
function hoursAgo(base: Date, hours: number): string {
  return new Date(base.getTime() - hours * 3600_000).toISOString()
}

/** A timestamp `days` before `base`, at `hour` local time. */
function daysAgoAt(base: Date, days: number, hour: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() - days)
  d.setHours(hour, 0, 0, 0)
  return d
}

/**
 * A closed-out visit from earlier in a project.
 *
 * These exist so sites that started weeks ago don't read as 0% complete — the
 * progress bars are computed from logged coverage, so the history has to be
 * there for the numbers to make sense.
 */
function pastVisit(
  base: Date,
  args: {
    id: string
    siteId: string
    supervisorId: string
    daysAgo: number
    target: string
    actual: string
    stage: string
    coverage: Visit['coverage']
    headcount: number
  },
): Visit {
  const start = daysAgoAt(base, args.daysAgo, 9)
  const end = daysAgoAt(base, args.daysAgo, 17)
  return {
    id: args.id,
    siteId: args.siteId,
    supervisorId: args.supervisorId,
    date: isoDate(start),
    status: 'completed',
    checkinTime: start.toISOString(),
    checkinLat: 0,
    checkinLng: 0,
    checkinAccuracy: 12,
    checkinDistance: 40,
    targetWork: args.target,
    headcount: args.headcount,
    materials: [],
    checkinPhotos: [],
    checkinNotes: '',
    checkoutTime: end.toISOString(),
    actualWork: args.actual,
    stageReached: args.stage,
    coverage: args.coverage,
    incompleteReason: '',
    checkoutPhotos: [],
  }
}

/**
 * Build today's activity relative to the current time, so the dashboard is
 * never empty and never looks stale:
 *
 *  - Orion    → In Progress      (R. Kumar checked in, still on site)
 *  - Coastal  → Completed Today  (A. Devi checked in and out)
 *  - Sunrise  → Issue Reported   (S. Palanisamy left an open safety issue)
 *  - Bluewave → Not Started
 */
export function buildSeedState(now = new Date()): DemoState {
  const today = isoDate(now)

  const workDays: WorkDay[] = [
    {
      id: 'wd-kumar',
      supervisorId: 'sup-kumar',
      date: today,
      type: 'work',
      startTime: hoursAgo(now, 3.5),
      endTime: null,
      status: 'open',
    },
    {
      id: 'wd-devi',
      supervisorId: 'sup-devi',
      date: today,
      type: 'work',
      startTime: hoursAgo(now, 6),
      endTime: null,
      status: 'open',
    },
    {
      id: 'wd-palani',
      supervisorId: 'sup-palani',
      date: today,
      type: 'work',
      startTime: hoursAgo(now, 7),
      endTime: null,
      status: 'open',
    },
  ]

  const visits: Visit[] = [
    // ---- Earlier in each project, so progress bars have something behind them ----
    pastVisit(now, {
      id: 'v-orion-h1',
      siteId: 'site-orion',
      supervisorId: 'sup-kumar',
      daysAgo: 5,
      target: 'Shot-blast and grind the full machine shop floor.',
      actual: 'Shot-blasting and grinding completed across the whole floor. Dust extracted and swept.',
      stage: 'Surface preparation',
      coverage: [{ category: 'surface_prep', qty: 1672, unit: 'sqm', thicknessMm: null }],
      headcount: 7,
    }),
    pastVisit(now, {
      id: 'v-orion-h2',
      siteId: 'site-orion',
      supervisorId: 'sup-kumar',
      daysAgo: 3,
      target: 'Primer across bays 1 and 2.',
      actual: 'Primer applied across bays 1 and 2 and left to cure overnight.',
      stage: 'Primer',
      coverage: [{ category: 'primer', qty: 1050, unit: 'sqm', thicknessMm: null }],
      headcount: 6,
    }),
    pastVisit(now, {
      id: 'v-coastal-h1',
      siteId: 'site-coastal',
      supervisorId: 'sup-devi',
      daysAgo: 12,
      target: 'Surface preparation across both cold chambers.',
      actual: 'Grinding and joint cutting completed across both chambers.',
      stage: 'Surface preparation',
      coverage: [{ category: 'surface_prep', qty: 2044, unit: 'sqm', thicknessMm: null }],
      headcount: 10,
    }),
    pastVisit(now, {
      id: 'v-coastal-h2',
      siteId: 'site-coastal',
      supervisorId: 'sup-devi',
      daysAgo: 8,
      target: 'Primer across both chambers.',
      actual: 'Primer completed across both chambers. Moisture readings within limits.',
      stage: 'Primer',
      coverage: [{ category: 'primer', qty: 2044, unit: 'sqm', thicknessMm: null }],
      headcount: 8,
    }),

    // ---- Today ----
    // Orion — on site right now.
    {
      id: 'v-orion',
      siteId: 'site-orion',
      supervisorId: 'sup-kumar',
      date: today,
      status: 'active',
      checkinTime: hoursAgo(now, 2.4),
      checkinLat: 13.1145,
      checkinLng: 80.1551,
      checkinAccuracy: 12,
      checkinDistance: 38,
      targetWork: 'Complete primer coat across bays 3 and 4, start screed in bay 3.',
      headcount: 6,
      materials: ['Epoxy primer (20 kg)', 'Epoxy base resin (20 kg)'],
      checkinPhotos: [],
      checkinNotes: 'Floor swept and shot-blasted yesterday. Ready for primer.',
      checkoutTime: null,
      actualWork: '',
      stageReached: '',
      coverage: [],
      incompleteReason: '',
      checkoutPhotos: [],
    },
    // Coastal — completed today.
    {
      id: 'v-coastal',
      siteId: 'site-coastal',
      supervisorId: 'sup-devi',
      date: today,
      status: 'completed',
      checkinTime: hoursAgo(now, 5.5),
      checkinLat: 13.2213,
      checkinLng: 80.3207,
      checkinAccuracy: 9,
      checkinDistance: 45,
      targetWork: 'Lay PU concrete screed across chamber 2 (600 sqm target).',
      headcount: 9,
      materials: ['PU concrete mortar (25 kg)', 'Hardener (10 kg)'],
      checkinPhotos: [],
      checkinNotes: '',
      checkoutTime: hoursAgo(now, 0.75),
      actualWork:
        'Screed laid across chamber 2. Surface levelled and trowel-finished. Chamber sealed off overnight to cure.',
      stageReached: 'Screed / body coat',
      coverage: [
        { category: 'screed', qty: 580, unit: 'sqm', thicknessMm: 6 },
        { category: 'filling', qty: 45, unit: 'kg', thicknessMm: null },
      ],
      incompleteReason: 'Short of the 600 sqm target — last 20 sqm blocked by a pallet stack.',
      checkoutPhotos: [],
    },
    // Sunrise — visit closed, but it left an open issue behind.
    {
      id: 'v-sunrise',
      siteId: 'site-sunrise',
      supervisorId: 'sup-palani',
      date: today,
      status: 'completed',
      checkinTime: hoursAgo(now, 6.5),
      checkinLat: 12.9677,
      checkinLng: 79.9433,
      checkinAccuracy: 15,
      checkinDistance: 41,
      targetWork: 'Surface preparation and moisture test across the formulation block.',
      headcount: 4,
      materials: ['Thinner / solvent (5 L)'],
      checkinPhotos: [],
      checkinNotes: '',
      checkoutTime: hoursAgo(now, 2),
      actualWork:
        'Grinding completed across 340 sqm. Moisture readings taken — two zones came back high.',
      stageReached: 'Surface preparation',
      coverage: [{ category: 'surface_prep', qty: 340, unit: 'sqm', thicknessMm: null }],
      incompleteReason: '',
      checkoutPhotos: [],
    },
  ]

  const issues: Issue[] = [
    {
      id: 'iss-sunrise-1',
      siteId: 'site-sunrise',
      supervisorId: 'sup-palani',
      type: 'quality',
      severity: 'high',
      description:
        'Moisture reading above limit in two zones near the wash bay. Cannot prime until it dries or we add a moisture barrier — needs a decision.',
      status: 'open',
      photos: [],
      createdAt: hoursAgo(now, 2.1),
      resolvedAt: null,
    },
    // Deliberately on Orion, not Coastal: Orion already reads "In Progress"
    // (someone is on site), so this issue shows up in the owner's attention list
    // without overwriting a status — and it leaves Coastal free to demonstrate
    // "Completed Today". All four dashboard statuses are visible at once.
    {
      id: 'iss-orion-1',
      siteId: 'site-orion',
      supervisorId: 'sup-kumar',
      type: 'safety',
      severity: 'medium',
      description:
        'Forklift route still crosses the freshly primed bay. Barricades requested from the client stores — needs chasing before the screed goes down.',
      status: 'open',
      photos: [],
      createdAt: hoursAgo(now, 1.5),
      resolvedAt: null,
    },
  ]

  return {
    supervisors: DEMO_SUPERVISORS,
    sites: DEMO_SITES,
    visits,
    workDays,
    issues,
    clockOffsetMin: 0,
    seededOn: today,
  }
}
