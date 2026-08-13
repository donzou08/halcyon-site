// Domain types for the Meridian field-supervision demo.
//
// These mirror the production tool's model: sites with an ordered list of
// application stages, supervisors who open a work day and then check in and out
// of sites, and issues that surface on the owner's dashboard.

export type Role = 'owner' | 'supervisor'

export interface Supervisor {
  id: string
  name: string
  phone: string
  role: Role
  /** Where the work day starts and ends from — used for the travel estimate. */
  homeLat: number
  homeLng: number
}

export interface Site {
  id: string
  name: string
  client: string
  address: string
  lat: number
  lng: number
  system: string
  areaSqm: number
  /** Ordered application stages, e.g. Surface prep → Primer → Screed → Top coat. */
  stages: string[]
  startDate: string
  targetEndDate: string
  active: boolean
}

/** What a supervisor coated or consumed during a visit. */
export type CoverageCategory =
  | 'surface_prep'
  | 'primer'
  | 'screed'
  | 'top_coat'
  | 'line_marking'
  | 'filling'

export interface CoverageEntry {
  category: CoverageCategory
  qty: number
  unit: string
  thicknessMm: number | null
}

export interface Photo {
  id: string
  /** Object URL for a locally-picked image. Nothing is uploaded anywhere. */
  url: string
  caption?: string
}

export interface Visit {
  id: string
  siteId: string
  supervisorId: string
  date: string
  status: 'active' | 'completed'
  // check-in
  checkinTime: string
  checkinLat: number
  checkinLng: number
  checkinAccuracy: number
  /** Distance in metres between the captured fix and the site. */
  checkinDistance: number
  targetWork: string
  headcount: number
  materials: string[]
  checkinPhotos: Photo[]
  checkinNotes: string
  // check-out
  checkoutTime: string | null
  actualWork: string
  stageReached: string
  coverage: CoverageEntry[]
  incompleteReason: string
  checkoutPhotos: Photo[]
}

export interface WorkDay {
  id: string
  supervisorId: string
  date: string
  type: 'work' | 'holiday' | 'rest'
  startTime: string | null
  endTime: string | null
  status: 'open' | 'ended'
}

export type IssueType = 'quality' | 'safety'
export type IssueSeverity = 'low' | 'medium' | 'high'

export interface Issue {
  id: string
  siteId: string
  supervisorId: string
  type: IssueType
  severity: IssueSeverity
  description: string
  status: 'open' | 'resolved'
  photos: Photo[]
  createdAt: string
  resolvedAt: string | null
}

/** Everything the demo holds. One object so it serialises in one go. */
export interface DemoState {
  supervisors: Supervisor[]
  sites: Site[]
  visits: Visit[]
  workDays: WorkDay[]
  issues: Issue[]
  /** Minutes the demo clock has been nudged forward by the presenter. */
  clockOffsetMin: number
  /**
   * Local calendar date (yyyy-mm-dd) this state was seeded on.
   *
   * The seed describes *today* — an open work day, someone on site, a visit
   * closed a few hours ago. Persisted to localStorage and reopened a week later
   * that story is no longer true, so the store rebuilds when this date is not
   * today. Without it the demo silently rots on a public URL.
   */
  seededOn: string
}

/** Derived, presentation-level status for a site on the owner dashboard. */
export type SiteStatus = 'in_progress' | 'issue_reported' | 'completed_today' | 'not_started'
