// Date, time and duration helpers. India-first formatting throughout.

export function timeOf(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function shortDate(iso: string): string {
  const d = new Date(iso.length > 10 ? iso : iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** "2h 24m" — how long between two instants. */
export function durationBetween(from: string, to: string): string {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  if (!isFinite(ms) || ms < 0) return '—'
  const mins = Math.floor(ms / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export function sqm(n: number): string {
  return `${n.toLocaleString('en-IN')} sqm`
}
