import { ArrowRight } from 'lucide-react'
import { DemoBadge, MeridianLogo, PoweredByHalcyon } from '../components/branding'
import { DEMO_USERS } from '../data/seed'
import type { DemoUser } from '../lib/session'

/**
 * Deliberately not a real login.
 *
 * The production tool authenticates with a name and a 4-digit PIN. For a public
 * demo that would only be a wall between a visitor and the thing they came to
 * see, so this screen just picks a role. No password, no PIN, no auth.
 */
export default function Login({ onPick }: { onPick: (u: DemoUser) => void }) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-gradient-to-b from-brand-800 to-brand-700 px-5 text-white">
      <DemoBadge />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
        <MeridianLogo tone="light" className="mb-10" />

        <h1 className="text-3xl font-extrabold leading-tight">Quotation Tool</h1>
        <p className="mt-2 text-sm text-white/70">
          Build a fully priced, GST-correct industrial flooring quotation and send the PDF — in under
          a minute.
        </p>

        <div className="mt-9 space-y-3">
          {DEMO_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => onPick(u)}
              className="flex w-full items-center gap-4 rounded-2xl bg-white/10 p-4 text-left ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.99]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 text-base font-bold">
                {u.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  Continue as {u.role === 'owner' ? 'Owner' : 'Sales Rep'}
                </span>
                <span className="block text-sm text-white/60">
                  {u.name} · {u.title}
                </span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-white/50" />
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-white/45">
          No password needed — this is a demonstration build with sample data.
        </p>
      </div>

      <PoweredByHalcyon className="pb-8" />
    </div>
  )
}
