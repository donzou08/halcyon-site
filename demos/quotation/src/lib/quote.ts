import type { AppConfig } from '../types'

/**
 * Serial numbers run per Indian financial year (April–March), which is how
 * quotation books are actually kept in India. "26-27" = FY starting April 2026.
 */
export function financialYear(d = new Date()): string {
  const startYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1
  const a = String(startYear % 100).padStart(2, '0')
  const b = String((startYear + 1) % 100).padStart(2, '0')
  return `${a}-${b}`
}

/** MIF/QTN/0042/26-27 */
export function buildSerial(config: AppConfig, n: number, d = new Date()): string {
  const prefix = (config.company.quotePrefix || 'MIF/QTN').trim().replace(/^\/+|\/+$/g, '')
  return `${prefix}/${String(n).padStart(4, '0')}/${financialYear(d)}`
}

/** "27 Jul 2026" */
export function formatDate(d = new Date()): string {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Format a yyyy-mm-dd string as "27 Jul 2026". */
export function displayDate(iso: string): string {
  const d = iso ? new Date(iso.length > 10 ? iso : iso + 'T00:00:00') : new Date()
  if (isNaN(d.getTime())) return iso
  return formatDate(d)
}

/** Add days to a date and format it — used for the validity line. */
export function addDays(d: Date, days: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}
