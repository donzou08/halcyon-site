import { useSyncExternalStore } from 'react'
import { getVersion, subscribe } from '../data/store'

/**
 * Re-render this component whenever the store changes.
 *
 * Screens read the store synchronously; this hook is what keeps them live, and
 * it is why the owner dashboard updates the instant a check-in is simulated.
 */
export function useStoreVersion(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion)
}
