/**
 * Every numeral in this application renders in DM Mono and in Western Arabic
 * digits, in all locales. Operators read counts off tally sheets and gauges in
 * Western digits, so the digits are never localised.
 */

const groupFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export function num(value: number): string {
  return groupFormatter.format(Math.round(value));
}

export function signed(value: number): string {
  if (value === 0) return '0';
  return value > 0 ? `+${num(value)}` : `-${num(Math.abs(value))}`;
}

/** Full rupee figure, Indian grouping. */
export function inr(value: number): string {
  return `₹${groupFormatter.format(Math.round(value))}`;
}

/** Short rupee figure for tight spaces. Lakh and crore, as the plant reads them. */
export function inrShort(value: number): string {
  const v = Math.abs(Math.round(value));
  const sign = value < 0 ? '-' : '';
  if (v >= 1_00_00_000) return `${sign}₹${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (v >= 1_00_000) return `${sign}₹${(v / 1_00_000).toFixed(2)} L`;
  if (v >= 1_000) return `${sign}₹${(v / 1_000).toFixed(1)} K`;
  return `${sign}₹${v}`;
}

export function pct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** YYYY-MM-DD to 04 Aug 2026. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
}

export function shortDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]}`;
}

/** ISO timestamp to 17:24, which is how a shift log reads it. */
export function clockOf(isoTimestamp: string): string {
  const t = isoTimestamp.slice(11, 16);
  return t || '00:00';
}

export function dayOfWeek(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

export function isSunday(iso: string): boolean {
  return dayOfWeek(iso) === 0;
}
