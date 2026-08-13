/**
 * Location handling.
 *
 * The production tool reads the device GPS. A demo has to work from a meeting
 * room, a train, or a laptop with location blocked — so this module tries the
 * real GPS briefly and falls back to a preset fix near the selected site.
 *
 * The fallback is what makes the check-in flow demonstrable indoors: the
 * distance-to-site check, the "At site" badge and the accuracy readout all
 * behave exactly as they do in the field.
 */

export interface Fix {
  lat: number
  lng: number
  accuracy: number
  /** True when the coordinates came from a preset rather than the device. */
  simulated: boolean
}

/** Metres between two coordinates (Haversine). */
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

export function metersLabel(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`
}

export function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

/** A believable fix a few dozen metres from the site. Deterministic per call. */
function presetFix(siteLat: number, siteLng: number): Fix {
  const jitter = () => (Math.random() - 0.5) * 0.0006 // ≈ ±33 m
  return {
    lat: +(siteLat + jitter()).toFixed(6),
    lng: +(siteLng + jitter()).toFixed(6),
    accuracy: Math.round(8 + Math.random() * 10),
    simulated: true,
  }
}

/**
 * Capture a location for a check-in.
 *
 * Tries the device GPS with a short timeout. If it is denied, unavailable or
 * slow — or if the real fix is implausibly far from the site, which it will be
 * for anyone demoing this outside Chennai — it returns the site's preset fix so
 * the flow always completes.
 */
export function captureFix(siteLat: number, siteLng: number): Promise<Fix> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(presetFix(siteLat, siteLng))
      return
    }

    let settled = false
    const finish = (f: Fix) => {
      if (settled) return
      settled = true
      resolve(f)
    }

    // Never leave the user waiting on a slow fix during a live demo.
    const timer = setTimeout(() => finish(presetFix(siteLat, siteLng)), 3500)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        const d = distanceMeters(pos.coords.latitude, pos.coords.longitude, siteLat, siteLng)
        // Real fix, but the viewer isn't standing at a Chennai industrial estate.
        if (d > 5000) {
          finish(presetFix(siteLat, siteLng))
          return
        }
        finish({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          simulated: false,
        })
      },
      () => {
        clearTimeout(timer)
        finish(presetFix(siteLat, siteLng))
      },
      { enableHighAccuracy: true, timeout: 3000, maximumAge: 30000 },
    )
  })
}
