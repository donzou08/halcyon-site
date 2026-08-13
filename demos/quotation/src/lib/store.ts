/**
 * Demo persistence.
 *
 * There is no backend and no database. Quotes live in memory for the session
 * and are mirrored into localStorage so a refresh mid-meeting doesn't lose the
 * quote you just generated. `resetDemo()` puts everything back to the seed.
 */

import type { SavedQuote } from '../types'
import { buildSeedQuotes } from '../data/seedQuotes'
import { NEXT_SERIAL_NUMBER } from '../data/seed'

const QUOTES_KEY = 'meridian.demo.quotes.v1'
const SERIAL_KEY = 'meridian.demo.serial.v1'
const SEEDED_KEY = 'meridian.demo.seededOn.v1'

/** Local calendar date, yyyy-mm-dd. Never UTC — that flips the day at 5:30am IST. */
function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private browsing / quota — the demo still works from memory */
  }
}

let quotes: SavedQuote[] | null = null

/**
 * The seeded history is dated relative to the day it was built — "2 days ago",
 * "6 days ago". Persisted to localStorage and reopened months later, the most
 * recent quote on record would be from last season, which makes a live demo look
 * abandoned. So the seed date is stored alongside it and the history is rebuilt
 * whenever the day has changed.
 *
 * Quotes generated during the session survive a refresh, which is what matters
 * mid-meeting; they are cleared the next day along with the rest of the seed.
 * The companion supervisor demo does the same thing, for the same reason.
 */
function ensureLoaded(): SavedQuote[] {
  if (quotes) return quotes
  const stored = read<SavedQuote[] | null>(QUOTES_KEY, null)
  const seededOn = read<string | null>(SEEDED_KEY, null)

  if (stored && stored.length && seededOn === localDate()) {
    quotes = stored
    return quotes
  }

  quotes = buildSeedQuotes()
  write(QUOTES_KEY, quotes)
  write(SEEDED_KEY, localDate())
  write(SERIAL_KEY, NEXT_SERIAL_NUMBER)
  return quotes
}

/** Newest first. */
export function listQuotes(): SavedQuote[] {
  return [...ensureLoaded()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function saveQuote(q: SavedQuote): void {
  const all = ensureLoaded()
  all.unshift(q)
  write(QUOTES_KEY, all)
}

/** Reserve the next quotation serial number for the financial year. */
export function nextSerialNumber(): number {
  // Runs the day-rollover check first, so a serial is never handed out against
  // a history that is about to be rebuilt underneath it.
  ensureLoaded()
  const n = read<number>(SERIAL_KEY, NEXT_SERIAL_NUMBER)
  write(SERIAL_KEY, n + 1)
  return n
}

/** Wipe session state and rebuild from the seed — handy between meetings. */
export function resetDemo(): void {
  try {
    localStorage.removeItem(QUOTES_KEY)
    localStorage.removeItem(SERIAL_KEY)
    localStorage.removeItem(SEEDED_KEY)
  } catch {
    /* ignore */
  }
  quotes = null
}
