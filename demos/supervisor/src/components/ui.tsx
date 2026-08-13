import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { Photo } from '../data/types'

// ---------------------------------------------------------------------------
// Branding
// ---------------------------------------------------------------------------

/** Meridian's mark — a layered-floor emblem plus the company wordmark. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="m3 13 9 4.5L21 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
          <path d="m3 17.5 9 4.5 9-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[1.05rem] font-extrabold tracking-tight">Meridian</span>
        <span className="block text-[0.58rem] font-semibold tracking-[0.2em] opacity-75">
          INDUSTRIAL FLOORING
        </span>
      </span>
    </div>
  )
}

/**
 * Quiet "Powered by Halcyon" signature. Plain, non-clickable, muted — a field
 * supervisor tapping around a phone must never be pulled out to a website.
 */
export function PoweredByHalcyon({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center ${className}`} style={{ fontSize: '12px', color: '#888480' }}>
      Powered by{' '}
      <span style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.06em' }}>
        Halcyon
      </span>
    </div>
  )
}

/** Persistent "Demo — Sample Data" indicator, fixed above everything. */
export function DemoBadge() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.4rem,env(safe-area-inset-top))]">
      <div className="pointer-events-none flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-300 shadow-sm backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        DEMO — SAMPLE DATA
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function Screen({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto min-h-full w-full pb-28 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
      <DemoBadge />
      {children}
    </div>
  )
}

export function StickyBar({ children }: { children: ReactNode }) {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-md px-4 py-3">{children}</div>
    </div>
  )
}

export function BackButton({ label = 'Back' }: { label?: string }) {
  const nav = useNavigate()
  return (
    <button
      onClick={() => nav(-1)}
      className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25 active:scale-95"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

type BtnProps = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'success' | 'danger' | 'ghost' | 'signal'
  disabled?: boolean
  full?: boolean
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  full,
}: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.95rem] font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100'
  const styles: Record<string, string> = {
    primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-600',
    success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500',
    danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500',
    signal: 'bg-signal-500 text-white shadow-sm hover:bg-signal-400',
    ghost: 'border border-slate-200 bg-white text-brand-700 hover:bg-slate-50',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${full ? 'w-full' : ''}`}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string
  hint?: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[1rem] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-[84px] resize-y ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ''}`} />
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

export function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode
  tone?: 'slate' | 'green' | 'red' | 'amber' | 'blue'
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-brand-100 text-brand-700',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent))
  const color = p >= 100 ? 'bg-emerald-600' : p >= 50 ? 'bg-emerald-500' : 'bg-signal-400'
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${p}%` }} />
    </div>
  )
}

/** Numbered stage list with a per-stage percentage. */
export function StageBreakdown({
  stages,
}: {
  stages: { stage: string; percent: number }[]
}) {
  return (
    <ol className="space-y-2.5">
      {stages.map((s, i) => {
        const done = s.percent >= 100
        const current = s.percent > 0 && s.percent < 100
        return (
          <li key={s.stage} className="flex items-center gap-3">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                done
                  ? 'bg-emerald-500 text-white'
                  : current
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-200 text-slate-400'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                current ? 'font-semibold text-brand-700' : done ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {s.stage}
            </span>
            <div className="flex w-24 shrink-0 items-center gap-2">
              <ProgressBar percent={s.percent} />
              <span className="num w-8 text-right text-xs font-semibold text-slate-500">
                {s.percent}%
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Small "i" that opens a plain-language explanation of a metric or heading. */
export function InfoDot({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen(true)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="-m-1.5 ml-0.5 inline-flex items-center justify-center rounded-full p-1.5 align-middle"
        aria-label={`About ${title}`}
      >
        <span className="grid h-[19px] w-[19px] place-items-center rounded-full bg-slate-200 text-[0.65rem] font-bold leading-none text-slate-600">
          i
        </span>
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          >
            <div className="card w-full max-w-sm p-5 text-left" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-slate-800">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{children}</p>
              <button
                onClick={() => setOpen(false)}
                className="mt-4 w-full rounded-xl bg-brand-700 py-2.5 font-semibold text-white"
              >
                Got it
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

/** Confirmation dialog. Never a native confirm() — those block and look wrong. */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: BtnProps['variant']
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={onCancel}>
      <div className="card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-600">{message}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="ghost" full onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={confirmVariant} full onClick={onConfirm} disabled={busy}>
            {busy ? 'Saving…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/**
 * Photo picker. Accepts any image and keeps it as a local object URL — nothing
 * is uploaded anywhere, which is the point in a public demo.
 */
export function PhotoInput({
  photos,
  onChange,
}: {
  photos: Photo[]
  onChange: (p: Photo[]) => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const added: Photo[] = Array.from(files).map((f) => ({
      id: `p-${Math.random().toString(36).slice(2, 9)}`,
      url: URL.createObjectURL(f),
    }))
    onChange([...photos, ...added])
    if (ref.current) ref.current.value = ''
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
            <img src={p.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((x) => x.id !== p.id))}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-sm leading-none text-white"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500"
        >
          <span className="text-center text-xs font-semibold leading-tight">
            <span className="block text-2xl font-light">+</span>
            Add photo
          </span>
        </button>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}

/** Transient confirmation, bottom of screen. */
export function Toast({ message }: { message: string }) {
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
        {message}
      </div>
    </div>,
    document.body,
  )
}
