import { DEMO_USERS } from '../data/seed'

export type DemoUser = (typeof DEMO_USERS)[number]

const KEY = 'meridian.demo.user.v1'

export function loadUser(): DemoUser | null {
  try {
    const id = localStorage.getItem(KEY)
    return DEMO_USERS.find((u) => u.id === id) ?? null
  } catch {
    return null
  }
}

export function saveUser(u: DemoUser): void {
  try {
    localStorage.setItem(KEY, u.id)
  } catch {
    /* ignore */
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
