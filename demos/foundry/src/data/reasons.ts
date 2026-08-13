import type { ReasonCode, ReasonDef, StageId, VarianceDef } from '../types';

/**
 * Rejection reason codes. An operator only ever sees the codes that apply to
 * their own stage, so a fettler is never asked whether a casting failed a leak
 * test.
 */
export const rejectReasons: ReasonDef[] = [
  {
    code: 'BLOWHOLE',
    labelEn: 'Blowhole / Porosity',
    shortEn: 'Blowhole',
    icon: 'CircleDot',
    stages: ['POUR', 'KNOCKOUT', 'VISUAL', 'MACHINE'],
    basis: 'Gas entrapment. Usually found at pouring, confirmed on machining.',
  },
  {
    code: 'COLDSHUT',
    labelEn: 'Cold Shut',
    shortEn: 'Cold shut',
    icon: 'GitMerge',
    stages: ['POUR', 'KNOCKOUT', 'VISUAL'],
    basis: 'Two metal fronts meeting without fusing. Pouring temperature related.',
  },
  {
    code: 'MISRUN',
    labelEn: 'Misrun',
    shortEn: 'Misrun',
    icon: 'Droplet',
    stages: ['POUR', 'KNOCKOUT', 'VISUAL'],
    basis: 'Cavity not filled. Pouring rate or fluidity related.',
  },
  {
    code: 'SHRINKAGE',
    labelEn: 'Shrinkage Cavity',
    shortEn: 'Shrinkage',
    icon: 'Shrink',
    stages: ['POUR', 'VISUAL', 'MACHINE'],
    basis: 'Feeding failure during solidification. Often only visible after machining.',
  },
  {
    code: 'SANDINC',
    labelEn: 'Sand Inclusion',
    shortEn: 'Sand',
    icon: 'Grip',
    stages: ['KNOCKOUT', 'FETTLE', 'VISUAL'],
    basis: 'Mould or core sand carried into the casting. Found at shakeout and fettling.',
  },
  {
    code: 'CORESHIFT',
    labelEn: 'Core Shift',
    shortEn: 'Core shift',
    icon: 'MoveHorizontal',
    stages: ['KNOCKOUT', 'VISUAL'],
    basis: 'Core moved during pouring, giving uneven wall thickness.',
  },
  {
    code: 'CRACK',
    labelEn: 'Crack',
    shortEn: 'Crack',
    icon: 'Zap',
    stages: ['FETTLE', 'BLAST', 'VISUAL', 'MACHINE'],
    basis: 'Hot tear or cold crack. Often opens up under grinding or blasting.',
  },
  {
    code: 'DIMENSION',
    labelEn: 'Dimensional Out of Tolerance',
    shortEn: 'Dimension',
    icon: 'Ruler',
    stages: ['VISUAL', 'MACHINE', 'FINAL'],
    basis: 'Measured against the gauge or the drawing at inspection.',
  },
  {
    code: 'SURFACE',
    labelEn: 'Surface Defect',
    shortEn: 'Surface',
    icon: 'Layers',
    stages: ['BLAST', 'VISUAL', 'FINAL'],
    basis: 'Scabbing, roughness or residual scale after blasting.',
  },
  {
    code: 'TOOLDAMAGE',
    labelEn: 'Machining Damage',
    shortEn: 'Machining',
    icon: 'Drill',
    stages: ['MACHINE'],
    basis: 'Tool break, chatter or setup error at the machine.',
  },
  {
    code: 'LEAKFAIL',
    labelEn: 'Leak Test Failure',
    shortEn: 'Leak test',
    icon: 'Waves',
    stages: ['FINAL'],
    basis: 'Pressure drop beyond the specified limit on the leak rig.',
  },
  {
    code: 'HANDLING',
    labelEn: 'Handling Damage',
    shortEn: 'Handling',
    icon: 'HandMetal',
    stages: 'all',
    basis: 'Dropped, struck or damaged in transfer. Can happen at any stage.',
  },
];

export const reasonByCode: Record<ReasonCode, ReasonDef> = rejectReasons.reduce(
  (acc, r) => {
    acc[r.code] = r;
    return acc;
  },
  {} as Record<ReasonCode, ReasonDef>,
);

export function reasonsForStage(stageId: StageId): ReasonDef[] {
  return rejectReasons.filter((r) => r.stages === 'all' || r.stages.includes(stageId));
}

/**
 * Variance reason codes, distinct from rejection. These explain why the
 * arithmetic does not close.
 *
 * UNKNOWN is always available and is styled exactly like the others. The point
 * is not to eliminate honest ignorance, it is to make ignorance countable.
 */
export const varianceReasons: VarianceDef[] = [
  { code: 'MISCOUNT_PREV', labelEn: 'Previous stage count appears incorrect', icon: 'ArrowLeftRight' },
  { code: 'MIXED_BATCH', labelEn: 'Batch mixed with another part number', icon: 'Shuffle' },
  { code: 'NOT_YET_MOVED', labelEn: 'Physically present, not yet transferred', icon: 'MapPin' },
  { code: 'RECOUNT_PENDING', labelEn: 'Recount in progress', icon: 'RotateCw' },
  { code: 'UNKNOWN', labelEn: 'Cause not known', icon: 'HelpCircle' },
];

export const varianceByCode = varianceReasons.reduce(
  (acc, v) => {
    acc[v.code] = v;
    return acc;
  },
  {} as Record<VarianceDef['code'], VarianceDef>,
);
