import { useState } from 'react'
import { getFieldStaff, getSupervisors } from '../data/store'
import { login } from '../lib/session'
import { COMPANY } from '../data/seed'
import { DemoBadge, Logo, PoweredByHalcyon, Select } from '../components/ui'

/**
 * Deliberately not a real login.
 *
 * The production tool authenticates with a name and a 4-digit PIN. For a public
 * demo that would only be a wall between a visitor and the thing they came to
 * see, so this screen just picks a role.
 */
export default function Login() {
  const owner = getSupervisors().find((s) => s.role === 'owner')!
  const staff = getFieldStaff()
  const [supId, setSupId] = useState(staff[0]?.id ?? '')

  return (
    <div className="flex min-h-[100svh] flex-col bg-gradient-to-b from-brand-800 to-brand-700 px-5 text-white">
      <DemoBadge />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
        <Logo className="mb-10 text-white" />

        <h1 className="text-3xl font-extrabold leading-tight">Site Supervision</h1>
        <p className="mt-2 text-sm text-white/70">
          GPS-verified check-ins, a live view of every site, and issues that reach the owner the
          moment they're raised — instead of a stream of status calls.
        </p>

        <div className="mt-9 space-y-3">
          <button
            onClick={() => login(owner.id)}
            className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 font-bold text-white">
              RM
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Continue as Owner</span>
              <span className="block text-sm text-slate-500">{owner.name} · sees every site</span>
            </span>
            <span className="shrink-0 text-slate-400">›</span>
          </button>

          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <span className="mb-2 block text-sm font-semibold">Continue as Supervisor</span>
            <Select
              value={supId}
              onChange={(e) => setSupId(e.target.value)}
              className="mb-3 !border-white/20 !bg-white/95 !text-slate-900"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <button
              onClick={() => supId && login(supId)}
              className="w-full rounded-xl bg-signal-500 py-3 font-semibold text-white transition hover:bg-signal-400 active:scale-[0.98]"
            >
              Open the field app
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/45">
          No password needed — this is a demonstration build for {COMPANY.short}, with sample data.
        </p>
      </div>

      <PoweredByHalcyon className="pb-8" />
    </div>
  )
}
