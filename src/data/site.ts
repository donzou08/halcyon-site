/**
 * Everything the marketing pages say, in one place.
 *
 * Two gates apply to this file and neither is a preference:
 *
 * 1. **Figures come from `halcyon-studio/brand/proof-ledger.md`, verbatim.** Not
 *    rounded, not extrapolated, never turned into a percentage ("an hour to
 *    under a minute", never "98% faster"). A number that cannot be defended in a
 *    meeting costs more than every number that can.
 * 2. **No invented clients, testimonials or outcomes.** Halcyon has one client.
 *    Saying so plainly reads better than implying more, because a visitor who
 *    works out for themselves that a claim was padded will not call.
 *
 * House style: no em dashes; "we", not "I", except where Sanjith personally does
 * the thing; never the word "free"; never lead with AI.
 */

export const CONTACT = {
  founder: 'Sanjith Dhandapani',
  role: 'Founder, Halcyon',
  email: 'sanjith@halcyon.uno',
  /**
   * Shown as a tel: link when set, and omitted from every surface when empty.
   * Left empty rather than filled with a plausible-looking number, because a
   * wrong number on a live site sends enquiries to a stranger.
   *
   * Format it as it should read, for example '+91 98765 43210'.
   */
  phone: '',
  address: {
    line: 'Plot No. 2041, 15th Main Road, H Block',
    area: 'Anna Nagar West',
    city: 'Chennai',
    postcode: '600040',
  },
  responseTime: 'Personally, within 24 hours.',
} as const

/** True when there is a real number to show. Drives whether the phone line renders. */
export const HAS_PHONE = CONTACT.phone.trim().length > 0

/** Digits only, for the tel: href. */
export const PHONE_HREF = `tel:${CONTACT.phone.replace(/[^\d+]/g, '')}`

/* ------------------------------------------------------------------ *
 * The one client, stated plainly.
 * ------------------------------------------------------------------ */

export const CLIENT = {
  name: 'Swathi Engineering Agencies',
  trade: 'Industrial flooring and coatings',
  systems: 3,
} as const

export interface ProductionSystem {
  name: string
  status: 'Live' | 'In progress'
  /** Which catalogue system this corresponds to, so the two halves of the site agree. */
  slug: string
  summary: string
  figures: { value: string; label: string }[]
}

/**
 * The real deployments. These name the actual client, because on this half of
 * the site that is the claim being made. The demonstrations under /works wear an
 * invented client instead, which is the same honesty from the other direction:
 * a public rebuild must not carry a real customer's data.
 */
export const PRODUCTION: ProductionSystem[] = [
  {
    name: 'Field Supervisor',
    status: 'Live',
    slug: 'supervisor',
    summary:
      'Every check-in is GPS and time stamped, and every completed job produces a progress report without anyone writing one.',
    figures: [
      { value: '28', label: 'team members active' },
      { value: '23', label: 'sites tracked live' },
      { value: '100%', label: 'GPS verified' },
    ],
  },
  {
    name: 'Quotation Engine',
    status: 'Live',
    slug: 'quotation',
    summary:
      'What used to route through two people and take an hour is now one pass, ending in a ready-to-send PDF.',
    figures: [
      { value: 'Under 1 min', label: 'per quotation' },
      { value: '40+', label: 'products priced' },
      { value: '8', label: 'application categories' },
    ],
  },
  {
    name: 'Tender Intelligence',
    status: 'In progress',
    slug: 'tender',
    summary:
      'Nine government procurement sources read in one pass, four of them behind a CAPTCHA, ranked by whether the job is worth bidding.',
    figures: [
      { value: '5 min', label: 'per scan, from 5 hours' },
      { value: '129', label: 'tenders surfaced in a scan' },
      { value: '9', label: 'sources ranked by fit' },
    ],
  },
]

/* ------------------------------------------------------------------ *
 * How the work happens.
 * ------------------------------------------------------------------ */

export interface Step {
  n: string
  title: string
  body: string
}

export const HOW: Step[] = [
  {
    n: '01',
    title: 'We meet',
    body: 'In person where we can reach you, over a call where we cannot. The conversation is about how work actually moves through your business, including the parts held together by one person who knows where everything is.',
  },
  {
    n: '02',
    title: 'We map',
    body: 'Your operation written down as it runs, not as the org chart says it runs. Every point where information is retyped, waited on, or lost. You get this whether or not you go ahead.',
  },
  {
    n: '03',
    title: 'We build',
    body: 'One system at a time, shaped around your working method rather than a template. You see it running early and often, and you tell us where it is wrong while it is cheap to change.',
  },
  {
    n: '04',
    title: 'We stay',
    body: 'Delivery is not the end of it. Monthly improvements, same-day support, and running costs included in the retainer. Software that nobody maintains stops being used within a year.',
  },
]

export interface Capability {
  title: string
  body: string
}

export const CAPABILITIES: Capability[] = [
  {
    title: 'Built for one business',
    body: 'Every system starts from your rate card, your stages, your approvals and your paperwork. Nothing here is configured from a template, which is why it fits and why your people use it.',
  },
  {
    title: 'It replaces work, not tools',
    body: 'The measure is not features. It is whether a job that took an hour now takes a minute, and whether the owner can answer a question without ringing four people.',
  },
  {
    title: 'You own what we build',
    body: 'The code, the data and the accounts are yours. There is no per-seat licence that grows with your headcount and no platform you cannot leave.',
  },
]

/* ------------------------------------------------------------------ *
 * Engagements.
 * ------------------------------------------------------------------ */

export interface Tier {
  name: string
  forWhom: string
  scope: string
  setup: string
  monthly: string
  includes: string[]
  support: string
}

export const TIERS: Tier[] = [
  {
    name: 'Starter',
    forWhom: 'A small business with one problem worth solving',
    scope: 'One custom automation or workflow',
    setup: '₹15,000 to 40,000',
    monthly: '₹8,000',
    includes: ['One system, built and delivered', 'Monthly improvements', 'API usage to a baseline'],
    support: 'Email support',
  },
  {
    name: 'Growth',
    forWhom: 'An active operation with several workflows to fix',
    scope: 'Three systems built over time',
    setup: '₹60,000 to 1,20,000',
    monthly: '₹15,000 to 20,000',
    includes: ['Three systems, sequenced', 'Monthly improvements', 'API usage to a baseline'],
    support: 'WhatsApp support',
  },
  {
    name: 'Partner',
    forWhom: 'A serious operation that wants building capacity on hand',
    scope: 'Continuous build and strategy',
    setup: 'Quoted per project',
    monthly: '₹25,000 to 35,000',
    includes: ['Unlimited within scope', 'Monthly improvements', 'API usage to a baseline'],
    support: 'Dedicated line and a monthly call',
  },
]

export const TIER_NOTE =
  'Every new application is scoped and quoted separately. A discovery session is included at no cost, and the map it produces is yours whether or not you go ahead.'

/* ------------------------------------------------------------------ *
 * Reach.
 * ------------------------------------------------------------------ */

export const REACH =
  'In person across Chennai and Tamil Nadu, and over a call anywhere in India.'
