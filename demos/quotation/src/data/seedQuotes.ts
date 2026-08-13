/**
 * Pre-seeded quote history — all fictional.
 *
 * Rather than hand-writing totals (which drift out of sync the moment the rate
 * card changes), each row is described compactly and then run through the real
 * `computeQuote` engine. The history is therefore always arithmetically
 * consistent with the catalogue, and "View" on a past quote re-renders a real
 * snapshot instead of a stub.
 */

import type { QuoteInput, QuoteSnapshot, SavedQuote } from '../types'
import { computeQuote } from '../lib/calc'
import { buildSerial } from '../lib/quote'
import { DEFAULT_CONFIG, DEMO_CUSTOMERS, DEMO_SITES } from './seed'

interface SeedSpec {
  serialNo: number
  siteId: string
  daysAgo: number
  areaSqft: number
  systemIds: string[]
  fillerKg?: number
  lineFt?: number
  status: SavedQuote['status']
  preparedBy: string
}

const SEEDS: SeedSpec[] = [
  {
    serialNo: 42,
    siteId: 'site-orion-ambattur',
    daysAgo: 2,
    areaSqft: 18000,
    systemIds: ['epoxy-sl-3mm'],
    fillerKg: 400,
    lineFt: 900,
    status: 'Sent',
    preparedBy: 'Ravi Meridian',
  },
  {
    serialNo: 41,
    siteId: 'site-sunrise-sipcot',
    daysAgo: 6,
    areaSqft: 9500,
    systemIds: ['pu-concrete-6mm'],
    status: 'Won',
    preparedBy: 'N. Bhaskar',
  },
  {
    serialNo: 40,
    siteId: 'site-bluewave-oragadam',
    daysAgo: 11,
    areaSqft: 12400,
    systemIds: ['esd-2mm'],
    lineFt: 640,
    status: 'Pending',
    preparedBy: 'N. Bhaskar',
  },
  {
    serialNo: 39,
    siteId: 'site-coastal-ennore',
    daysAgo: 18,
    areaSqft: 22000,
    systemIds: ['pu-concrete-6mm', 'anti-skid-1mm'],
    fillerKg: 750,
    status: 'Won',
    preparedBy: 'Ravi Meridian',
  },
  {
    serialNo: 38,
    siteId: 'site-bluewave-sricity',
    daysAgo: 25,
    areaSqft: 31000,
    systemIds: ['epoxy-sl-5mm'],
    fillerKg: 1200,
    lineFt: 1500,
    status: 'Lost',
    preparedBy: 'N. Bhaskar',
  },
]

const SQFT_TO_SQM = 1 / 10.7639

function buildSnapshot(spec: SeedSpec, date: Date): QuoteSnapshot {
  const site = DEMO_SITES.find((s) => s.id === spec.siteId)!
  const customer = DEMO_CUSTOMERS.find((c) => c.id === site.customerId)!
  const areaSqm = spec.areaSqft * SQFT_TO_SQM

  const input: QuoteInput = {
    customer: {
      customerId: customer.id,
      company: customer.name,
      companyAddress: customer.address,
      gstNumber: customer.gstNumber,
      siteId: site.id,
      siteLabel: site.label,
      siteAddress: site.address,
      pincode: site.pincode,
      state: site.state,
      contactName: site.contactName,
      contactPhone: site.contactPhone,
      contactEmail: site.contactEmail,
    },
    preparedBy: spec.preparedBy,
    areaSqm,
    areaUnit: 'sqft',
    systems: spec.systemIds.map((id, i) => {
      const sys = DEFAULT_CONFIG.systems.find((s) => s.id === id)!
      return {
        key: `seed-${spec.serialNo}-${i}`,
        systemId: sys.id,
        name: sys.name,
        thicknessMm: sys.defaultThicknessMm ?? 0,
        ratePerSqm: sys.ratePerSqm,
        qtySqm: areaSqm,
      }
    }),
    fillerEnabled: spec.fillerKg != null,
    fillerKg: spec.fillerKg ?? 0,
    fillerRate: DEFAULT_CONFIG.filler.ratePerKg,
    lineMarkingEnabled: spec.lineFt != null,
    lineWidthId: 'w4',
    lineLength: spec.lineFt ?? 0,
    lineUnit: 'ft',
    lineRatePerFoot: DEFAULT_CONFIG.lineWidths.find((w) => w.id === 'w4')!.ratePerFoot,
    remarks: '',
    rounding: DEFAULT_CONFIG.rounding,
  }

  const quote = computeQuote(input, DEFAULT_CONFIG)

  return {
    config: DEFAULT_CONFIG,
    input,
    quote,
    meta: {
      quoteNumber: buildSerial(DEFAULT_CONFIG, spec.serialNo, date),
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dateISO: date.toISOString(),
      subject: DEFAULT_CONFIG.defaultSubject,
      customer: input.customer,
      remarks: '',
      preparedByName: spec.preparedBy,
    },
  }
}

/** Build the seeded history relative to today, so the dates always look fresh. */
export function buildSeedQuotes(now = new Date()): SavedQuote[] {
  return SEEDS.map((spec) => {
    const date = new Date(now)
    date.setDate(date.getDate() - spec.daysAgo)
    const data = buildSnapshot(spec, date)
    return {
      id: `seed-${spec.serialNo}`,
      quoteNumber: data.meta.quoteNumber,
      customerName: data.input.customer.company,
      siteLabel: data.input.customer.siteLabel,
      systemSummary: data.input.systems.map((s) => s.name).join(' + '),
      createdByName: spec.preparedBy,
      subtotal: data.quote.subtotal,
      grandTotal: data.quote.totalPayable,
      gstMode: data.quote.gstMode,
      status: spec.status,
      createdAt: date.toISOString(),
      data,
    }
  })
}
