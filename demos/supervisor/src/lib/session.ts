import { useSyncExternalStore } from 'react'
import type { Supervisor } from '../data/types'
import { getSupervisor } from '../data/store'

/**
 * Demo session — just which person you picked on the login screen.
 * No PIN, no password, no token. The production tool uses a name + 4-digit PIN.
 */

const KEY = 'meridian.supervisor.session.v1'
const listeners = new Set<() => void>()
let cached: string | null = readId()

function readId(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function emit() {
  listeners.forEach((l) => l())
}

export function login(id: string) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* ignore */
  }
  cached = id
  emit()
}

export function logout() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  cached = null
  emit()
}

export function useSession(): Supervisor | null {
  const id = useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => cached,
    () => cached,
  )
  return id ? (getSupervisor(id) ?? null) : null
}
