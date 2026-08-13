/**
 * Every name, figure and date in this file is invented.
 *
 * The fictional business is Ashwood Contracts Pvt Ltd, a 22-person interiors
 * and fit-out contractor. It is deliberately not a flooring company: the
 * command centre is the one tool here that is not built around a trade, and the
 * demo has to make that obvious.
 *
 * All money is in rupees.
 */

export const COMPANY = {
  name: 'Ashwood Contracts',
  legal: 'Ashwood Contracts Pvt Ltd',
  trade: 'Interiors and fit-out',
  headcount: 22,
  today: 'Thursday, 6 August 2026',
}

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

export const OPENING = {
  cash: 1840000,
  owedByUs: 1160000,
  invoicedThisMonth: 2780000,
}

export interface Receivable {
  id: string
  client: string
  invoice: string
  amount: number
  daysOutstanding: number
}

export const RECEIVABLES: Receivable[] = [
  { id: 'r1', client: 'Northbrook Logistics', invoice: 'ASH/26/0188', amount: 390000, daysOutstanding: 62 },
  { id: 'r2', client: 'Marine Drive Hotels', invoice: 'ASH/26/0204', amount: 680000, daysOutstanding: 41 },
  { id: 'r3', client: 'Ridgeline Foods', invoice: 'ASH/26/0219', amount: 420000, daysOutstanding: 18 },
  { id: 'r4', client: 'Castleton Retail', invoice: 'ASH/26/0231', amount: 1150000, daysOutstanding: 7 },
  { id: 'r5', client: 'Vellore Diagnostics', invoice: 'ASH/26/0238', amount: 780000, daysOutstanding: 3 },
]

/** Money banked per month. August is a part month and is marked as such. */
export interface MonthPoint {
  month: string
  full: string
  amount: number
  partial?: boolean
}

export const MONEY_IN: MonthPoint[] = [
  { month: 'Mar', full: 'March 2026', amount: 2140000 },
  { month: 'Apr', full: 'April 2026', amount: 2680000 },
  { month: 'May', full: 'May 2026', amount: 1920000 },
  { month: 'Jun', full: 'June 2026', amount: 3150000 },
  { month: 'Jul', full: 'July 2026', amount: 2890000 },
  { month: 'Aug', full: 'August 2026', amount: 1230000, partial: true },
]

// ---------------------------------------------------------------------------
// Work
// ---------------------------------------------------------------------------

export type Stage = 'Drawings' | 'Material' | 'On site' | 'Snagging' | 'Handover'

export const STAGES: Stage[] = ['Drawings', 'Material', 'On site', 'Snagging', 'Handover']

export interface Job {
  id: string
  client: string
  name: string
  value: number
  /** Committed spend to date, which is how a job quietly loses money. */
  spent: number
  stage: Stage
  percent: number
  due: string
  daysToDue: number
  lead: string
  crew: number
  nextMilestone: string
}

export const JOBS: Job[] = [
  {
    id: 'j1',
    client: 'Marine Drive Hotels',
    name: 'Banquet hall fit-out',
    value: 4200000,
    spent: 3520000,
    stage: 'Snagging',
    percent: 88,
    due: '14 Aug',
    daysToDue: 8,
    lead: 'Prakash Anand',
    crew: 6,
    nextMilestone: 'Client snag walk, 11 Aug',
  },
  {
    id: 'j2',
    client: 'Castleton Retail',
    name: 'Phoenix store, full interiors',
    value: 6800000,
    spent: 4150000,
    stage: 'On site',
    percent: 54,
    due: '29 Aug',
    daysToDue: 23,
    lead: 'Devi Sundaram',
    crew: 9,
    nextMilestone: 'Ceiling grid sign-off, 12 Aug',
  },
  {
    id: 'j3',
    client: 'Northbrook Logistics',
    name: 'Office block, two floors',
    value: 3100000,
    spent: 1080000,
    stage: 'On site',
    percent: 37,
    due: '9 Sep',
    daysToDue: 34,
    lead: 'Prakash Anand',
    crew: 4,
    nextMilestone: 'Partition framing complete, 18 Aug',
  },
  {
    id: 'j4',
    client: 'Vellore Diagnostics',
    name: 'Laboratory interiors',
    value: 2400000,
    spent: 260000,
    stage: 'Material',
    percent: 12,
    due: '22 Sep',
    daysToDue: 47,
    lead: 'Farid Rahman',
    crew: 2,
    nextMilestone: 'Lab furniture order released, 13 Aug',
  },
  {
    id: 'j5',
    client: 'Ridgeline Foods',
    name: 'Staff canteen',
    value: 1800000,
    spent: 90000,
    stage: 'Drawings',
    percent: 5,
    due: '2 Oct',
    daysToDue: 57,
    lead: 'Devi Sundaram',
    crew: 1,
    nextMilestone: 'Drawing approval from client, overdue 4 days',
  },
]

// ---------------------------------------------------------------------------
// Quotes waiting on an answer
// ---------------------------------------------------------------------------

export interface FollowUp {
  id: string
  client: string
  work: string
  value: number
  sentDaysAgo: number
}

export const FOLLOW_UPS: FollowUp[] = [
  { id: 'f1', client: 'Ridgeline Foods', work: 'Canteen extension', value: 1800000, sentDaysAgo: 9 },
  { id: 'f2', client: 'Harbour Point Developers', work: 'Lobby refurbishment', value: 5200000, sentDaysAgo: 4 },
  { id: 'f3', client: 'Ammon Textiles', work: 'Mezzanine office', value: 2600000, sentDaysAgo: 2 },
]

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface Person {
  name: string
  role: string
  where: string
}

export const PEOPLE: Person[] = [
  { name: 'Prakash Anand', role: 'Site lead', where: 'Marine Drive' },
  { name: 'Devi Sundaram', role: 'Site lead', where: 'Castleton, Phoenix' },
  { name: 'Farid Rahman', role: 'Projects', where: 'Office' },
  { name: 'Meena Kuppusamy', role: 'Accounts', where: 'Office' },
]

export const CREW_ON_SITE = 18

// ---------------------------------------------------------------------------
// The alert zone
// ---------------------------------------------------------------------------

export type Severity = 'serious' | 'warning' | 'watch'

export interface Alert {
  id: string
  severity: Severity
  title: string
  detail: string
  /** What the button does. `collect` settles a receivable, `chase` a quote. */
  action: { kind: 'collect'; receivableId: string } | { kind: 'chase'; followUpId: string } | { kind: 'open'; jobId: string } | { kind: 'ack' }
  actionLabel: string
}

export const ALERTS: Alert[] = [
  {
    id: 'a1',
    severity: 'serious',
    title: 'Northbrook invoice is 62 days overdue',
    detail: 'ASH/26/0188, and their next job starts in five weeks.',
    action: { kind: 'collect', receivableId: 'r1' },
    actionLabel: 'Record payment',
  },
  {
    id: 'a2',
    severity: 'serious',
    title: 'Marine Drive invoice is 41 days overdue',
    detail: 'ASH/26/0204. Handover is in eight days, so leverage goes with it.',
    action: { kind: 'collect', receivableId: 'r2' },
    actionLabel: 'Record payment',
  },
  {
    id: 'a3',
    severity: 'warning',
    title: 'Castleton has spent 61 percent of budget at 54 percent done',
    detail: 'Seven points adrift. It was two points adrift a fortnight ago.',
    action: { kind: 'open', jobId: 'j2' },
    actionLabel: 'Open the job',
  },
  {
    id: 'a4',
    severity: 'warning',
    title: 'Ridgeline quote has had no reply for 9 days',
    detail: 'Rs 18 L. They approved the drawings for the main canteen last month.',
    action: { kind: 'chase', followUpId: 'f1' },
    actionLabel: 'Mark as chased',
  },
  {
    id: 'a5',
    severity: 'watch',
    title: 'Two site engineers come free on Monday',
    detail: 'Marine Drive finishes snagging. Nothing is booked for them yet.',
    action: { kind: 'ack' },
    actionLabel: 'Noted',
  },
]
