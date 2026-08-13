import { useSyncExternalStore } from 'react'
import {
  FOLLOW_UPS,
  MONEY_IN,
  OPENING,
  RECEIVABLES,
  type MonthPoint,
} from '../data/seed'

/**
 * One small store, because the whole point of the demo is that the panels are
 * connected. Recording a payment has to move the cash tile, the receivables
 * list, the August bar on the chart and the alert that raised it, all at once.
 * If those were four independent widgets the demo would prove nothing.
 */

const KEY = 'halcyon.cc.demo.v1'

export interface State {
  /** Receivable ids that have been banked. */
  collected: string[]
  /** Follow-up ids that have been chased today. */
  chased: string[]
  /** Alert ids the owner has cleared. */
  clearedAlerts: string[]
}

const EMPTY: State = { collected: [], chased: [], clearedAlerts: [] }

function read(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const p = JSON.parse(raw) as Partial<State>
    return {
      collected: p.collected ?? [],
      chased: p.chased ?? [],
      clearedAlerts: p.clearedAlerts ?? [],
    }
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
    /* private browsing, carry on in memory */
  }
  listeners.forEach((l) => l())
}

export function useCommandCenter() {
  const s = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state,
  )
  return derive(s)
}

export function collect(receivableId: string) {
  if (state.collected.includes(receivableId)) return
  commit({ ...state, collected: [...state.collected, receivableId] })
}

export function chase(followUpId: string) {
  if (state.chased.includes(followUpId)) return
  commit({ ...state, chased: [...state.chased, followUpId] })
}

export function clearAlert(alertId: string) {
  if (state.clearedAlerts.includes(alertId)) return
  commit({ ...state, clearedAlerts: [...state.clearedAlerts, alertId] })
}

export function resetDemo() {
  commit(EMPTY)
}

// ---------------------------------------------------------------------------

export interface Derived {
  raw: State
  cash: number
  owedToUs: number
  owedByUs: number
  invoicedThisMonth: number
  outstanding: typeof RECEIVABLES
  collectedToday: typeof RECEIVABLES
  moneyIn: MonthPoint[]
  followUps: { id: string; client: string; work: string; value: number; sentDaysAgo: number; chased: boolean }[]
  bankedToday: number
}

function derive(s: State): Derived {
  const banked = RECEIVABLES.filter((r) => s.collected.includes(r.id))
  const bankedToday = banked.reduce((sum, r) => sum + r.amount, 0)
  const outstanding = RECEIVABLES.filter((r) => !s.collected.includes(r.id))

  // Money banked lands in the current, part month.
  const moneyIn = MONEY_IN.map((m) =>
    m.partial ? { ...m, amount: m.amount + bankedToday } : m,
  )

  return {
    raw: s,
    cash: OPENING.cash + bankedToday,
    owedToUs: outstanding.reduce((sum, r) => sum + r.amount, 0),
    owedByUs: OPENING.owedByUs,
    invoicedThisMonth: OPENING.invoicedThisMonth,
    outstanding,
    collectedToday: banked,
    moneyIn,
    bankedToday,
    followUps: FOLLOW_UPS.map((f) => ({ ...f, chased: s.chased.includes(f.id) })),
  }
}
