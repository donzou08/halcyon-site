/**
 * Every figure, name and tender in this file is invented.
 *
 * No department, portal reference, tender number, value or closing date here
 * corresponds to a real procurement notice. The fictional bidder is Meridian
 * Industrial Flooring Pvt Ltd, the same invented contractor used by the
 * companion quotation and supervisor demos, so the three tell one story: find
 * the job, price the job, run the job.
 *
 * The shape of the scan (nine portals, four of them behind a CAPTCHA, 129
 * notices read, nine worth reading) mirrors the real system's shape. The
 * contents do not.
 */

export type PortalId =
  | 'cppp'
  | 'gem'
  | 'railways'
  | 'tnep'
  | 'defence'
  | 'airports'
  | 'municipal'
  | 'sidco'
  | 'psu'

export interface Portal {
  id: PortalId
  name: string
  short: string
  /** Portals that put a CAPTCHA between the scanner and the notice list. */
  captcha: boolean
  /** Notices read on this portal during the scan. */
  read: number
}

/** Nine sources. Four of them need a CAPTCHA solved before the list loads. */
export const PORTALS: Portal[] = [
  { id: 'cppp', name: 'Central Public Procurement Portal', short: 'CPPP', captcha: true, read: 34 },
  { id: 'gem', name: 'Government e-Marketplace', short: 'GeM', captcha: false, read: 21 },
  { id: 'railways', name: 'Railways e-Procurement', short: 'Railways', captcha: true, read: 18 },
  { id: 'tnep', name: 'Tamil Nadu e-Procurement', short: 'TN e-Proc', captcha: true, read: 16 },
  { id: 'defence', name: 'Defence e-Procurement', short: 'Defence', captcha: true, read: 11 },
  { id: 'airports', name: 'Airports Authority Tenders', short: 'Airports', captcha: false, read: 9 },
  { id: 'municipal', name: 'Municipal Corporation e-Tenders', short: 'Municipal', captcha: false, read: 8 },
  { id: 'sidco', name: 'State Industrial Development Corporation', short: 'SIDCO', captcha: false, read: 7 },
  { id: 'psu', name: 'Public Sector Undertakings Portal', short: 'PSU', captcha: false, read: 5 },
]

export const TOTAL_READ = PORTALS.reduce((sum, p) => sum + p.read, 0) // 129

/** A single reason the fit engine scored the notice up or down. */
export interface Signal {
  label: string
  detail: string
  weight: 'strong' | 'fair' | 'watch'
}

export interface Tender {
  id: string
  ref: string
  title: string
  department: string
  portal: PortalId
  location: string
  /** Estimated contract value in rupees. */
  value: number
  /** Earnest money deposit in rupees. */
  emd: number
  /** Days from the scan date until bids close. */
  daysLeft: number
  closing: string
  completionWeeks: number
  fit: number
  summary: string
  signals: Signal[]
  /** Things that would sink the bid if nobody noticed them in time. */
  flags: string[]
}

/**
 * The nine that survived. Ranked by fit, highest first.
 *
 * Fit is a plain 0 to 100 score over five things the owner already judges by
 * eye: is it our kind of work, is the value in our range, can we reach the
 * site, have we done one like it, and do we clear the eligibility bar.
 */
export const TENDERS: Tender[] = [
  {
    id: 't1',
    ref: 'RLY/CCC/PMB/2026/1184',
    title: 'Supply and laying of epoxy flooring at Coach Care Complex, Perambur',
    department: 'Southern Railway, Carriage Works',
    portal: 'railways',
    location: 'Perambur, Chennai',
    value: 4280000,
    emd: 85600,
    daysLeft: 6,
    closing: '12 Aug 2026, 15:00',
    completionWeeks: 10,
    fit: 94,
    summary:
      'Self-levelling epoxy to 2,400 sqm of maintenance bay floor, including surface preparation, coving and line marking to the existing bay layout.',
    signals: [
      { label: 'Work matches', detail: 'Epoxy self-levelling, our first system', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 42.8 L sits inside the Rs 8 L to Rs 90 L band', weight: 'strong' },
      { label: 'Distance', detail: '14 km from the yard, own crew can travel daily', weight: 'strong' },
      { label: 'Done before', detail: 'Two railway bay floors completed in 2025', weight: 'strong' },
      { label: 'Eligibility', detail: 'Turnover and completion certificates both clear', weight: 'fair' },
    ],
    flags: ['Bids close in 6 days', 'Site visit recommended before quoting, bay must be surveyed wet'],
  },
  {
    id: 't2',
    ref: 'SIDCO/HSR/ESD/2026/0442',
    title: 'Anti-static ESD flooring for electronics assembly block, SIPCOT Hosur',
    department: 'State Industrial Development Corporation',
    portal: 'sidco',
    location: 'Hosur, Krishnagiri',
    value: 2850000,
    emd: 57000,
    daysLeft: 11,
    closing: '17 Aug 2026, 17:00',
    completionWeeks: 8,
    fit: 91,
    summary:
      'ESD-dissipative epoxy system to 1,650 sqm with earthing strips, resistance testing and a signed test report per bay.',
    signals: [
      { label: 'Work matches', detail: 'Anti-static system, priced in our catalogue', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 28.5 L, comfortable single-crew job', weight: 'strong' },
      { label: 'Distance', detail: '42 km, within the daily travel radius', weight: 'fair' },
      { label: 'Done before', detail: 'One ESD floor completed, resistance report on file', weight: 'fair' },
      { label: 'Eligibility', detail: 'Meets the three-year experience clause', weight: 'strong' },
    ],
    flags: ['Earthing continuity test to be witnessed by the department'],
  },
  {
    id: 't3',
    ref: 'GCC/CK/FLR/2026/0913',
    title: 'PU screed food-grade flooring, Central Kitchen, Greater Chennai Corporation',
    department: 'Greater Chennai Corporation',
    portal: 'municipal',
    location: 'Kodungaiyur, Chennai',
    value: 1920000,
    emd: 38400,
    daysLeft: 4,
    closing: '10 Aug 2026, 15:00',
    completionWeeks: 6,
    fit: 88,
    summary:
      'Heavy-duty PU screed to 780 sqm of wet kitchen area, thermal shock rated, with drainage falls and stainless drain edging.',
    signals: [
      { label: 'Work matches', detail: 'PU screed, our highest margin system', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 19.2 L, small but clean', weight: 'fair' },
      { label: 'Distance', detail: '9 km from the yard', weight: 'strong' },
      { label: 'Done before', detail: 'Three food-grade kitchens completed', weight: 'strong' },
      { label: 'Eligibility', detail: 'Clear, no class restriction on this notice', weight: 'strong' },
    ],
    flags: ['Bids close in 4 days', 'Work is night-shift only, kitchen runs through the day'],
  },
  {
    id: 't4',
    ref: 'TNPCB/RNP/ETP/2026/0271',
    title: 'Chemical resistant flooring and bund lining, effluent treatment plant, Ranipet',
    department: 'Tamil Nadu Industrial Infrastructure',
    portal: 'tnep',
    location: 'Ranipet, Ranipet district',
    value: 3400000,
    emd: 68000,
    daysLeft: 9,
    closing: '15 Aug 2026, 16:00',
    completionWeeks: 12,
    fit: 85,
    summary:
      'Vinyl ester lining to bund walls and 1,100 sqm of plant floor, with chemical resistance certification for the acid stream.',
    signals: [
      { label: 'Work matches', detail: 'Chemical resistant lining, in catalogue', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 34 L', weight: 'strong' },
      { label: 'Distance', detail: '118 km, crew would need to stay over', weight: 'watch' },
      { label: 'Done before', detail: 'One similar bund lining, 2024', weight: 'fair' },
      { label: 'Eligibility', detail: 'Clear', weight: 'strong' },
    ],
    flags: ['Crew accommodation to be priced in', 'Hot work permit needed, plant stays live'],
  },
  {
    id: 't5',
    ref: 'AAI/TRZ/NTB/2026/0158',
    title: 'Car park deck coating, new terminal building, Trichy Airport',
    department: 'Airports Authority',
    portal: 'airports',
    location: 'Tiruchirappalli',
    value: 6740000,
    emd: 134800,
    daysLeft: 14,
    closing: '20 Aug 2026, 15:00',
    completionWeeks: 14,
    fit: 82,
    summary:
      'Trafficable deck coating to 4,200 sqm of exposed parking deck, including crack bridging, falls to drains and bay marking.',
    signals: [
      { label: 'Work matches', detail: 'Deck coating with line marking, both in catalogue', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 67.4 L, the largest in this scan', weight: 'fair' },
      { label: 'Distance', detail: '325 km, a full site camp', weight: 'watch' },
      { label: 'Done before', detail: 'No airport work yet, deck coating yes', weight: 'watch' },
      { label: 'Eligibility', detail: 'Turnover clears, needs one deck reference', weight: 'fair' },
    ],
    flags: [
      'Airside security clearance for every crew member, allow three weeks',
      'Reference for a deck of 3,000 sqm or more must be attached',
    ],
  },
  {
    id: 't6',
    ref: 'OFB/ARV/CIV/2026/0087',
    title: 'Industrial flooring renovation, ordnance factory workshop, Aruvankadu',
    department: 'Defence production establishment',
    portal: 'defence',
    location: 'Aruvankadu, Nilgiris',
    value: 5100000,
    emd: 102000,
    daysLeft: 8,
    closing: '14 Aug 2026, 14:00',
    completionWeeks: 16,
    fit: 79,
    summary:
      'Removal of failed screed and relaying of heavy-duty epoxy mortar to 2,900 sqm across three workshop bays, phased so production continues.',
    signals: [
      { label: 'Work matches', detail: 'Epoxy mortar, heaviest system we lay', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 51 L', weight: 'strong' },
      { label: 'Distance', detail: '520 km, hill road, plant transport is slow', weight: 'watch' },
      { label: 'Done before', detail: 'Phased workshop relays yes, defence site no', weight: 'fair' },
      { label: 'Eligibility', detail: 'Security vetting adds two weeks to mobilisation', weight: 'watch' },
    ],
    flags: [
      'Police verification for all workers before entry',
      'Photography banned on site, progress reports must be written',
    ],
  },
  {
    id: 't7',
    ref: 'CWC/SPD/WHS/2026/0664',
    title: 'Floor hardener and coating to warehouse blocks, Sriperumbudur',
    department: 'Central Warehousing',
    portal: 'cppp',
    location: 'Sriperumbudur, Kancheepuram',
    value: 2360000,
    emd: 47200,
    daysLeft: 17,
    closing: '23 Aug 2026, 15:00',
    completionWeeks: 9,
    fit: 76,
    summary:
      'Dry shake hardener and sealer to 5,600 sqm across two warehouse blocks, with joint filling to existing saw cuts.',
    signals: [
      { label: 'Work matches', detail: 'Hardener and joint filling, both in catalogue', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 23.6 L over a large area, thin margin', weight: 'watch' },
      { label: 'Distance', detail: '48 km, daily travel works', weight: 'strong' },
      { label: 'Done before', detail: 'Four warehouse floors completed', weight: 'strong' },
      { label: 'Eligibility', detail: 'Clear', weight: 'fair' },
    ],
    flags: ['Rate is per sqm with no escalation clause, check cement prices before quoting'],
  },
  {
    id: 't8',
    ref: 'GMCV/LAB/FLR/2026/0339',
    title: 'Epoxy coating to laboratory floors, Government Medical College, Vellore',
    department: 'Directorate of Medical Education',
    portal: 'tnep',
    location: 'Vellore',
    value: 890000,
    emd: 17800,
    daysLeft: 5,
    closing: '11 Aug 2026, 17:00',
    completionWeeks: 4,
    fit: 71,
    summary:
      'Solvent-free epoxy coating to 460 sqm across eleven laboratory rooms, with coving to walls and chemical resistance to the pathology block.',
    signals: [
      { label: 'Work matches', detail: 'Standard epoxy coating', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 8.9 L, at the bottom of the band', weight: 'watch' },
      { label: 'Distance', detail: '140 km', weight: 'watch' },
      { label: 'Done before', detail: 'Two hospital laboratory floors completed', weight: 'strong' },
      { label: 'Eligibility', detail: 'Clear', weight: 'fair' },
    ],
    flags: ['Bids close in 5 days', 'Eleven small rooms, mobilisation cost is the whole risk'],
  },
  {
    id: 't9',
    ref: 'CCMC/BT/ASF/2026/0521',
    title: 'Anti-skid flooring, bus terminus upgradation, Coimbatore',
    department: 'Coimbatore City Municipal Corporation',
    portal: 'municipal',
    location: 'Gandhipuram, Coimbatore',
    value: 1530000,
    emd: 30600,
    daysLeft: 21,
    closing: '27 Aug 2026, 15:00',
    completionWeeks: 7,
    fit: 68,
    summary:
      'Anti-skid coating to 1,900 sqm of passenger concourse and ramps, laid in sections so the terminus stays open throughout.',
    signals: [
      { label: 'Work matches', detail: 'Anti-skid coating, in catalogue', weight: 'strong' },
      { label: 'Value in range', detail: 'Rs 15.3 L', weight: 'fair' },
      { label: 'Distance', detail: '510 km, site camp needed for a small job', weight: 'watch' },
      { label: 'Done before', detail: 'No public concourse work yet', weight: 'watch' },
      { label: 'Eligibility', detail: 'Clear', weight: 'fair' },
    ],
    flags: ['Sectional working with public access, night shifts and barricading to be priced'],
  },
]

/** Why the other 120 were read and set aside. This is the point of the tool. */
export interface SetAside {
  reason: string
  count: number
  example: string
}

export const SET_ASIDE: SetAside[] = [
  {
    reason: 'Not flooring or coating work',
    count: 71,
    example: 'Roof waterproofing, painting, false ceiling, road resurfacing',
  },
  {
    reason: 'Value below the Rs 8 lakh floor',
    count: 18,
    example: 'Rs 1.2 L patch repair to a panchayat office floor',
  },
  {
    reason: 'Outside Tamil Nadu, Karnataka and Andhra Pradesh',
    count: 14,
    example: 'Epoxy flooring, district hospital, Bhopal',
  },
  {
    reason: 'Closing in under 3 days, not enough time to price it',
    count: 9,
    example: 'PU flooring, cold store, closing tomorrow at 15:00',
  },
  {
    reason: 'Eligibility not met',
    count: 8,
    example: 'Requires Class-I registration and Rs 10 Cr turnover',
  },
]

export const SET_ASIDE_TOTAL = SET_ASIDE.reduce((sum, r) => sum + r.count, 0) // 120

/** The scan before this one, so the screen is never empty on first open. */
export const LAST_SCAN = {
  when: 'Yesterday, 06:00',
  read: 118,
  matched: 7,
  shortlisted: 2,
}

export const SCAN_DATE = '6 Aug 2026'
