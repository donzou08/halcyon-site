import { ArrowLeft, RotateCcw } from 'lucide-react'
import type { AppConfig } from '../types'
import { SQFT_PER_SQM } from '../types'
import { formatINR } from '../lib/format'
import { resetDemo } from '../lib/store'
import { CLEAN_CAPTURE } from '../lib/captureMode'
import { DemoBadge, DemoBadgeSpacer, PoweredByHalcyon } from '../components/branding'

/**
 * Read-only in the demo.
 *
 * In the production tool this screen is fully editable and the catalogue is
 * shared across the team in real time — one person changes a rate and everyone
 * else's next quote picks it up. Here it exists to show what the quote is
 * priced from.
 */
export default function Settings({ config, onBack }: { config: AppConfig; onBack: () => void }) {
  const c = config.company

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10">
      <DemoBadge />
      <DemoBadgeSpacer />

      <header className="flex items-center gap-3 py-4">
        <button onClick={onBack} className="btn-ghost px-3 py-2" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Rate card &amp; company</h1>
          <p className="text-xs text-slate-500">Read-only in this demo</p>
        </div>
      </header>

      <div className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Company profile
        </h2>
        <dl className="space-y-2 text-sm">
          <Line label="Name" value={c.name} />
          <Line label="Address" value={c.addressLines.join(', ')} />
          <Line label="GSTIN" value={c.gstNumber} mono />
          <Line label="SAC code" value={c.sacCode} mono />
          <Line label="Phone" value={c.phone} mono />
          <Line label="Email" value={c.email} />
          <Line label="Quote prefix" value={`${c.quotePrefix}/NNNN/YY-YY`} mono />
        </dl>
      </div>

      <div className="card mb-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Rate card
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          Stored per square metre, shown here per square foot — the unit the trade quotes in.
        </p>
        <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">System</th>
                <th className="px-2 py-2">Category</th>
                <th className="px-3 py-2 text-right">₹ / sq.ft</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config.systems.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2 text-slate-800">
                    {s.name}
                    {s.description && (
                      <span className="block text-[11px] text-slate-400">{s.description}</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-xs text-slate-500">{s.category}</td>
                  <td className="num whitespace-nowrap px-3 py-2 text-right font-medium text-slate-800">
                    {formatINR(s.ratePerSqm / SQFT_PER_SQM)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Extras &amp; tax
        </h2>
        <dl className="space-y-2 text-sm">
          <Line label={config.filler.name} value={`${formatINR(config.filler.ratePerKg)} / kg`} mono />
          {config.lineWidths.map((w) => (
            <Line
              key={w.id}
              label={`Line marking — ${w.label}`}
              value={`${formatINR(w.ratePerFoot)} / ft`}
              mono
            />
          ))}
          <Line
            label="GST — within Tamil Nadu"
            value={`CGST ${Math.round(config.cgstRate * 100)}% + SGST ${Math.round(config.sgstRate * 100)}%`}
          />
          <Line
            label="GST — other states"
            value={`IGST ${Math.round(config.igstRate * 100)}%`}
          />
          <Line label="Quote validity" value={`${config.validityDays} days`} />
        </dl>
      </div>

      {/* Presenter control. Hidden under `?clean=1`, because in a screenshot a
          reset button makes a working system look staged. See lib/captureMode.ts. */}
      {!CLEAN_CAPTURE && (
        <>
          <button
            onClick={() => {
              resetDemo()
              window.location.reload()
            }}
            className="btn-ghost w-full"
          >
            <RotateCcw size={16} /> Reset demo data
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Clears any quotes generated in this session and restores the sample history.
          </p>
        </>
      )}

      <PoweredByHalcyon className="mt-8" />
    </div>
  )
}

function Line({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className={`text-right text-slate-800 ${mono ? 'num' : ''}`}>{value}</dd>
    </div>
  )
}
