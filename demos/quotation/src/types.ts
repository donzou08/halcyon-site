// Domain types for the Meridian quotation demo.
//
// These mirror the shape of the production tool this demo recreates: a
// catalogue of flooring systems priced per square metre, a per-quote input
// object, and a fully computed quote that a PDF can be rendered from without
// re-deriving anything.

export type AreaUnit = 'sqm' | 'sqft'
export type LineUnit = 'ft' | 'm'
export type GstMode = 'intra' | 'inter'

export const SQFT_PER_SQM = 10.7639
export const FT_PER_M = 3.28084

// ---- Catalogue -------------------------------------------------------------

/** A complete flooring system priced at one all-in rate per square metre. */
export interface FlooringSystem {
  id: string
  name: string
  category: string
  ratePerSqm: number
  defaultThicknessMm?: number
  description?: string
}

/** Filling material for undulations & potholes — priced per kg. */
export interface Filler {
  name: string
  ratePerKg: number
}

/** A line-marking width option, priced per running foot. */
export interface LineWidth {
  id: string
  label: string
  ratePerFoot: number
}

export interface CompanyProfile {
  name: string
  tagline: string
  addressLines: string[]
  gstNumber: string
  sacCode: string
  phone: string
  email: string
  website: string
  signatoryName: string
  signatoryTitle: string
  quotePrefix: string
}

export interface BankDetails {
  accountName: string
  accountNumber: string
  bank: string
  branch: string
  ifsc: string
}

/**
 * How a quote's figures are rounded.
 * - `decimals` — display precision for qty / rate / amounts (0, 1 or 2).
 * - `step` — round the grand total to the nearest ₹step (0 = no rounding).
 */
export interface RoundingConfig {
  decimals: number
  step: number
}

/** The whole catalogue + company profile. In production this is team-shared. */
export interface AppConfig {
  company: CompanyProfile
  systems: FlooringSystem[]
  filler: Filler
  lineWidths: LineWidth[]
  /** GST fractions. Intra-state uses cgst+sgst; inter-state uses igst. */
  cgstRate: number
  sgstRate: number
  igstRate: number
  bankDetails: BankDetails
  warranty: string
  defaultSubject: string
  paymentTerms: string[]
  supportRequired: string[]
  validityDays: number
  rounding: RoundingConfig
}

// ---- Customers & sites -----------------------------------------------------

export interface Site {
  id: string
  customerId: string
  label: string
  address: string
  pincode: string
  state: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

export interface Customer {
  id: string
  code: string
  name: string
  address: string
  gstNumber: string
}

// ---- Quote input -----------------------------------------------------------

export interface CustomerDetails {
  customerId: string | null
  company: string
  companyAddress: string
  gstNumber: string
  siteId: string | null
  siteLabel: string
  siteAddress: string
  pincode: string
  state: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

/** A flooring system chosen for this quote, with its own qty/thickness/rate. */
export interface SelectedSystem {
  key: string
  systemId: string
  name: string
  thicknessMm: number
  ratePerSqm: number
  /** Canonical area for this system — always square metres. */
  qtySqm: number
}

/** Everything the wizard collects. */
export interface QuoteInput {
  customer: CustomerDetails
  preparedBy: string
  areaSqm: number
  areaUnit: AreaUnit
  systems: SelectedSystem[]
  fillerEnabled: boolean
  fillerKg: number
  fillerRate: number
  lineMarkingEnabled: boolean
  lineWidthId: string | null
  lineLength: number
  lineUnit: LineUnit
  lineRatePerFoot: number
  remarks: string
  rounding: RoundingConfig
}

// ---- Computed quote --------------------------------------------------------

export interface QuoteLine {
  sno: number
  description: string
  detail?: string
  qty: number
  uom: string
  rate: number
  amount: number
}

export interface ComputedQuote {
  lines: QuoteLine[]
  areaUnit: AreaUnit
  /** Basic Amount — rounded to the whole rupee before GST is applied. */
  subtotal: number
  gstMode: GstMode
  cgstRate: number
  cgstAmount: number
  sgstRate: number
  sgstAmount: number
  igstRate: number
  igstAmount: number
  gstTotal: number
  /** subtotal + gst, before the round-off adjustment. */
  grandTotal: number
  decimals: number
  roundStep: number
  /** totalPayable − grandTotal (±, 0 when no rounding). */
  roundOff: number
  totalPayable: number
}

export interface QuoteMeta {
  quoteNumber: string
  /** Display date, e.g. "10 Jul 2026". */
  date: string
  /**
   * The same date, machine-readable, so anything derived from it (the validity
   * window on the PDF) is measured from when the quote was raised rather than
   * from whenever it is reopened. Optional so snapshots saved before this
   * existed still render.
   */
  dateISO?: string
  subject: string
  customer: CustomerDetails
  remarks: string
  preparedByName: string
}

/** Self-contained snapshot so a saved quote re-renders exactly as it was sent. */
export interface QuoteSnapshot {
  config: AppConfig
  input: QuoteInput
  quote: ComputedQuote
  meta: QuoteMeta
}

/** A row in the Past Quotes list. */
export interface SavedQuote {
  id: string
  quoteNumber: string
  customerName: string
  siteLabel: string
  systemSummary: string
  createdByName: string
  subtotal: number
  grandTotal: number
  gstMode: GstMode
  status: 'Sent' | 'Won' | 'Pending' | 'Lost'
  createdAt: string
  data: QuoteSnapshot
}
