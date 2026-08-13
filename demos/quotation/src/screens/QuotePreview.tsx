import { useState } from 'react'
import { ArrowLeft, Check, Download, FileText, Home as HomeIcon } from 'lucide-react'
import type { QuoteSnapshot } from '../types'
import { formatINR } from '../lib/format'
import { LineItems, TotalRow } from '../components/LineItems'
import { downloadBlob } from '../lib/download'
import { DemoBadge, DemoBadgeSpacer, PoweredByHalcyon } from '../components/branding'
import { Badge } from '../components/ui'

/**
 * The end of the flow: the quote as it will be sent, plus the PDF button.
 *
 * The PDF is generated in the browser on demand — there is no server round-trip
 * and nothing is uploaded anywhere.
 */
export default function QuotePreview({
  snapshot,
  onBack,
  onHome,
}: {
  snapshot: QuoteSnapshot
  onBack: () => void
  onHome: () => void
}) {
  const { config, quote, meta } = snapshot
  const dp = quote.decimals
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function downloadPdf() {
    setBusy(true)
    setError('')
    try {
      // @react-pdf/renderer is ~1.5 MB, so it is pulled in only when the user
      // actually asks for a PDF. The app itself stays small and loads fast.
      const { generateQuotePdfBlob } = await import('../lib/pdf')
      const blob = await generateQuotePdfBlob(config, quote, meta)
      downloadBlob(blob, `${meta.quoteNumber.replace(/\//g, '-')}-DEMO.pdf`)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } catch (e) {
      console.error(e)
      setError('Could not generate the PDF. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-32">
      <DemoBadge />
      <DemoBadgeSpacer />

      <header className="flex items-center gap-3 py-4">
        <button onClick={onBack} className="btn-ghost px-3 py-2" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-slate-900">Quotation ready</h1>
          <p className="num truncate text-xs text-slate-500">{meta.quoteNumber}</p>
        </div>
      </header>

      <div className="card mb-4 border-l-4 border-emerald-500">
        <div className="flex items-center gap-2">
          <Check size={18} className="text-emerald-600" />
          <span className="font-semibold text-slate-800">Priced, taxed and numbered</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Serial reserved for the current financial year. In the production tool this is also saved
          to the shared quote history the moment it's generated.
        </p>
      </div>

      {/* On-screen rendering of the letter */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="min-w-0">
            <div className="font-bold text-brand-800">{config.company.name}</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              {config.company.tagline}
            </div>
          </div>
          <div className="shrink-0 text-right text-[11px] text-slate-500">
            <div className="num">{meta.date}</div>
            <div className="num">GSTIN {config.company.gstNumber}</div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">To</div>
          <div className="mt-1 font-semibold text-slate-800">{meta.customer.company}</div>
          <div className="text-sm text-slate-500">{meta.customer.companyAddress}</div>
          <div className="mt-1 text-sm text-slate-500">
            Site: {meta.customer.siteLabel} · {meta.customer.state}
          </div>
          {meta.customer.contactName && (
            <div className="mt-1 text-sm text-slate-500">Kind Attn.: {meta.customer.contactName}</div>
          )}
        </div>

        <LineItems lines={quote.lines} decimals={dp} />

        <div className="space-y-1.5 text-sm">
          <TotalRow label="Basic Amount" value={formatINR(quote.subtotal, dp)} />
          {quote.gstMode === 'intra' ? (
            <>
              <TotalRow
                label={`CGST (${Math.round(quote.cgstRate * 100)}%)`}
                value={formatINR(quote.cgstAmount, dp)}
              />
              <TotalRow
                label={`SGST (${Math.round(quote.sgstRate * 100)}%)`}
                value={formatINR(quote.sgstAmount, dp)}
              />
            </>
          ) : (
            <TotalRow
              label={`IGST (${Math.round(quote.igstRate * 100)}%)`}
              value={formatINR(quote.igstAmount, dp)}
            />
          )}
          {quote.roundOff !== 0 && (
            <TotalRow
              label="Round Off"
              value={`${quote.roundOff > 0 ? '+' : '−'}${formatINR(Math.abs(quote.roundOff), dp)}`}
            />
          )}
          <div className="my-1 border-t border-slate-200" />
          <TotalRow label="Total Payable" value={formatINR(quote.totalPayable, dp)} bold />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge tone={quote.gstMode === 'intra' ? 'blue' : 'amber'}>
            {quote.gstMode === 'intra' ? 'Intra-state · CGST + SGST' : 'Inter-state · IGST'}
          </Badge>
          <Badge tone="slate">Valid {config.validityDays} days</Badge>
          <Badge tone="slate">Prepared by {meta.preparedByName}</Badge>
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <FileText size={16} className="text-brand-600" />
          What the PDF contains
        </div>
        <ul className="mt-2 space-y-1 text-sm text-slate-500">
          <li>· Letterhead, reference number and date</li>
          <li>· Itemised cost table with the GST split worked out</li>
          <li>· Terms, payment schedule, warranty and support required</li>
          <li>· Validity period and signature block</li>
        </ul>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <PoweredByHalcyon className="mt-8" />

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl gap-3">
          <button className="btn-ghost px-4" onClick={onHome} aria-label="Home">
            <HomeIcon size={18} />
          </button>
          <button className="btn-primary flex-1" onClick={downloadPdf} disabled={busy}>
            {busy ? (
              'Generating…'
            ) : done ? (
              <>
                <Check size={18} /> Downloaded
              </>
            ) : (
              <>
                <Download size={18} /> Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
