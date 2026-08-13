export type Locale = 'ta' | 'en' | 'hi' | 'bho' | 'or' | 'bn' | 'te' | 'kn' | 'mr' | 'as';

export type ShiftId = 'A' | 'B' | 'C';

export type StageId =
  | 'POUR'
  | 'KNOCKOUT'
  | 'FETTLE'
  | 'BLAST'
  | 'VISUAL'
  | 'MACHINE'
  | 'FINAL'
  | 'DISPATCH';

export type ReasonCode =
  | 'BLOWHOLE'
  | 'COLDSHUT'
  | 'MISRUN'
  | 'SHRINKAGE'
  | 'SANDINC'
  | 'CORESHIFT'
  | 'CRACK'
  | 'DIMENSION'
  | 'SURFACE'
  | 'TOOLDAMAGE'
  | 'LEAKFAIL'
  | 'HANDLING';

export type VarianceCode =
  | 'MISCOUNT_PREV'
  | 'MIXED_BATCH'
  | 'NOT_YET_MOVED'
  | 'RECOUNT_PENDING'
  | 'UNKNOWN';

export type IconName = string;

export interface StageDef {
  id: StageId;
  order: number;
  /** i18n key for the stage name. */
  nameKey: string;
  /** i18n key for the operator role at this stage. */
  roleKey: string;
  /** English fallback, used on the owner side and in exports. */
  nameEn: string;
  roleEn: string;
  icon: IconName;
  /** One line basis, shown in the assumptions drawer. */
  basis: string;
}

export interface ReasonDef {
  code: ReasonCode;
  labelEn: string;
  /** Short form, used on chart axes where the full label will not fit. */
  shortEn: string;
  icon: IconName;
  stages: StageId[] | 'all';
  basis: string;
}

export interface VarianceDef {
  code: VarianceCode;
  labelEn: string;
  icon: IconName;
}

export interface Operator {
  id: string;
  name: string;
  nameLocal?: string;
  stageId: StageId;
  locale: Locale;
  shiftId: ShiftId;
}

export interface Supervisor {
  id: string;
  name: string;
  shiftId: ShiftId;
}

export interface Part {
  id: string;
  code: string;
  description: string;
  weightKg: number;
}

/** Closure state of a single stage shift entry. */
export type EntryStatus = 'open' | 'clean' | 'variance' | 'approved_variance';

export type OwnerAction = 'none' | 'accepted' | 'queried';

export interface StageEntry {
  id: string;
  date: string;
  shiftId: ShiftId;
  stageId: StageId;
  partId: string;
  operatorId: string;

  received: number;
  openingCarry: number;
  passed: number;
  rejected: number;
  rejectBreakdown: Partial<Record<ReasonCode, number>>;
  heldRework: number;
  unaccounted: number;

  status: EntryStatus;
  varianceReason?: VarianceCode;
  supervisorId?: string;
  closedAt?: string;
  photo?: PhotoRecord;
  ownerAction: OwnerAction;
  /** True for entries created by the viewer during the demonstration. */
  live?: boolean;
}

export interface PhotoRecord {
  kind: 'camera' | 'simulated';
  dataUrl?: string;
  capturedAt: string;
}

/** One completed production day, used for the thirty day trend. */
export interface DailyRecord {
  date: string;
  poured: number;
  dispatched: number;
  rejected: number;
  reworked: number;
  unaccounted: number;
  byShift: Record<ShiftId, { poured: number; unaccounted: number; rejected: number; passed: number }>;
}

export interface WorkerNotification {
  id: string;
  entryId: string;
  createdAt: string;
  kind: 'query';
  stageId: StageId;
  read: boolean;
}

export type WorkerScreen =
  | 'lang'
  | 'operator'
  | 'pin'
  | 'shiftConfirm'
  | 'home'
  | 'count'
  | 'reasonPick'
  | 'photo'
  | 'closeSummary'
  | 'variancePick'
  | 'supervisorPin'
  | 'done';

export type CountMode = 'pass' | 'reject' | 'rework';

export interface ReconInput {
  received: number;
  openingCarry: number;
  passed: number;
  rejected: number;
  heldRework: number;
}

export type ReconState = 'balanced' | 'tolerance' | 'variance' | 'approval';
