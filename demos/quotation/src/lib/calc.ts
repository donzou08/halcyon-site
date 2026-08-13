import {
  FT_PER_M,
  SQFT_PER_SQM,
  type AppConfig,
  type ComputedQuote,
  type QuoteInput,
  type QuoteLine,
} from '../types'
import { gstModeForState } from './gst'

const round2 = (n: number) => Math.round((n || 0) * 100) / 100

/**
 * The quotation engine.
 *
 * Every line is `amount = qty × rate`:
 *  - Flooring systems — `qtySqm × ratePerSqm`. Rates are stored canonically per
 *    square metre, but qty and rate are *displayed* in the quote's chosen unit
 *    so that Qty × Rate on the printed page multiplies out exactly. The amount
 *    is identical either way.
 *  - Filler — kg × rate. Included even at qty 0, so the rate still prints.
 *  - Line marking — length × rate. Stored per foot, shown per ft or per metre.
 *
 * Two conventions worth keeping:
 *  1. The Basic Amount (subtotal) is rounded to the whole rupee *before* GST is
 *     applied, so the tax figures always reconcile against the printed basic.
 *  2. Rounding the grand total to a ₹step produces an explicit "Round Off"
 *     line rather than silently adjusting the total.
 */
export function computeQuote(input: QuoteInput, config: AppConfig): ComputedQuote {
  const areaUnit = input.areaUnit
  const sqUom = areaUnit === 'sqft' ? 'Sq.ft' : 'Sq.m'
  const lines: QuoteLine[] = []
  let sno = 1

  const rc = input.rounding ?? config.rounding ?? { decimals: 2, step: 0 }
  const dp = Number.isFinite(rc.decimals) ? Math.max(0, Math.min(2, rc.decimals)) : 2
  const step = Number.isFinite(rc.step) && rc.step > 0 ? rc.step : 0
  const pow = 10 ** dp
  const roundN = (n: number) => Math.round((n || 0) * pow) / pow

  // Flooring systems
  for (const sys of input.systems) {
    const amount = roundN(sys.qtySqm * sys.ratePerSqm)
    const qty = areaUnit === 'sqft' ? round2(sys.qtySqm * SQFT_PER_SQM) : round2(sys.qtySqm)
    const rate = areaUnit === 'sqft' ? round2(sys.ratePerSqm / SQFT_PER_SQM) : round2(sys.ratePerSqm)
    lines.push({
      sno: sno++,
      description: `Supply & Application charges for ${sys.name}`,
      detail: sys.thicknessMm ? `Thickness: ${sys.thicknessMm} mm` : undefined,
      qty,
      uom: sqUom,
      rate,
      amount,
    })
  }

  // Filling material for undulations & potholes. Shows even when qty is 0.
  if (input.fillerEnabled) {
    const qty = Math.max(0, input.fillerKg || 0)
    lines.push({
      sno: sno++,
      description: `Supply & Application charges for ${config.filler.name}`,
      qty,
      uom: 'Kgs',
      rate: input.fillerRate,
      amount: roundN(qty * input.fillerRate),
    })
  }

  // Safety line marking. Rate is stored per running foot; feet contained in one
  // display unit keeps the amount identical when the unit is switched.
  if (input.lineMarkingEnabled) {
    const width = config.lineWidths.find((w) => w.id === input.lineWidthId)
    const ftPerUnit = input.lineUnit === 'm' ? FT_PER_M : 1
    const uom = input.lineUnit === 'm' ? 'R.m' : 'R.Ft'
    const rate = round2(input.lineRatePerFoot * ftPerUnit)
    const qty = Math.max(0, input.lineLength || 0)
    lines.push({
      sno: sno++,
      description: `Safety line marking${width ? ` (${width.label})` : ''}`,
      qty,
      uom,
      rate,
      amount: roundN(qty * rate),
    })
  }

  // Basic Amount — rounded to the nearest whole rupee. GST is computed on this.
  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.amount, 0))
  const gstMode = gstModeForState(input.customer.state)

  const cgstRate = gstMode === 'intra' ? config.cgstRate : 0
  const sgstRate = gstMode === 'intra' ? config.sgstRate : 0
  const igstRate = gstMode === 'inter' ? config.igstRate : 0
  const cgstAmount = roundN(subtotal * cgstRate)
  const sgstAmount = roundN(subtotal * sgstRate)
  const igstAmount = roundN(subtotal * igstRate)
  const gstTotal = roundN(cgstAmount + sgstAmount + igstAmount)
  const grandTotal = roundN(subtotal + gstTotal)

  // Round-off adjustment on the final total (half-up to the nearest ₹step).
  const totalPayable = step > 0 ? Math.round(grandTotal / step) * step : grandTotal
  const roundOff = roundN(totalPayable - grandTotal)

  return {
    lines,
    areaUnit,
    subtotal,
    gstMode,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    gstTotal,
    grandTotal,
    decimals: dp,
    roundStep: step,
    roundOff,
    totalPayable,
  }
}
