import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Photo, Supervisor } from '../data/types'
import { checkIn, getOpenWorkDay, getSite, siteProgress } from '../data/store'
import { MATERIAL_OPTIONS } from '../data/seed'
import { captureFix, distanceMeters, mapsLink, metersLabel, type Fix } from '../lib/geo'
import { sqm } from '../lib/format'
import {
  BackButton,
  Badge,
  Button,
  ConfirmModal,
  Field,
  PhotoInput,
  Screen,
  StageBreakdown,
  StickyBar,
  TextArea,
  TextInput,
} from '../components/ui'

/** Anything beyond this from the site is flagged, not blocked. */
const AT_SITE_RADIUS_M = 300

export default function CheckIn({ user }: { user: Supervisor }) {
  const { siteId } = useParams()
  const nav = useNavigate()
  const site = getSite(siteId!)

  const [targetWork, setTargetWork] = useState('')
  const [headcount, setHeadcount] = useState('')
  const [materials, setMaterials] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [fix, setFix] = useState<Fix | null>(null)
  const [locating, setLocating] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function locate() {
    if (!site) return
    setLocating(true)
    const f = await captureFix(site.lat, site.lng)
    setFix(f)
    setLocating(false)
  }

  useEffect(() => {
    locate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId])

  if (!site) {
    return (
      <Screen>
        <div className="p-6">Site not found.</div>
      </Screen>
    )
  }

  if (!getOpenWorkDay(user.id)) {
    return (
      <Screen>
        <header className="safe-top bg-brand-700 px-5 pb-5 text-white">
          <BackButton />
          <h1 className="text-xl font-bold">Can't check in</h1>
        </header>
        <div className="px-4 py-6">
          <div className="card p-5 text-center">
            <p className="font-semibold text-slate-700">Your work day isn't open.</p>
            <p className="mt-2 text-sm text-slate-500">
              Go back to the home screen and start your work day first. This is what keeps the
              owner's dashboard honest about who is actually out today.
            </p>
          </div>
        </div>
      </Screen>
    )
  }

  const dist = fix ? distanceMeters(fix.lat, fix.lng, site.lat, site.lng) : null
  const farAway = dist !== null && dist > AT_SITE_RADIUS_M
  const prog = siteProgress(site.id)
  const canSubmit = targetWork.trim().length > 0 && headcount.trim().length > 0 && !!fix

  function toggleMaterial(m: string) {
    setMaterials((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]))
  }

  function submit() {
    if (!fix || !site) return
    checkIn({
      siteId: site.id,
      supervisorId: user.id,
      lat: fix.lat,
      lng: fix.lng,
      accuracy: fix.accuracy,
      distance: dist ?? 0,
      targetWork: targetWork.trim(),
      headcount: Number(headcount) || 0,
      materials,
      photos,
      notes: notes.trim(),
    })
    nav('/')
  }

  return (
    <Screen>
      <header className="safe-top bg-brand-700 px-5 pb-5 text-white">
        <BackButton />
        <p className="text-xs uppercase tracking-wide text-brand-100">Check in</p>
        <h1 className="text-xl font-bold leading-tight">{site.name}</h1>
        <p className="text-sm text-brand-100">
          {site.system} · {sqm(site.areaSqm)}
        </p>
      </header>

      <div className="space-y-5 px-4 py-5">
        {/* ---- GPS verification ---- */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Your location</span>
            {locating ? (
              <Badge tone="amber">Locating…</Badge>
            ) : farAway ? (
              <Badge tone="red">Far from site</Badge>
            ) : (
              <Badge tone="green">At site</Badge>
            )}
          </div>

          {fix && (
            <>
              <p className="mt-2 text-sm text-slate-500">
                {dist !== null && (
                  <>
                    ~<span className="num">{metersLabel(dist)}</span> from site ·{' '}
                  </>
                )}
                accuracy ±<span className="num">{Math.round(fix.accuracy)} m</span> ·{' '}
                <a
                  className="font-medium text-brand-600"
                  href={mapsLink(fix.lat, fix.lng)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on map
                </a>
              </p>
              {fix.simulated && (
                <p className="mt-2 rounded-lg bg-amber-50 p-2 text-[11px] leading-snug text-amber-700">
                  Demo location. The real tool uses your device GPS; here a preset coordinate near
                  the site is used so check-in works reliably indoors.
                </p>
              )}
              {farAway && (
                <p className="mt-2 text-xs text-rose-600">
                  You're outside the {AT_SITE_RADIUS_M} m site radius. You can still check in — the
                  distance is recorded and shown to the owner.
                </p>
              )}
            </>
          )}

          <button onClick={locate} className="mt-2 text-sm font-medium text-brand-600">
            Refresh location
          </button>
        </div>

        {/* ---- Where the site stands ---- */}
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Site progress</span>
            <span className="num text-sm font-bold text-emerald-700">{prog.overall}%</span>
          </div>
          <StageBreakdown stages={prog.stages} />
        </div>

        <Field
          label="What is today's target?"
          required
          hint="What you plan to finish. At check-out you'll record what actually got done."
        >
          <TextArea
            value={targetWork}
            onChange={(e) => setTargetWork(e.target.value)}
            placeholder="e.g. Complete primer across bays 3 and 4"
          />
        </Field>

        <Field label="How many workers on site?" required>
          <TextInput
            type="number"
            inputMode="numeric"
            min={0}
            value={headcount}
            onChange={(e) => setHeadcount(e.target.value)}
            placeholder="e.g. 6"
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Materials taken</span>
          <div className="flex flex-wrap gap-2">
            {MATERIAL_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMaterial(m)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  materials.includes(m)
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <Field label="Notes" hint="Optional — anything worth recording on arrival.">
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Client moved the pallet racks as agreed"
          />
        </Field>

        <Field label="Photos" hint="Optional. Nothing is uploaded — images stay on this device.">
          <PhotoInput photos={photos} onChange={setPhotos} />
        </Field>
      </div>

      <StickyBar>
        <Button full variant="success" disabled={!canSubmit} onClick={() => setConfirmOpen(true)}>
          {locating
            ? 'Getting your location…'
            : canSubmit
              ? '✓ Check in'
              : 'Add a target and headcount'}
        </Button>
      </StickyBar>

      <ConfirmModal
        open={confirmOpen}
        title="Check in now?"
        message={`This records your arrival time and location at ${site.name}.`}
        confirmLabel="Yes, check in"
        confirmVariant="success"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </Screen>
  )
}
