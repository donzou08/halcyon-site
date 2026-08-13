import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { IssueSeverity, IssueType, Photo, Supervisor } from '../data/types'
import { addIssue, getSite } from '../data/store'
import {
  BackButton,
  Button,
  ConfirmModal,
  Field,
  PhotoInput,
  Screen,
  StickyBar,
  TextArea,
} from '../components/ui'

const TYPES: { id: IssueType; label: string; hint: string }[] = [
  { id: 'quality', label: 'Quality', hint: 'Defect, finish, or something that needs rework' },
  { id: 'safety', label: 'Safety', hint: 'Risk to people on or around the floor' },
]

const SEVERITIES: { id: IssueSeverity; label: string; tone: string }[] = [
  { id: 'low', label: 'Low', tone: 'border-slate-300 bg-slate-50 text-slate-700' },
  { id: 'medium', label: 'Medium', tone: 'border-amber-300 bg-amber-50 text-amber-800' },
  { id: 'high', label: 'High', tone: 'border-rose-300 bg-rose-50 text-rose-800' },
]

/**
 * Report an issue.
 *
 * This is the replacement for a WhatsApp message that gets buried: what's
 * raised here lands on the owner's dashboard immediately, carries a severity,
 * and stays counted until somebody resolves it.
 */
export default function ReportIssue({ user }: { user: Supervisor }) {
  const { siteId } = useParams()
  const nav = useNavigate()
  const site = getSite(siteId!)

  const [type, setType] = useState<IssueType>('quality')
  const [severity, setSeverity] = useState<IssueSeverity>('medium')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!site) {
    return (
      <Screen>
        <div className="p-6">Site not found.</div>
      </Screen>
    )
  }

  const canSubmit = description.trim().length > 0

  function submit() {
    addIssue({
      siteId: site!.id,
      supervisorId: user.id,
      type,
      severity,
      description: description.trim(),
      photos,
    })
    nav('/')
  }

  return (
    <Screen>
      <header className="safe-top bg-rose-700 px-5 pb-5 text-white">
        <BackButton />
        <p className="text-xs uppercase tracking-wide text-rose-100">Report an issue</p>
        <h1 className="text-xl font-bold leading-tight">{site.name}</h1>
        <p className="text-sm text-rose-100">Goes straight to the owner's dashboard</p>
      </header>

      <div className="space-y-5 px-4 py-5">
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Type</span>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-xl border-2 p-3 text-left transition ${
                  type === t.id ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white'
                }`}
              >
                <span className="block text-sm font-semibold text-slate-800">{t.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                  {t.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Severity</span>
          <div className="grid grid-cols-3 gap-2">
            {SEVERITIES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeverity(s.id)}
                className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition ${
                  severity === s.id ? s.tone : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <Field
          label="What's the problem?"
          required
          hint="Be specific about what's needed — the owner acts on this without calling you back."
        >
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Moisture reading above limit near the wash bay — cannot prime until it dries"
          />
        </Field>

        <Field label="Photos" hint="Optional. Nothing is uploaded — images stay on this device.">
          <PhotoInput photos={photos} onChange={setPhotos} />
        </Field>
      </div>

      <StickyBar>
        <Button full variant="danger" disabled={!canSubmit} onClick={() => setConfirmOpen(true)}>
          {canSubmit ? 'Send to owner' : 'Describe the problem first'}
        </Button>
      </StickyBar>

      <ConfirmModal
        open={confirmOpen}
        title="Send this issue?"
        message="It appears on the owner's dashboard straight away and stays counted until it's resolved."
        confirmLabel="Yes, send"
        confirmVariant="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </Screen>
  )
}
