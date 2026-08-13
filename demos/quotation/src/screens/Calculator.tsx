import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  ListPlus,
  Ruler,
} from 'lucide-react'
import {
  FT_PER_M,
  SQFT_PER_SQM,
  type AppConfig,
  type QuoteInput,
  type SelectedSystem,
} from '../types'
import { computeQuote } from '../lib/calc'
import { formatINR } from '../lib/format'
import { LineItems, TotalRow } from '../components/LineItems'
import { gstModeForState } from '../lib/gst'
import { DEMO_CUSTOMERS, DEMO_SITES } from '../data/seed'
import { DemoBadge, DemoBadgeSpacer } from '../components/branding'
import { Badge, Field, NumberInput, SelectCard } from '../components/ui'

type StepId = 'customer' | 'area' | 'system' | 'extras' | 'review'

const STEPS: { id: StepId; title: string }[] = [
  { id: 'customer', title: 'Customer' },
  { id: 'area', title: 'Area' },
  { id: 'system', title: 'System' },
  { id: 'extras', title: 'Extras' },
  { id: 'review', title: 'Review' },
]

export default function Calculator({
  config,
  input,
  setInput,
  onGenerate,
  onBack,
}: {
  config: AppConfig
  input: QuoteInput
  setInput: (i: QuoteInput) => void
  onGenerate: () => void
  onBack: () => void
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const step = STEPS[stepIdx]
  const update = (patch: Partial<QuoteInput>) => setInput({ ...input, ...patch })
  const updateCustomer = (patch: Partial<QuoteInput['customer']>) =>
    setInput({ ...input, customer: { ...input.customer, ...patch } })

  const live = useMemo(() => computeQuote(input, config), [input, config])

  // ---- Step 1: customer + site (picked, never typed) ----
  const sitesForCustomer = DEMO_SITES.filter((s) => s.customerId === input.customer.customerId)

  const pickCustomer = (customerId: string) => {
    const cust = DEMO_CUSTOMERS.find((c) => c.id === customerId)
    if (!cust) return
    const sites = DEMO_SITES.filter((s) => s.customerId === customerId)
    const site = sites[0]
    setInput({
      ...input,
      customer: {
        customerId: cust.id,
        company: cust.name,
        companyAddress: cust.address,
        gstNumber: cust.gstNumber,
        siteId: site?.id ?? null,
        siteLabel: site?.label ?? '',
        siteAddress: site?.address ?? '',
        pincode: site?.pincode ?? '',
        state: site?.state ?? '',
        contactName: site?.contactName ?? '',
        contactPhone: site?.contactPhone ?? '',
        contactEmail: site?.contactEmail ?? '',
      },
    })
  }

  const pickSite = (siteId: string) => {
    const site = DEMO_SITES.find((s) => s.id === siteId)
    if (!site) return
    updateCustomer({
      siteId: site.id,
      siteLabel: site.label,
      siteAddress: site.address,
      pincode: site.pincode,
      state: site.state,
      contactName: site.contactName,
      contactPhone: site.contactPhone,
      contactEmail: site.contactEmail,
    })
  }

  // ---- Step 3: systems ----
  const isSelected = (systemId: string) => input.systems.some((s) => s.systemId === systemId)

  const toggleSystem = (systemId: string) => {
    if (isSelected(systemId)) {
      update({ systems: input.systems.filter((s) => s.systemId !== systemId) })
      return
    }
    const sys = config.systems.find((s) => s.id === systemId)
    if (!sys) return
    const sel: SelectedSystem = {
      key: `sel-${systemId}-${input.systems.length}`,
      systemId,
      name: sys.name,
      thicknessMm: sys.defaultThicknessMm ?? 0,
      ratePerSqm: sys.ratePerSqm,
      qtySqm: input.areaSqm || 0,
    }
    update({ systems: [...input.systems, sel] })
  }

  const updateSel = (key: string, patch: Partial<SelectedSystem>) =>
    update({ systems: input.systems.map((s) => (s.key === key ? { ...s, ...patch } : s)) })

  // Rates are held per square metre but worked in the quote's chosen unit, so
  // the printed Qty × Rate multiplies out exactly.
  const unitLabel = input.areaUnit === 'sqft' ? 'sq.ft' : 'sqm'
  const rateToDisplay = (rateSqm: number) =>
    input.areaUnit === 'sqft' ? Math.round((rateSqm / SQFT_PER_SQM) * 100) / 100 : rateSqm
  const rateFromDisplay = (rate: number) =>
    input.areaUnit === 'sqft' ? rate * SQFT_PER_SQM : rate

  const lineFtPerUnit = input.lineUnit === 'm' ? FT_PER_M : 1
  const lineUnitLabel = input.lineUnit === 'm' ? 'metre' : 'foot'
  const lineRateDisplay = Math.round(input.lineRatePerFoot * lineFtPerUnit * 100) / 100

  const canAdvance = (): boolean => {
    switch (step.id) {
      case 'customer':
        return !!input.customer.customerId && !!input.customer.siteId
      case 'area':
        return input.areaSqm > 0
      case 'system':
        return input.systems.length > 0
      case 'review':
        return live.lines.length > 0
      default:
        return true
    }
  }

  const next = () => (stepIdx < STEPS.length - 1 ? setStepIdx(stepIdx + 1) : onGenerate())
  const back = () => (stepIdx > 0 ? setStepIdx(stepIdx - 1) : onBack())

  const pct = ((stepIdx + 1) / STEPS.length) * 100

  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-2xl flex-col">
      <DemoBadge />
      <DemoBadgeSpacer />

      <div className="px-4 pt-2">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Step {stepIdx + 1} of {STEPS.length} · {step.title}
          </span>
          <span className="num">{Math.round(pct)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        {step.id === 'customer' && (
          <StepWrap
            icon={<Building2 />}
            title="Customer & site"
            subtitle="Pick from your customer list. The site decides the GST split."
          >
            <div className="space-y-5">
              <div>
                <span className="label">Customer</span>
                <div className="space-y-2">
                  {DEMO_CUSTOMERS.map((c) => (
                    <SelectCard
                      key={c.id}
                      selected={input.customer.customerId === c.id}
                      onClick={() => pickCustomer(c.id)}
                      title={c.name}
                      subtitle={c.address}
                    />
                  ))}
                </div>
              </div>

              {sitesForCustomer.length > 0 && (
                <div>
                  <span className="label">Site</span>
                  <div className="space-y-2">
                    {sitesForCustomer.map((s) => (
                      <SelectCard
                        key={s.id}
                        selected={input.customer.siteId === s.id}
                        onClick={() => pickSite(s.id)}
                        title={s.label}
                        subtitle={`${s.address} · ${s.pincode}`}
                        right={
                          <Badge tone={gstModeForState(s.state) === 'intra' ? 'blue' : 'amber'}>
                            {gstModeForState(s.state) === 'intra' ? 'CGST+SGST' : 'IGST'}
                          </Badge>
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {input.customer.state && (
                <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
                  Site is in <b>{input.customer.state}</b> —{' '}
                  {gstModeForState(input.customer.state) === 'intra' ? (
                    <>
                      same state as Meridian, so this quote carries{' '}
                      <b>CGST {Math.round(config.cgstRate * 100)}% + SGST{' '}
                      {Math.round(config.sgstRate * 100)}%</b>.
                    </>
                  ) : (
                    <>
                      a different state, so this quote carries{' '}
                      <b>IGST {Math.round(config.igstRate * 100)}%</b> instead.
                    </>
                  )}
                </div>
              )}

              {input.customer.contactName && (
                <div className="card">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Site contact
                  </div>
                  <div className="mt-1 font-medium text-slate-800">{input.customer.contactName}</div>
                  <div className="num text-sm text-slate-500">{input.customer.contactPhone}</div>
                  <div className="text-sm text-slate-500">{input.customer.contactEmail}</div>
                </div>
              )}
            </div>
          </StepWrap>
        )}

        {step.id === 'area' && (
          <StepWrap
            icon={<Ruler />}
            title="Floor area"
            subtitle="Applies to every system you pick next. Adjustable per system."
          >
            <Field
              label="Area"
              hint={
                input.areaSqm > 0
                  ? input.areaUnit === 'sqft'
                    ? `= ${input.areaSqm.toLocaleString('en-IN', { maximumFractionDigits: 2 })} sqm`
                    : `= ${(input.areaSqm * SQFT_PER_SQM).toLocaleString('en-IN', { maximumFractionDigits: 0 })} sq.ft`
                  : 'This unit is used across the whole quote and the PDF.'
              }
            >
              <div className="mb-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    input.areaUnit === 'sqft'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  onClick={() => update({ areaUnit: 'sqft', lineUnit: 'ft' })}
                >
                  Square feet
                </button>
                <button
                  type="button"
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    input.areaUnit === 'sqm'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  onClick={() => update({ areaUnit: 'sqm', lineUnit: 'm' })}
                >
                  Square metres
                </button>
              </div>
              <NumberInput
                value={
                  input.areaUnit === 'sqft'
                    ? Math.round(input.areaSqm * SQFT_PER_SQM * 100) / 100
                    : input.areaSqm
                }
                onChange={(n) =>
                  update({
                    areaSqm: input.areaUnit === 'sqft' ? n / SQFT_PER_SQM : n,
                    // Keep already-selected systems in step with the new area.
                    systems: input.systems.map((s) => ({
                      ...s,
                      qtySqm: input.areaUnit === 'sqft' ? n / SQFT_PER_SQM : n,
                    })),
                  })
                }
                unit={unitLabel}
                placeholder="e.g. 12000"
              />
            </Field>

            <div className="mt-4 flex flex-wrap gap-2">
              {[5000, 10000, 18000, 25000].map((a) => {
                const sqm = input.areaUnit === 'sqft' ? a / SQFT_PER_SQM : a
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      update({
                        areaSqm: sqm,
                        systems: input.systems.map((s) => ({ ...s, qtySqm: sqm })),
                      })
                    }
                    className="num rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    {a.toLocaleString('en-IN')}
                  </button>
                )
              })}
            </div>
          </StepWrap>
        )}

        {step.id === 'system' && (
          <StepWrap
            icon={<Layers />}
            title="Flooring system"
            subtitle="Pick one or more. Rate and thickness stay editable per line."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                {config.systems.map((s) => (
                  <SelectCard
                    key={s.id}
                    selected={isSelected(s.id)}
                    onClick={() => toggleSystem(s.id)}
                    title={s.name}
                    subtitle={s.description}
                    right={
                      <span className="num whitespace-nowrap">
                        {formatINR(rateToDisplay(s.ratePerSqm))}
                        <span className="text-xs text-slate-400">/{unitLabel}</span>
                      </span>
                    }
                  />
                ))}
              </div>

              {input.systems.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Selected — edit qty, thickness &amp; rate
                  </div>
                  {input.systems.map((sel) => (
                    <div key={sel.key} className="rounded-xl bg-slate-50 p-3">
                      <div className="mb-2 text-sm font-medium text-slate-800">{sel.name}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="text-xs text-slate-500">
                          Qty ({unitLabel})
                          <NumberInput
                            value={
                              input.areaUnit === 'sqft'
                                ? Math.round(sel.qtySqm * SQFT_PER_SQM * 100) / 100
                                : sel.qtySqm
                            }
                            onChange={(n) =>
                              updateSel(sel.key, {
                                qtySqm: input.areaUnit === 'sqft' ? n / SQFT_PER_SQM : n,
                              })
                            }
                          />
                        </label>
                        <label className="text-xs text-slate-500">
                          Thickness (mm)
                          <NumberInput
                            value={sel.thicknessMm}
                            onChange={(n) => updateSel(sel.key, { thicknessMm: n })}
                          />
                        </label>
                        <label className="text-xs text-slate-500">
                          Rate (₹/{unitLabel})
                          <NumberInput
                            value={rateToDisplay(sel.ratePerSqm)}
                            onChange={(n) => updateSel(sel.key, { ratePerSqm: rateFromDisplay(n) })}
                          />
                        </label>
                      </div>
                      <div className="num mt-1.5 text-right text-xs font-medium text-slate-600">
                        = {formatINR(sel.qtySqm * sel.ratePerSqm)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </StepWrap>
        )}

        {step.id === 'extras' && (
          <StepWrap
            icon={<ListPlus />}
            title="Optional extras"
            subtitle="Filling material and safety line marking. Both optional."
          >
            <div className="space-y-6">
              <div>
                <span className="label">Filling material (undulations &amp; potholes)</span>
                <div className="grid grid-cols-2 gap-3">
                  <SelectCard
                    selected={!input.fillerEnabled}
                    onClick={() => update({ fillerEnabled: false })}
                    title="Not needed"
                  />
                  <SelectCard
                    selected={input.fillerEnabled}
                    onClick={() => update({ fillerEnabled: true })}
                    title="Include"
                  />
                </div>
                {input.fillerEnabled && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Quantity" hint="Can be 0 — the rate still prints.">
                      <NumberInput
                        value={input.fillerKg}
                        onChange={(n) => update({ fillerKg: n })}
                        unit="kg"
                        placeholder="e.g. 500"
                      />
                    </Field>
                    <Field label="Rate">
                      <NumberInput
                        value={input.fillerRate}
                        onChange={(n) => update({ fillerRate: n })}
                        unit="₹/kg"
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div>
                <span className="label">Safety line marking</span>
                <div className="grid grid-cols-2 gap-3">
                  <SelectCard
                    selected={!input.lineMarkingEnabled}
                    onClick={() => update({ lineMarkingEnabled: false })}
                    title="Not needed"
                  />
                  <SelectCard
                    selected={input.lineMarkingEnabled}
                    onClick={() => update({ lineMarkingEnabled: true })}
                    title="Include"
                  />
                </div>

                {input.lineMarkingEnabled && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <span className="label">Line width</span>
                      <div className="grid grid-cols-3 gap-2">
                        {config.lineWidths.map((w) => (
                          <SelectCard
                            key={w.id}
                            selected={input.lineWidthId === w.id}
                            onClick={() =>
                              update({ lineWidthId: w.id, lineRatePerFoot: w.ratePerFoot })
                            }
                            title={w.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`Length (${input.lineUnit})`}>
                        <NumberInput
                          value={input.lineLength}
                          onChange={(n) => update({ lineLength: n })}
                          unit={input.lineUnit}
                          placeholder="e.g. 800"
                        />
                      </Field>
                      <Field label={`Rate (₹/${lineUnitLabel})`}>
                        <NumberInput
                          value={lineRateDisplay}
                          onChange={(n) => update({ lineRatePerFoot: n / lineFtPerUnit })}
                          unit={`/${input.lineUnit}`}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>

              <Field label="Remarks (optional)">
                <textarea
                  className="input min-h-[80px]"
                  value={input.remarks}
                  placeholder="Anything to print under the cost table"
                  onChange={(e) => update({ remarks: e.target.value })}
                />
              </Field>
            </div>
          </StepWrap>
        )}

        {step.id === 'review' && (
          <StepWrap
            icon={<CheckCircle2 />}
            title="Review"
            subtitle="Check the figures, then generate the quotation PDF."
          >
            <ReviewTable config={config} input={input} />

            <div className="card mt-4 space-y-3">
              <div className="text-sm font-semibold text-slate-800">Rounding</div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-500">
                  Decimals
                  <select
                    className="input mt-1"
                    value={input.rounding.decimals}
                    onChange={(e) =>
                      update({ rounding: { ...input.rounding, decimals: Number(e.target.value) } })
                    }
                  >
                    <option value={2}>2 decimals</option>
                    <option value={1}>1 decimal</option>
                    <option value={0}>0 (whole ₹)</option>
                  </select>
                </label>
                <label className="text-xs text-slate-500">
                  Round total to
                  <select
                    className="input mt-1"
                    value={input.rounding.step}
                    onChange={(e) =>
                      update({ rounding: { ...input.rounding, step: Number(e.target.value) } })
                    }
                  >
                    <option value={0}>No rounding</option>
                    <option value={1}>Nearest ₹1</option>
                    <option value={10}>Nearest ₹10</option>
                    <option value={100}>Nearest ₹100</option>
                  </select>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Line items stay precise; only the grand total is rounded, and the adjustment prints
                as its own "Round Off" line.
              </p>
            </div>
          </StepWrap>
        )}
      </div>

      {/* Running total is always visible — the number the customer cares about. */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl">
          {/* The running total gets its own line on a phone: a 10-lakh figure and
              two buttons cannot share 430px without the number being clipped. */}
          <div className="mb-2 flex items-baseline justify-between gap-3 sm:hidden">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              Total ({live.gstMode === 'intra' ? 'incl. CGST+SGST' : 'incl. IGST'})
            </span>
            <span className="num text-lg font-bold text-slate-900">
              {formatINR(live.totalPayable, live.decimals)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden min-w-0 flex-1 sm:block">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">
                Total ({live.gstMode === 'intra' ? 'incl. CGST+SGST' : 'incl. IGST'})
              </div>
              <div className="num truncate text-lg font-bold text-slate-900">
                {formatINR(live.totalPayable, live.decimals)}
              </div>
            </div>
            <button className="btn-ghost px-4" onClick={back} aria-label="Back">
              <ArrowLeft size={18} />
            </button>
            <button className="btn-primary flex-1 sm:flex-none" onClick={next} disabled={!canAdvance()}>
              {step.id === 'review' ? 'Generate Quote' : 'Next'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepWrap({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function ReviewTable({ config, input }: { config: AppConfig; input: QuoteInput }) {
  const q = computeQuote(input, config)
  const dp = q.decimals

  if (q.lines.length === 0) {
    return <div className="card text-center text-sm text-slate-500">No systems selected yet.</div>
  }

  return (
    <div className="space-y-4">
      <LineItems lines={q.lines} decimals={dp} />

      <div className="card space-y-2">
        <TotalRow label="Basic Amount" value={formatINR(q.subtotal, dp)} />
        {q.gstMode === 'intra' ? (
          <>
            <TotalRow label={`CGST (${Math.round(q.cgstRate * 100)}%)`} value={formatINR(q.cgstAmount, dp)} />
            <TotalRow label={`SGST (${Math.round(q.sgstRate * 100)}%)`} value={formatINR(q.sgstAmount, dp)} />
          </>
        ) : (
          <TotalRow label={`IGST (${Math.round(q.igstRate * 100)}%)`} value={formatINR(q.igstAmount, dp)} />
        )}
        {q.roundOff !== 0 && (
          <TotalRow
            label="Round Off"
            value={`${q.roundOff > 0 ? '+' : '\u2212'}${formatINR(Math.abs(q.roundOff), dp)}`}
          />
        )}
        <div className="my-1 border-t border-slate-200" />
        <TotalRow label="Total Payable" value={formatINR(q.totalPayable, dp)} bold />
      </div>
    </div>
  )
}
