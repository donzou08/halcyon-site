import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer'
import type { AppConfig, ComputedQuote, QuoteMeta } from '../types'
import { addDays, formatDate } from './quote'

/**
 * The quotation PDF.
 *
 * Rendered client-side with @react-pdf/renderer — no server, no print dialog.
 * The letterhead is drawn as vector type and rules rather than a bitmap, so the
 * document stays crisp, small, and has no asset pipeline behind it.
 *
 * The layout follows the shape of a real Indian industrial quotation letter:
 * letterhead → reference/date → addressee → subject → itemised cost table with
 * the GST split → terms → payment terms → support required → signature block.
 */

/** Indian digit grouping, no currency symbol: 1,05,73,072.58 */
function inr(n: number, digits = 2): string {
  const neg = n < 0
  n = Math.abs(n || 0)
  const parts = n.toFixed(digits).split('.')
  let last3 = parts[0].slice(-3)
  let rest = parts[0].slice(0, -3)
  if (rest) last3 = ',' + last3
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  const dec = parts[1] ? '.' + parts[1] : ''
  return (neg ? '-' : '') + rest + last3 + dec
}

const uomLabel = (u: string) => (u === 'Sq.m' ? 'M2' : u)
const letter = (i: number) => String.fromCharCode(65 + i)

const BRAND = '#0f4785'
const MUTED = '#5b6572'
const RULE = '#c9d2dc'

// A4 content width: 595 - 40 left - 40 right = 515pt. Columns sum to 514; the
// table's own 1pt left border makes it exactly 515.
const COL = { sno: 28, desc: 224, qty: 62, unit: 38, rate: 74, amt: 88 }

const s = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 72,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#101720',
    lineHeight: 1.35,
  },

  // Letterhead
  lhWrap: { borderBottomWidth: 2, borderBottomColor: BRAND, paddingBottom: 8, marginBottom: 4 },
  lhRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  lhName: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: BRAND, letterSpacing: 0.2 },
  lhTag: { fontSize: 8, color: MUTED, marginTop: 2, letterSpacing: 1.1, textTransform: 'uppercase' },
  lhRight: { textAlign: 'right', fontSize: 8, color: MUTED, lineHeight: 1.5 },
  lhBar: { height: 2, backgroundColor: BRAND, marginTop: 6 },
  lhAddr: { fontSize: 8, color: MUTED, marginTop: 5 },

  // Demo notice — this document must never be mistaken for a real quotation.
  demo: {
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d9a300',
    backgroundColor: '#fff9e6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 7.5,
    color: '#7a5c00',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  refrow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bold: { fontFamily: 'Helvetica-Bold' },
  line: { marginBottom: 1 },
  attn: { marginTop: 8 },
  subject: { marginTop: 10, marginBottom: 8 },
  subjectText: { fontFamily: 'Helvetica-Bold', textDecoration: 'underline' },
  para: { marginBottom: 7, textAlign: 'justify' },

  hcost: { fontFamily: 'Helvetica-Bold', textDecoration: 'underline', marginTop: 8, marginBottom: 5 },
  proj: { textAlign: 'center', fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  projSmall: { textAlign: 'center', fontSize: 8.5, color: MUTED, marginBottom: 1 },

  table: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: RULE, marginTop: 8, marginBottom: 12 },
  row: { flexDirection: 'row' },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: RULE,
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontSize: 8.5,
  },
  th: {
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    backgroundColor: '#eef3f9',
    color: BRAND,
    fontSize: 8,
    letterSpacing: 0.3,
  },
  itemTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8.5 },
  detail: { fontSize: 7.5, color: MUTED, marginTop: 1 },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  totLabel: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: RULE,
    paddingVertical: 4,
    paddingHorizontal: 5,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
  },
  grandRow: { backgroundColor: '#eef3f9' },

  blk: {
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    fontSize: 9.5,
    letterSpacing: 0.4,
    marginTop: 12,
    marginBottom: 4,
  },
  subhead: { fontFamily: 'Helvetica-Bold', marginTop: 9, marginBottom: 2 },
  li: { flexDirection: 'row', marginBottom: 2 },
  bullet: { width: 13 },
  liText: { flex: 1, textAlign: 'justify' },
  // Standalone paragraph. Must NOT reuse `liText`: its `flex: 1` is meant for a
  // row child, and outside a row it sizes the box to one line, so anything that
  // wraps spills over the heading below it.
  paraBlock: { textAlign: 'justify' },

  sign: { marginTop: 22 },
  signName: { fontFamily: 'Helvetica-Bold', marginTop: 26 },

  // Footer.
  // Every footer element is an absolutely-positioned DIRECT child of Page.
  // Nesting them inside a wrapper View silently breaks layout, and a `render`
  // callback is never evaluated unless its own Text also carries `fixed`.
  footRule: { position: 'absolute', bottom: 52, left: 40, right: 40, borderTopWidth: 1, borderTopColor: RULE },
  footText: { position: 'absolute', bottom: 40, left: 40, right: 40, fontSize: 7, color: '#888480', textAlign: 'center' },
  footDemo: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 7, color: '#a9852c', textAlign: 'center' },
  // The builder's mark: the smallest, quietest thing on the page.
  footHalcyon: { position: 'absolute', bottom: 20, left: 40, right: 40, fontSize: 6.5, color: '#888480', textAlign: 'center' },
})

function Bullet({ children, marker = '•' }: { children: React.ReactNode; marker?: string }) {
  return (
    <View style={s.li}>
      <Text style={s.bullet}>{marker}</Text>
      <Text style={s.liText}>{children}</Text>
    </View>
  )
}

function TotalsRow({ label, value, grand }: { label: string; value: string; grand?: boolean }) {
  const w = COL.sno + COL.desc + COL.qty + COL.unit + COL.rate
  return (
    <View style={grand ? [s.row, s.grandRow] : s.row}>
      <Text style={[s.totLabel, { width: w }]}>{label}</Text>
      <Text style={[s.cell, s.right, s.bold, { width: COL.amt }]}>{value}</Text>
    </View>
  )
}

export function QuoteDocument({
  config,
  quote,
  meta,
}: {
  config: AppConfig
  quote: ComputedQuote
  meta: QuoteMeta
}) {
  const c = config.company
  const cust = meta.customer
  const intra = quote.gstMode === 'intra'
  const cgstPct = Math.round(config.cgstRate * 100)
  const sgstPct = Math.round(config.sgstRate * 100)
  const igstPct = Math.round(config.igstRate * 100)

  const dp = Number.isFinite(quote.decimals) ? quote.decimals : 2
  const money = (n: number) => inr(n, dp)

  const companyName = /^m\/s\.?/i.test(cust.company) ? cust.company : `M/s. ${cust.company}`
  // Measured from the quote's own date, not from when the PDF is opened —
  // otherwise reprinting an old quote silently extends its validity.
  const raisedOn = meta.dateISO ? new Date(meta.dateISO) : new Date()
  const validUntil = formatDate(addDays(raisedOn, config.validityDays))

  const taxNote = intra
    ? `Rates quoted for material and application are exclusive of CGST @ ${cgstPct}% and SGST @ ${sgstPct}% on the basic value.`
    : `Rates quoted for material and application are exclusive of IGST @ ${igstPct}% on the basic value.`

  return (
    <Document title={`Quotation ${meta.quoteNumber} (Demo)`} author={c.name}>
      <Page size="A4" style={s.page}>
        {/* ---- Letterhead ---- */}
        <View style={s.lhWrap}>
          <View style={s.lhRow}>
            <View>
              <Text style={s.lhName}>{c.name}</Text>
              <Text style={s.lhTag}>{c.tagline}</Text>
            </View>
            <View style={s.lhRight}>
              <Text>{c.phone}</Text>
              <Text>{c.email}</Text>
              <Text>GSTIN: {c.gstNumber}</Text>
            </View>
          </View>
          <Text style={s.lhAddr}>{c.addressLines.join(' · ')}</Text>
        </View>

        <Text style={s.demo}>
          DEMONSTRATION DOCUMENT — SAMPLE DATA ONLY. Meridian Industrial Flooring and every party,
          figure and identifier below are fictional. This is not a real quotation.
        </Text>

        {/* ---- Reference & date ---- */}
        <View style={s.refrow}>
          <Text style={s.bold}>{meta.quoteNumber}</Text>
          <Text>{meta.date}</Text>
        </View>

        {/* ---- Addressee ---- */}
        <View>
          <Text style={[s.line, s.bold]}>{companyName}</Text>
          {cust.companyAddress ? <Text style={s.line}>{cust.companyAddress}</Text> : null}
          {cust.siteAddress ? <Text style={s.line}>Site Address:- {cust.siteAddress}</Text> : null}
          {cust.gstNumber ? <Text style={s.line}>GSTIN: {cust.gstNumber}</Text> : null}
          {cust.contactPhone ? <Text style={s.line}>Mobile: {cust.contactPhone}</Text> : null}
          {cust.contactEmail ? <Text style={s.line}>Email: {cust.contactEmail}</Text> : null}
        </View>
        {cust.contactName ? <Text style={s.attn}>Kind Attn.: {cust.contactName}</Text> : null}

        <Text style={s.subject}>
          Sub:- <Text style={s.subjectText}>{meta.subject}</Text>
        </Text>
        <Text style={s.para}>Dear Sir / Madam,</Text>
        <Text style={s.para}>
          With reference to the discussion our representative had with you, we are pleased to submit
          our offer for the industrial flooring work at your premises, as detailed below.
        </Text>

        {/* ---- Cost table ---- */}
        <Text style={s.hcost}>COST DETAILS</Text>
        <Text style={s.proj}>
          {cust.company}
          {cust.siteLabel ? ` — ${cust.siteLabel}` : ''}
        </Text>
        <Text style={s.projSmall}>Industrial flooring work</Text>

        <View style={s.table}>
          <View style={s.row}>
            <Text style={[s.cell, s.th, { width: COL.sno }]}>S.No</Text>
            <Text style={[s.cell, s.th, { width: COL.desc }]}>DESCRIPTION</Text>
            <Text style={[s.cell, s.th, { width: COL.qty }]}>QTY</Text>
            <Text style={[s.cell, s.th, { width: COL.unit }]}>UNIT</Text>
            <Text style={[s.cell, s.th, { width: COL.rate }]}>RATE</Text>
            <Text style={[s.cell, s.th, { width: COL.amt }]}>AMOUNT</Text>
          </View>

          {quote.lines.map((l, i) => (
            <View style={s.row} key={l.sno}>
              <Text style={[s.cell, s.center, { width: COL.sno }]}>{letter(i)}</Text>
              <View style={[s.cell, { width: COL.desc }]}>
                <Text style={s.itemTitle}>{l.description}</Text>
                {l.detail ? <Text style={s.detail}>{l.detail}</Text> : null}
              </View>
              <Text style={[s.cell, s.right, { width: COL.qty }]}>{inr(l.qty, dp)}</Text>
              <Text style={[s.cell, s.center, { width: COL.unit }]}>{uomLabel(l.uom)}</Text>
              <Text style={[s.cell, s.right, { width: COL.rate }]}>{money(l.rate)}</Text>
              <Text style={[s.cell, s.right, { width: COL.amt }]}>{money(l.amount)}</Text>
            </View>
          ))}

          <TotalsRow label="Basic Amount" value={money(quote.subtotal)} />
          {intra ? (
            <>
              <TotalsRow label={`CGST @ ${cgstPct}%`} value={money(quote.cgstAmount)} />
              <TotalsRow label={`SGST @ ${sgstPct}%`} value={money(quote.sgstAmount)} />
            </>
          ) : (
            <TotalsRow label={`IGST @ ${igstPct}%`} value={money(quote.igstAmount)} />
          )}
          {quote.roundOff !== 0 ? (
            <TotalsRow
              label="Round Off"
              value={`${quote.roundOff > 0 ? '+' : '-'}${money(Math.abs(quote.roundOff))}`}
            />
          ) : null}
          <TotalsRow label="TOTAL PAYABLE" value={money(quote.totalPayable)} grand />
        </View>

        {meta.remarks ? (
          <Text style={s.para}>
            <Text style={s.bold}>Remarks: </Text>
            {meta.remarks}
          </Text>
        ) : null}

        {/* ---- Terms ---- */}
        <Text style={s.blk}>TERMS &amp; CONDITIONS</Text>
        <Bullet>{taxNote}</Bullet>
        <Bullet>
          Any change in government duties or taxes at the time of execution will be charged
          accordingly.
        </Bullet>
        <Bullet>Transportation to site is included in the quoted rates.</Bullet>
        <Bullet>Our GSTIN: {c.gstNumber}</Bullet>
        <Bullet>SAC Code: {c.sacCode}</Bullet>
        <Bullet>Delivery: within 7 days of receipt of the Purchase Order and advance.</Bullet>
        <Bullet>Execution: as per a schedule agreed mutually after order confirmation.</Bullet>
        <Bullet>
          Validity: {config.validityDays} days from the date of this offer (up to {validUntil}).
        </Bullet>

        <Text style={s.subhead}>Payment Terms</Text>
        {config.paymentTerms.map((p, i) => (
          <Bullet key={i}>{p}</Bullet>
        ))}

        <View wrap={false}>
          <Text style={s.subhead}>Warranty</Text>
          <Text style={s.paraBlock}>{config.warranty}</Text>
        </View>

        <Text style={s.subhead}>Support Required from the Client</Text>
        {config.supportRequired.map((sup, i) => (
          <Bullet key={i} marker={`${i + 1}.`}>
            {sup}
          </Bullet>
        ))}

        <View wrap={false} style={{ marginTop: 10 }}>
          <Text style={s.subhead}>Bank Details</Text>
          <Text>A/c Name: {config.bankDetails.accountName}</Text>
          <Text>A/c No: {config.bankDetails.accountNumber}</Text>
          <Text>
            Bank: {config.bankDetails.bank}, {config.bankDetails.branch}
          </Text>
          <Text>IFSC: {config.bankDetails.ifsc}</Text>
        </View>

        <Text style={{ marginTop: 12 }}>
          We look forward to receiving your valued order. Please let us know if you would like any
          part of this scope revised.
        </Text>
        <Text style={{ marginTop: 6 }}>Thanking you,</Text>

        <View style={s.sign} wrap={false}>
          <Text>Yours faithfully,</Text>
          <Text>For {c.name}</Text>
          <Text style={s.signName}>{meta.preparedByName || c.signatoryName}</Text>
          <Text style={{ fontSize: 8.5, color: MUTED }}>{c.signatoryTitle}</Text>
          <Text style={{ fontSize: 8.5, color: MUTED }}>{c.phone}</Text>
        </View>

        {/* ---- Footer: repeated on every page ----
            Static text on purpose. @react-pdf's dynamic `render` callback does
            not fire for a Text inside this document (verified against a minimal
            reproduction where it does), so a page "N of M" marker would silently
            render as nothing. A quotation letter reads fine without one. */}
        <View style={s.footRule} fixed />
        <Text style={s.footText} fixed>
          {c.name} · {c.website} · {c.phone}
        </Text>
        <Text style={s.footDemo} fixed>
          Demo document — sample data, not a real quotation.
        </Text>
        <Text style={s.footHalcyon} fixed>
          Powered by Halcyon
        </Text>
      </Page>
    </Document>
  )
}

export async function generateQuotePdfBlob(
  config: AppConfig,
  quote: ComputedQuote,
  meta: QuoteMeta,
): Promise<Blob> {
  return pdf(<QuoteDocument config={config} quote={quote} meta={meta} />).toBlob()
}
