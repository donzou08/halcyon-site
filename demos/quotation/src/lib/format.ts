// Indian-format currency & number helpers.

const inrCache = new Map<number, Intl.NumberFormat>()
function inrFmt(digits: number): Intl.NumberFormat {
  let f = inrCache.get(digits)
  if (!f) {
    f = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
    inrCache.set(digits, f)
  }
  return f
}

const qtyCache = new Map<number, Intl.NumberFormat>()
function qtyFmt(digits: number): Intl.NumberFormat {
  let f = qtyCache.get(digits)
  if (!f) {
    f = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
    qtyCache.set(digits, f)
  }
  return f
}

const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** ₹1,23,456.78 — Indian digit grouping, `digits` decimals (default 2). */
export function formatINR(value: number, digits = 2): string {
  if (!isFinite(value)) return '₹0'
  return inrFmt(digits).format(value)
}

/** ₹1,23,457 — rounded, for headline totals. */
export function formatINRWhole(value: number): string {
  if (!isFinite(value)) return '₹0'
  return inrWhole.format(value)
}

/** Quantity with Indian grouping: 12,000.00 */
export function formatQty(value: number, digits = 2): string {
  if (!isFinite(value)) return (0).toFixed(digits)
  return qtyFmt(digits).format(value)
}
