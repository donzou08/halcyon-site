/**
 * Capture mode.
 *
 * Marketing screenshots of this app are taken from the live demo, and the
 * presenter controls are the one thing that ruins them: a panel of "Simulate
 * check-in" buttons makes a working system read as staged, which is the
 * opposite of the point. `?clean=1` hides them.
 *
 * What it never hides is the "DEMO — SAMPLE DATA" badge. That label is the
 * honest part of using demo imagery in marketing, so it stays on screen in
 * every mode.
 *
 *   ?clean=1   hide the presenter controls   (bare `?clean` and `?presenter=0` also work)
 *   ?clean=0   show them again               (`?presenter=1` also works)
 *
 * The choice is sticky for the browser tab. In-app navigation drops the query
 * string, and a capture usually walks through several screens, so a flag that
 * only survived one page load would be useless. Closing the tab clears it.
 */

const KEY = 'meridian.capture.clean.v1'

/** A bare `?clean` counts as on, so the shortest URL does the obvious thing. */
function isOn(value: string | null): boolean {
  return value === null || value === '' || value === '1' || value === 'true' || value === 'yes'
}

/** What the URL asked for, or null if it said nothing either way. */
function fromUrl(): boolean | null {
  const q = new URLSearchParams(window.location.search)
  if (q.has('clean')) return isOn(q.get('clean'))
  if (q.has('presenter')) return !isOn(q.get('presenter'))
  return null
}

function resolve(): boolean {
  let asked: boolean | null = null
  try {
    asked = fromUrl()
  } catch {
    /* nothing readable in the URL: treat it as having said nothing */
  }

  try {
    if (asked === null) return sessionStorage.getItem(KEY) === '1'
    if (asked) sessionStorage.setItem(KEY, '1')
    else sessionStorage.removeItem(KEY)
  } catch {
    /* private browsing: the query param still holds for this page load */
  }

  return asked ?? false
}

/** Resolved once per page load. Nothing on screen needs to react to it later. */
export const CLEAN_CAPTURE = resolve()
