/**
 * ============================================================================
 *  DEMO DATA — 100% FICTIONAL
 * ============================================================================
 *
 * Every value in this file is invented for demonstration purposes. The company,
 * its customers, the people, the GSTINs, the phone numbers, the addresses and
 * all the rates are made up. Nothing here comes from any real business.
 *
 * "Meridian Industrial Flooring Pvt Ltd" is a fictional Chennai flooring
 * contractor used across both Halcyon portfolio demos so the two tell one
 * coherent story.
 *
 * The GSTIN below (33AAAAA0000A1Z5) is a deliberately obvious placeholder: the
 * 33 prefix is Tamil Nadu's real state code, the rest is filler.
 * ============================================================================
 */

import { SQFT_PER_SQM, type AppConfig, type Customer, type FlooringSystem, type Site } from '../types'

export const APP_NAME = 'Meridian Quotation'

/** Rate card figures are authored in ₹ per square foot (how the trade quotes),
 *  and stored canonically per square metre for the engine. */
const perSqFt = (rate: number) => Math.round(rate * SQFT_PER_SQM * 100) / 100

type SystemSpec = {
  id: string
  name: string
  category: string
  ratePerSqFt: number
  thicknessMm?: number
  description: string
}

/** Invented rate card. Category names are generic industry terms; every figure
 *  is fictional and chosen only to look plausible in a demo. */
const RATE_CARD: SystemSpec[] = [
  {
    id: 'epoxy-coat-300',
    name: '300 Micron Epoxy Coating',
    category: 'Epoxy',
    ratePerSqFt: 58,
    thicknessMm: 0.3,
    description: 'Two-coat roller-applied epoxy for light-traffic areas',
  },
  {
    id: 'epoxy-sl-2mm',
    name: '2mm Epoxy Self-Levelling Flooring',
    category: 'Epoxy',
    ratePerSqFt: 145,
    thicknessMm: 2,
    description: 'Seamless self-smoothing epoxy screed',
  },
  {
    id: 'epoxy-sl-3mm',
    name: '3mm Epoxy Self-Levelling Flooring',
    category: 'Epoxy',
    ratePerSqFt: 185,
    thicknessMm: 3,
    description: 'Heavier build for forklift traffic',
  },
  {
    id: 'epoxy-sl-5mm',
    name: '5mm Epoxy Self-Levelling Flooring',
    category: 'Epoxy',
    ratePerSqFt: 255,
    thicknessMm: 5,
    description: 'Heavy-duty build for impact-loaded bays',
  },
  {
    id: 'pu-concrete-6mm',
    name: '6mm PU Concrete Flooring',
    category: 'PU Concrete',
    ratePerSqFt: 310,
    thicknessMm: 6,
    description: 'Thermal-shock and chemical resistant, for wet process areas',
  },
  {
    id: 'esd-2mm',
    name: '2mm ESD (Anti-Static) Flooring',
    category: 'ESD',
    ratePerSqFt: 210,
    thicknessMm: 2,
    description: 'Conductive grid with earthing, for electronics and clean rooms',
  },
  {
    id: 'anti-skid-1mm',
    name: '1mm Anti-Skid Coating',
    category: 'Anti-Skid',
    ratePerSqFt: 95,
    thicknessMm: 1,
    description: 'Broadcast aggregate finish for ramps and wet zones',
  },
  {
    id: 'floor-hardener',
    name: 'Floor Hardener / Densifier',
    category: 'Densifier',
    ratePerSqFt: 42,
    description: 'Lithium silicate densifier with mechanical polish',
  },
]

export const DEFAULT_SYSTEMS: FlooringSystem[] = RATE_CARD.map((s) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  ratePerSqm: perSqFt(s.ratePerSqFt),
  description: s.description,
  ...(s.thicknessMm != null ? { defaultThicknessMm: s.thicknessMm } : {}),
}))

export const DEFAULT_CONFIG: AppConfig = {
  company: {
    name: 'Meridian Industrial Flooring Pvt Ltd',
    tagline: 'Industrial Epoxy · PU · Protective Flooring',
    addressLines: [
      'No. 14, Second Main Road, Industrial Estate',
      'Guindy, Chennai - 600032, Tamil Nadu',
    ],
    gstNumber: '33AAAAA0000A1Z5',
    sacCode: '995473',
    phone: '+91 90000 00010',
    email: 'projects@meridianflooring.example',
    website: 'meridianflooring.example',
    signatoryName: 'Ravi Meridian',
    signatoryTitle: 'Managing Director',
    quotePrefix: 'MIF/QTN',
  },
  systems: DEFAULT_SYSTEMS,
  filler: { name: 'Epoxy Filler Compound (undulations & potholes)', ratePerKg: 185 },
  lineWidths: [
    { id: 'w2', label: '2 inch', ratePerFoot: 22 },
    { id: 'w3', label: '3 inch', ratePerFoot: 28 },
    { id: 'w4', label: '4 inch', ratePerFoot: 35 },
  ],
  cgstRate: 0.09,
  sgstRate: 0.09,
  igstRate: 0.18,
  bankDetails: {
    accountName: 'Meridian Industrial Flooring Pvt Ltd',
    accountNumber: '0000 0000 0000',
    bank: 'Demo Bank of India',
    branch: 'Guindy, Chennai',
    ifsc: 'DEMO0000001',
  },
  warranty: 'Twelve (12) months from the date of handover against delamination and material defects, subject to the floor being used within the agreed loading and chemical exposure limits.',
  defaultSubject: 'Quotation for Industrial Flooring Work',
  paymentTerms: [
    '50% advance along with the Purchase Order.',
    '40% on receipt of material at site and before commencement of work.',
    '10% on completion and submission of bills.',
    'Purchase Order for materials and Work Order for application to be raised in the name of Meridian Industrial Flooring Pvt Ltd, Chennai.',
  ],
  supportRequired: [
    '24-hour working access to the application area.',
    'Water and electricity free of cost at site.',
    'Secure covered space to store our materials at site.',
    'Area to be coated must be barricaded and free of traffic during and after application.',
    'No dust-generating or water-splashing work in adjacent areas while the coating is wet.',
    'All machinery and equipment in the area to be protected and covered by the client.',
  ],
  validityDays: 30,
  rounding: { decimals: 2, step: 0 },
}

// ---- Fictional customers & sites -------------------------------------------

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'cust-orion',
    code: 'MIF/C/0001',
    name: 'Orion Auto Components Pvt Ltd',
    address: 'Plot 22, Ambattur Industrial Estate, Chennai - 600058',
    gstNumber: '33BBBBB1111B1Z4',
  },
  {
    id: 'cust-sunrise',
    code: 'MIF/C/0002',
    name: 'Sunrise Pharma Industries',
    address: 'Survey No. 118, SIPCOT Phase II, Sriperumbudur - 602105',
    gstNumber: '33CCCCC2222C1Z3',
  },
  {
    id: 'cust-coastal',
    code: 'MIF/C/0003',
    name: 'Coastal Cold Storage Ltd',
    address: 'Kamarajar Port Road, Ennore, Chennai - 600057',
    gstNumber: '33DDDDD3333D1Z2',
  },
  {
    id: 'cust-bluewave',
    code: 'MIF/C/0004',
    name: 'Bluewave Electronics Manufacturing',
    address: 'Oragadam Industrial Corridor, Kancheepuram - 602105',
    gstNumber: '33EEEEE4444E1Z1',
  },
]

/**
 * Bluewave has a second site in Andhra Pradesh. That is deliberate: it lets the
 * demo show the CGST+SGST → IGST switch happening live when the site changes,
 * without inventing another customer.
 */
export const DEMO_SITES: Site[] = [
  {
    id: 'site-orion-ambattur',
    customerId: 'cust-orion',
    label: 'Ambattur, Machine Shop',
    address: 'Plot 22, Ambattur Industrial Estate, Chennai',
    pincode: '600058',
    state: 'Tamil Nadu',
    contactName: 'Mr. G. Sekar',
    contactPhone: '+91 90000 00021',
    contactEmail: 'sekar@orionauto.example',
  },
  {
    id: 'site-sunrise-sipcot',
    customerId: 'cust-sunrise',
    label: 'Sriperumbudur, Formulation Block',
    address: 'Survey No. 118, SIPCOT Phase II, Sriperumbudur',
    pincode: '602105',
    state: 'Tamil Nadu',
    contactName: 'Ms. L. Priya',
    contactPhone: '+91 90000 00022',
    contactEmail: 'priya@sunrisepharma.example',
  },
  {
    id: 'site-coastal-ennore',
    customerId: 'cust-coastal',
    label: 'Ennore, Cold Store 2',
    address: 'Kamarajar Port Road, Ennore, Chennai',
    pincode: '600057',
    state: 'Tamil Nadu',
    contactName: 'Mr. D. Ramesh',
    contactPhone: '+91 90000 00023',
    contactEmail: 'ramesh@coastalcold.example',
  },
  {
    id: 'site-bluewave-oragadam',
    customerId: 'cust-bluewave',
    label: 'Oragadam, SMT Line',
    address: 'Oragadam Industrial Corridor, Kancheepuram',
    pincode: '602105',
    state: 'Tamil Nadu',
    contactName: 'Mr. S. Vinoth',
    contactPhone: '+91 90000 00024',
    contactEmail: 'vinoth@bluewave.example',
  },
  {
    id: 'site-bluewave-sricity',
    customerId: 'cust-bluewave',
    label: 'Sri City, New Plant (Andhra Pradesh)',
    address: 'Sri City SEZ, Tada, Tirupati District',
    pincode: '517646',
    state: 'Andhra Pradesh',
    contactName: 'Mr. S. Vinoth',
    contactPhone: '+91 90000 00024',
    contactEmail: 'vinoth@bluewave.example',
  },
]

/** Fictional team. Ravi is the owner; the other two are sales reps. */
export const DEMO_USERS = [
  { id: 'u-ravi', name: 'Ravi Meridian', role: 'owner' as const, title: 'Managing Director' },
  { id: 'u-sales', name: 'N. Bhaskar', role: 'sales' as const, title: 'Sales Executive' },
]

/** Next serial the demo will hand out. Seeded history occupies 0038–0042. */
export const NEXT_SERIAL_NUMBER = 43
