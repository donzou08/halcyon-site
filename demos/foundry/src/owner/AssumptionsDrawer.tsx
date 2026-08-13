import { X } from 'lucide-react';

import { assumptionBasis, costPerUnit, plantConfig } from '../config/plantConfig';
import { rejectReasons } from '../data/reasons';
import { stages } from '../data/stages';
import { inr, num } from '../lib/format';
import { useStore } from '../store/useStore';

interface Row {
  name: string;
  value: string;
  basis: string;
}

const rows: Row[] = [
  {
    name: 'Moulds poured per day',
    value: num(plantConfig.dailyMouldsPoured),
    basis: assumptionBasis.dailyMouldsPoured,
  },
  {
    name: 'Units dispatched per day',
    value: num(plantConfig.dailyDispatched),
    basis: assumptionBasis.dailyDispatched,
  },
  {
    name: 'Average casting weight',
    value: `${plantConfig.averageCastingWeightKg} kg`,
    basis: assumptionBasis.averageCastingWeightKg,
  },
  {
    name: 'Landed cost per kg',
    value: inr(plantConfig.landedCostPerKg),
    basis: assumptionBasis.landedCostPerKg,
  },
  {
    name: 'Cost of one casting',
    value: inr(costPerUnit),
    basis: 'Weight multiplied by cost per kg. Every rupee figure comes from this.',
  },
  {
    name: 'Difference allowed without a reason',
    value: `${plantConfig.varianceToleranceUnits} castings`,
    basis: assumptionBasis.varianceToleranceUnits,
  },
  {
    name: 'Difference needing the shift in-charge',
    value: `${plantConfig.supervisorApprovalThreshold} castings`,
    basis: assumptionBasis.supervisorApprovalThreshold,
  },
  {
    name: 'Rejects needing a photo',
    value: `${plantConfig.photoRequiredRejectThreshold} castings`,
    basis: assumptionBasis.photoRequiredRejectThreshold,
  },
];

export function AssumptionsDrawer() {
  const open = useStore((s) => s.assumptionsOpen);
  const setOpen = useStore((s) => s.setAssumptionsOpen);
  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-end"
      style={{ top: 'var(--overlay-top, 0px)' }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="flex-1 bg-ink/30"
      />
      <aside className="animate-fadeIn flex w-full max-w-[480px] flex-col overflow-y-auto bg-white">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white px-6 py-5">
          <div>
            <h2 className="text-[18px] leading-tight font-semibold">Figures and assumptions</h2>
            <p className="mt-1.5 text-[13px] text-muted">
              Typical foundry figures, not measured at this plant. Expected to change.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-canvas"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <div className="px-6 py-5">
          <div className="divide-y divide-line">
            {rows.map((row) => (
              <div key={row.name} className="py-3.5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[15px]">{row.name}</span>
                  <span className="num shrink-0 text-[16px] font-semibold">{row.value}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{row.basis}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-line px-6 py-5">
          <h3 className="text-[13px] font-semibold tracking-[0.06em] text-faint uppercase">Stages</h3>
          <ol className="mt-3 space-y-2">
            {stages.map((stage) => (
              <li key={stage.id} className="flex gap-3 text-[14px]">
                <span className="num w-4 shrink-0 text-faint">{stage.order}</span>
                <span className="flex-1">
                  {stage.nameEn}
                  <span className="block text-[13px] text-muted">{stage.roleEn}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-line px-6 py-5 pb-8">
          <h3 className="text-[13px] font-semibold tracking-[0.06em] text-faint uppercase">Defect codes</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {rejectReasons.map((r) => r.labelEn).join(' · ')}
          </p>
          <p className="mt-2 text-[12px] text-faint">Filtered per stage on the operator screen.</p>
        </div>
      </aside>
    </div>
  );
}
