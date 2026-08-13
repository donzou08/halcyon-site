import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { CoverageCategory, CoverageEntry, Photo } from '../data/types'
import { checkOut, getSite, getVisit } from '../data/store'
import { durationBetween, timeOf } from '../lib/format'
import { now } from '../data/store'
import {
  BackButton,
  Button,
  ConfirmModal,
  Field,
  PhotoInput,
  Screen,
  Select,
  StickyBar,
  TextArea,
  TextInput,
} from '../components/ui'

/** Coverage categories, and the unit each is measured in. */
const CATEGORIES: { id: CoverageCategory; label: string; unit: string; thickness: boolean }[] = [
  { id: 'surface_prep', label: 'Surface preparation', unit: 'sqm', thickness: false },
  { id: 'primer', label: 'Primer', unit: 'sqm', thickness: false },
  { id: 'screed', label: 'Screed / body coat', unit: 'sqm', thickness: true },
  { id: 'top_coat', label: 'Top coat', unit: 'sqm', thickness: true },
  { id: 'line_marking', label: 'Line marking', unit: 'rft', thickness: false },
  { id: 'filling', label: 'Filling material', unit: 'kg', thickness: false },
]

interface CovRow {
  category: CoverageCategory
  qty: string
  thickness: string
}

/**
 * Check-out.
 *
 * The important design decision here is the gate: a supervisor cannot close a
 * visit without describing the work AND entering at least one completion figure.
 *
 * That single constraint is what turns the tool from a attendance log into a
 * progress record. Without it you get "checked in, checked out" and nobody
 * knows what actually moved. It is also the reason the owner's percentages can
 * be trusted — every one of them traces back to a number a supervisor typed
 * while standing on the floor.
 */
export default function CheckOut() {
  const { visitId } = useParams()
  const nav = useNavigate()
  const visit = getVisit(visitId!)
  const site = visit ? getSite(visit.siteId) : undefined

  const [actualWork, setActualWork] = useState('')
  const [stageReached, setStageReached] = useState(site?.stages[0] ?? '')
  const [incompleteReason, setIncompleteReason] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [rows, setRows] = useState<CovRow[]>([{ category: 'primer', qty: '', thickness: '' }])
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!visit || !site) {
    return (
      <Screen>
        <div className="p-6">Visit not found.</div>
      </Screen>
    )
  }

  const addRow = () => setRows((r) => [...r, { category: 'primer', qty: '', thickness: '' }])
  const updateRow = (i: number, patch: Partial<CovRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i))

  const validRows = rows.filter((r) => Number(r.qty) > 0)

  // The gate, stated plainly so the UI can explain exactly what's missing.
  const hasWork = actualWork.trim().length > 0
  const hasNumbers = validRows.length > 0
  const canSubmit = hasWork && hasNumbers

  const missing = !hasWork
    ? 'Describe what got done'
    : !hasNumbers
      ? 'Enter at least one completion figure'
      : ''

  function submit() {
    const coverage: CoverageEntry[] = validRows.map((r) => {
      const cat = CATEGORIES.find((c) => c.id === r.category)!
      return {
        category: r.category,
        qty: Number(r.qty),
        unit: cat.unit,
        thicknessMm: cat.thickness && r.thickness ? Number(r.thickness) : null,
      }
    })
    checkOut(visit!.id, {
      actualWork: actualWork.trim(),
      stageReached,
      coverage,
      incompleteReason: incompleteReason.trim(),
      photos,
    })
    nav('/')
  }

  return (
    <Screen>
      <header className="safe-top bg-brand-700 px-5 pb-5 text-white">
        <BackButton />
        <p className="text-xs uppercase tracking-wide text-brand-100">Check out</p>
        <h1 className="text-xl font-bold leading-tight">{site.name}</h1>
        <p className="text-sm text-brand-100">
          On site since {timeOf(visit.checkinTime)} ·{' '}
          {durationBetween(visit.checkinTime, now().toISOString())} so far
        </p>
      </header>

      <div className="space-y-5 px-4 py-5">
        <div className="card bg-brand-50/60 p-4">
          <p className="text-sm text-slate-600">
            <b>Today's target was:</b> {visit.targetWork}
          </p>
        </div>

        <Field label="What actually got done?" required>
          <TextArea
            value={actualWork}
            onChange={(e) => setActualWork(e.target.value)}
            placeholder="Describe the work completed today"
          />
        </Field>

        <Field label="Stage reached today">
          <Select value={stageReached} onChange={(e) => setStageReached(e.target.value)}>
            {site.stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        {/* ---- Completion figures: the gate ---- */}
        <div>
          <div className="mb-1 flex items-center justify-between px-1">
            <h3 className="font-semibold text-slate-700">
              Completion figures <span className="text-rose-500">*</span>
            </h3>
            <button onClick={addRow} className="text-sm font-medium text-brand-600">
              + Add
            </button>
          </div>
          <p className="mb-2 px-1 text-xs text-slate-400">
            Area coated or material used. Required, because the day cannot be closed without it, and this is
            what the owner's progress percentages are worked out from.
          </p>

          <div className="space-y-2">
            {rows.map((r, i) => {
              const cat = CATEGORIES.find((c) => c.id === r.category)!
              return (
                <div key={i} className="card space-y-2 p-3">
                  <div className="flex gap-2">
                    <Select
                      value={r.category}
                      onChange={(e) =>
                        updateRow(i, { category: e.target.value as CoverageCategory })
                      }
                      className="flex-1 !py-2 !text-sm"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(i)}
                        className="px-2 text-sm font-medium text-rose-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {cat.thickness && (
                      <TextInput
                        value={r.thickness}
                        onChange={(e) => updateRow(i, { thickness: e.target.value })}
                        inputMode="decimal"
                        placeholder="mm"
                        className="num w-20 !py-2 !text-sm"
                      />
                    )}
                    <TextInput
                      value={r.qty}
                      onChange={(e) => updateRow(i, { qty: e.target.value })}
                      inputMode="decimal"
                      placeholder="Quantity"
                      className="num flex-1 !py-2 !text-sm"
                    />
                    <span className="w-10 self-center text-sm text-slate-400">{cat.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Field
          label="If the target wasn't finished, why?"
          hint="Leave blank if the target was met. This is what the owner reads first."
        >
          <TextArea
            value={incompleteReason}
            onChange={(e) => setIncompleteReason(e.target.value)}
            placeholder="e.g. Rain stopped work; material delivery was late"
          />
        </Field>

        <Field label="Photos" hint="After photos, strongly recommended. Nothing is uploaded.">
          <PhotoInput photos={photos} onChange={setPhotos} />
        </Field>
      </div>

      <StickyBar>
        <Button full variant="danger" disabled={!canSubmit} onClick={() => setConfirmOpen(true)}>
          {canSubmit ? '✓ Check out & submit' : missing}
        </Button>
        {!canSubmit && (
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Check-out needs both a description and a completion figure.
          </p>
        )}
      </StickyBar>

      <ConfirmModal
        open={confirmOpen}
        title="Check out now?"
        message={`Submit your check-out for ${site.name}? This records the work done and ends your visit.`}
        confirmLabel="Yes, check out"
        confirmVariant="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </Screen>
  )
}
