import { useSyncExternalStore } from 'react'

/**
 * Demo state. Everything lives in localStorage under one key so the showcase
 * shell can wipe it with a single prefix match, and so a visitor can close the
 * tab and come back to the tenders they shortlisted.
 */

const KEY = 'meridian.tender.demo.v1'

export type Verdict = 'shortlisted' | 'passed'

export interface Decision {
  verdict: Verdict
  /** Only set when the verdict is `passed`. */
  reason?: string
  at: string
}

export interface State {
  /** Set once the visitor has run a scan in this browser. */
  scanned: boolean
  decisions: Record<string, Decision>
}

const EMPTY: State = { scanned: false, decisions: {} }

function read(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<State>
    return { scanned: !!parsed.scanned, decisions: parsed.decisions ?? {} }
  } catch {
    return EMPTY
  }
}

let state: State = read()
const listeners = new Set<() => void>()

function commit(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private browsing, keep going in memory */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useDemoState(): State {
  return useSyncExternalStore(subscribe, () => state, () => state)
}

export function markScanned() {
  if (state.scanned) return
  commit({ ...state, scanned: true })
}

export function decide(id: string, verdict: Verdict, reason?: string) {
  commit({
    ...state,
    decisions: {
      ...state.decisions,
      [id]: { verdict, reason, at: new Date().toISOString() },
    },
  })
}

export function undecide(id: string) {
  const next = { ...state.decisions }
  delete next[id]
  commit({ ...state, decisions: next })
}

export function resetDemo() {
  commit(EMPTY)
}

/** Reasons an owner actually gives when passing on a tender. */
export const PASS_REASONS = [
  'Too far for the crew',
  'Margin is too thin',
  'No time to price it properly',
  'We do not have the reference they want',
  'Booked out that month',
]
