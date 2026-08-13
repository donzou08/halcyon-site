/**
 * Hooks defined in index.html. They are no-ops until an advertising ID is
 * pasted into `window.HALCYON_ANALYTICS`, so calling them is always safe.
 */
declare global {
  interface Window {
    HALCYON_ANALYTICS?: { metaPixelId?: string; ga4Id?: string }
    halcyonTrackPage?: (path: string) => void
    halcyonTrackLead?: () => void
    halcyonTrackDemo?: (slug: string) => void
  }
}

export {}
