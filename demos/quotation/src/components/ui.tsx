import { useEffect, useState, type ReactNode } from 'react'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

/**
 * Controlled numeric input that keeps its own text buffer, so typing "12." or
 * clearing the field behaves naturally instead of snapping back to 0, while
 * still syncing when the value is prefilled from outside.
 */
export function NumberInput({
  value,
  onChange,
  unit,
  placeholder,
  min = 0,
}: {
  value: number
  onChange: (n: number) => void
  unit?: string
  placeholder?: string
  min?: number
}) {
  const [text, setText] = useState(value ? String(value) : '')

  useEffect(() => {
    const parsed = text === '' ? 0 : Number(text)
    if (parsed !== value) setText(value ? String(value) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        className="input num pr-16"
        placeholder={placeholder}
        min={min}
        value={text}
        onChange={(e) => {
          const raw = e.target.value
          setText(raw)
          onChange(raw === '' ? 0 : Math.max(min, Number(raw)))
        }}
      />
      {unit && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
          {unit}
        </span>
      )}
    </div>
  )
}

export function SelectCard({
  selected,
  onClick,
  title,
  subtitle,
  right,
}: {
  selected: boolean
  onClick: () => void
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
}) {
  return (
    <button type="button" onClick={onClick} className={`chip ${selected ? 'chip-on' : 'chip-off'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="mt-0.5 text-sm text-slate-500">{subtitle}</div>}
        </div>
        {right && <div className="shrink-0 text-right text-sm font-medium text-slate-700">{right}</div>}
      </div>
    </button>
  )
}

export function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode
  tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue'
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-rose-100 text-rose-700',
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
