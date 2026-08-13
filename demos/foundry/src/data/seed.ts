import { plantConfig } from '../config/plantConfig';
import { unaccountedOf, reconStateOf } from '../lib/reconcile';
import { addDays, isSunday } from '../lib/format';
import { mulberry32, splitExact } from '../lib/rng';
import { operators, parts } from './people';
import { stages } from './stages';
import { reasonsForStage } from './reasons';
import type {
  DailyRecord,
  EntryStatus,
  ReasonCode,
  ShiftId,
  StageEntry,
  StageId,
  VarianceCode,
} from '../types';

/**
 * The demonstration runs against a fixed clock so that every viewer sees the
 * same plant at the same moment. A shift has closed, B shift is running.
 */
export const DEMO_NOW = `${plantConfig.demoDate}T17:24:00`;
export const DEMO_TODAY = plantConfig.demoDate;

/** The Fettling entry the guided walkthrough drives. */
export const WALKTHROUGH_ENTRY_ID = `${DEMO_TODAY}-B-FETTLE`;
/** Figures the walkthrough enters, which must land the closure on exactly 190. */
export const WALKTHROUGH_PASSED = 5940;
export const WALKTHROUGH_REJECTED = 310;
export const WALKTHROUGH_REASON: ReasonCode = 'SANDINC';
export const WALKTHROUGH_UNACCOUNTED = 190;

const SHIFT_IDS: ShiftId[] = ['A', 'B', 'C'];

/** Share of a day's deductions carried by each stage, on a standard day. */
const STAGE_WEIGHTS: Record<StageId, { rejected: number; rework: number; unaccounted: number }> = {
  POUR: { rejected: 520, rework: 40, unaccounted: 640 },
  KNOCKOUT: { rejected: 290, rework: 60, unaccounted: 720 },
  FETTLE: { rejected: 180, rework: 120, unaccounted: 1880 },
  BLAST: { rejected: 90, rework: 30, unaccounted: 460 },
  VISUAL: { rejected: 560, rework: 140, unaccounted: 810 },
  MACHINE: { rejected: 250, rework: 90, unaccounted: 2140 },
  FINAL: { rejected: 130, rework: 40, unaccounted: 780 },
  DISPATCH: { rejected: 10, rework: 0, unaccounted: 570 },
};

/** C shift carries a disproportionate share of the gap. That is the finding. */
const SHIFT_SPLIT = {
  poured: [0.347, 0.342, 0.311],
  rejected: [0.32, 0.33, 0.35],
  rework: [0.33, 0.34, 0.33],
  unaccounted: [0.28, 0.3, 0.42],
};

/** How a stage's rejects distribute across the reason codes open to that stage. */
const REASON_WEIGHTS: Record<StageId, Partial<Record<ReasonCode, number>>> = {
  POUR: { BLOWHOLE: 40, COLDSHUT: 22, MISRUN: 20, SHRINKAGE: 14, HANDLING: 4 },
  KNOCKOUT: { SANDINC: 34, CORESHIFT: 20, BLOWHOLE: 18, COLDSHUT: 12, MISRUN: 12, HANDLING: 4 },
  FETTLE: { SANDINC: 46, CRACK: 40, HANDLING: 14 },
  BLAST: { SURFACE: 52, CRACK: 34, HANDLING: 14 },
  VISUAL: {
    DIMENSION: 26,
    BLOWHOLE: 18,
    SANDINC: 14,
    SURFACE: 12,
    SHRINKAGE: 10,
    CRACK: 8,
    CORESHIFT: 6,
    COLDSHUT: 3,
    MISRUN: 2,
    HANDLING: 1,
  },
  MACHINE: { DIMENSION: 30, TOOLDAMAGE: 26, BLOWHOLE: 18, SHRINKAGE: 14, CRACK: 8, HANDLING: 4 },
  FINAL: { LEAKFAIL: 48, DIMENSION: 30, SURFACE: 18, HANDLING: 4 },
  DISPATCH: { HANDLING: 100 },
};

const VARIANCE_POOL: VarianceCode[] = [
  'MISCOUNT_PREV',
  'MISCOUNT_PREV',
  'MISCOUNT_PREV',
  'NOT_YET_MOVED',
  'NOT_YET_MOVED',
  'MIXED_BATCH',
  'RECOUNT_PENDING',
  'UNKNOWN',
  'UNKNOWN',
];

/** Minute past the closing hour at which each stage files its count. */
const STAGE_MINUTE: Record<StageId, number> = {
  POUR: 2,
  KNOCKOUT: 5,
  FETTLE: 7,
  BLAST: 10,
  VISUAL: 13,
  MACHINE: 16,
  FINAL: 19,
  DISPATCH: 22,
};

function shiftCloseTimestamp(date: string, shiftId: ShiftId, stageId: StageId): string {
  const minute = String(STAGE_MINUTE[stageId]).padStart(2, '0');
  if (shiftId === 'A') return `${date}T14:${minute}:00`;
  if (shiftId === 'B') return `${date}T22:${minute}:00`;
  return `${addDays(date, 1)}T06:${minute}:00`;
}

/**
 * Eleven named operators do not fill twenty four stage and shift slots. Where a
 * slot has no named operator the stage's primary operator covers it, which is
 * how a plant of this size actually runs and keeps the names on screen real.
 */
function operatorFor(stageId: StageId, shiftId: ShiftId): string {
  const atStage = operators.filter((o) => o.stageId === stageId);
  const exact = atStage.find((o) => o.shiftId === shiftId);
  if (exact) return exact.id;
  if (atStage.length > 0) return atStage[0].id;
  return operators[0].id;
}

function statusFor(unaccounted: number): EntryStatus {
  const state = reconStateOf(unaccounted);
  if (state === 'balanced' || state === 'tolerance') return 'clean';
  if (state === 'variance') return 'variance';
  return 'approved_variance';
}

function breakdownFor(stageId: StageId, rejected: number): Partial<Record<ReasonCode, number>> {
  if (rejected <= 0) return {};
  const applicable = reasonsForStage(stageId).map((r) => r.code);
  const weights = applicable.map((code) => REASON_WEIGHTS[stageId][code] ?? 0);
  const counts = splitExact(rejected, weights);
  const out: Partial<Record<ReasonCode, number>> = {};
  applicable.forEach((code, i) => {
    if (counts[i] > 0) out[code] = counts[i];
  });
  return out;
}

interface EntryDraft {
  stageId: StageId;
  received: number;
  rejected: number;
  rework: number;
  unaccounted: number;
}

function makeEntry(
  date: string,
  shiftId: ShiftId,
  draft: EntryDraft,
  partId: string,
  rand: () => number,
  opts: { status?: EntryStatus; ownerAction?: StageEntry['ownerAction'] } = {},
): StageEntry {
  const passed = draft.received - draft.rejected - draft.rework - draft.unaccounted;
  const status = opts.status ?? statusFor(draft.unaccounted);
  const needsReason = status === 'variance' || status === 'approved_variance';
  const supervisorNeeded = status === 'approved_variance';

  return {
    id: `${date}-${shiftId}-${draft.stageId}`,
    date,
    shiftId,
    stageId: draft.stageId,
    partId,
    operatorId: operatorFor(draft.stageId, shiftId),
    received: draft.received,
    openingCarry: 0,
    passed,
    rejected: draft.rejected,
    rejectBreakdown: breakdownFor(draft.stageId, draft.rejected),
    heldRework: draft.rework,
    unaccounted: draft.unaccounted,
    status,
    varianceReason: needsReason
      ? VARIANCE_POOL[Math.floor(rand() * VARIANCE_POOL.length) % VARIANCE_POOL.length]
      : undefined,
    supervisorId: supervisorNeeded
      ? `KC-11${shiftId === 'A' ? '04' : shiftId === 'B' ? '12' : '27'}`
      : undefined,
    closedAt: shiftCloseTimestamp(date, shiftId, draft.stageId),
    photo:
      draft.rejected > plantConfig.photoRequiredRejectThreshold
        ? { kind: 'simulated', capturedAt: shiftCloseTimestamp(date, shiftId, draft.stageId) }
        : undefined,
    ownerAction: opts.ownerAction ?? 'none',
  };
}

/** A completed day, generated from its headline totals. */
function buildCompletedDay(
  date: string,
  totals: { poured: number; rejected: number; rework: number; unaccounted: number },
  rand: () => number,
  ownerAction: StageEntry['ownerAction'],
): { entries: StageEntry[]; record: DailyRecord } {
  const stageIds = stages.map((s) => s.id);

  const rejByStage = splitExact(
    totals.rejected,
    stageIds.map((id) => STAGE_WEIGHTS[id].rejected),
  );
  const rewByStage = splitExact(
    totals.rework,
    stageIds.map((id) => STAGE_WEIGHTS[id].rework),
  );
  const unaByStage = splitExact(
    totals.unaccounted,
    stageIds.map((id) => STAGE_WEIGHTS[id].unaccounted),
  );

  const pouredByShift = splitExact(totals.poured, SHIFT_SPLIT.poured);

  const entries: StageEntry[] = [];
  const byShift = {} as DailyRecord['byShift'];

  SHIFT_IDS.forEach((shiftId, shiftIndex) => {
    let carried = pouredByShift[shiftIndex];
    let shiftRejected = 0;
    let shiftUnaccounted = 0;
    let shiftPassedFinal = 0;

    stageIds.forEach((stageId, stageIndex) => {
      const rejected = splitExact(rejByStage[stageIndex], SHIFT_SPLIT.rejected)[shiftIndex];
      const rework = splitExact(rewByStage[stageIndex], SHIFT_SPLIT.rework)[shiftIndex];
      const unaccounted = splitExact(unaByStage[stageIndex], SHIFT_SPLIT.unaccounted)[shiftIndex];

      const partId = parts[Math.floor(rand() * parts.length) % parts.length].id;
      const entry = makeEntry(
        date,
        shiftId,
        { stageId, received: carried, rejected, rework, unaccounted },
        partId,
        rand,
        { ownerAction },
      );
      entries.push(entry);
      carried = entry.passed;
      shiftRejected += rejected;
      shiftUnaccounted += unaccounted;
      if (stageIndex === stageIds.length - 1) shiftPassedFinal = entry.passed;
    });

    byShift[shiftId] = {
      poured: pouredByShift[shiftIndex],
      unaccounted: shiftUnaccounted,
      rejected: shiftRejected,
      passed: shiftPassedFinal,
    };
  });

  const dispatched = totals.poured - totals.rejected - totals.rework - totals.unaccounted;

  return {
    entries,
    record: {
      date,
      poured: totals.poured,
      dispatched,
      rejected: totals.rejected,
      reworked: totals.rework,
      unaccounted: totals.unaccounted,
      byShift,
    },
  };
}

/**
 * Today, held apart from the generator so that every figure a viewer will read
 * off the screen during a meeting is written down here and can be checked.
 *
 * A shift closed at 14:00 and shows all four closure states. B shift is running.
 * C shift has not started.
 */
const TODAY_A_SHIFT: EntryDraft[] = [
  { stageId: 'POUR', received: 18180, rejected: 182, rework: 14, unaccounted: 0 },
  { stageId: 'KNOCKOUT', received: 17984, rejected: 101, rework: 21, unaccounted: 18 },
  { stageId: 'FETTLE', received: 17844, rejected: 63, rework: 42, unaccounted: 604 },
  { stageId: 'BLAST', received: 17135, rejected: 31, rework: 10, unaccounted: 9 },
  { stageId: 'VISUAL', received: 17085, rejected: 196, rework: 49, unaccounted: 187 },
  { stageId: 'MACHINE', received: 16653, rejected: 87, rework: 31, unaccounted: 812 },
  { stageId: 'FINAL', received: 15723, rejected: 45, rework: 14, unaccounted: 64 },
  { stageId: 'DISPATCH', received: 15600, rejected: 3, rework: 0, unaccounted: 546 },
];

/**
 * B shift, still running. Recorded counts lag physical movement, which is the
 * ordinary state of a shop floor at any moment and part of what the tool exists
 * to surface. Open entries carry no unaccounted figure because the shift has
 * not been closed.
 */
const TODAY_B_SHIFT: Array<{
  stageId: StageId;
  received: number;
  passed: number;
  rejected: number;
  rework: number;
}> = [
  { stageId: 'POUR', received: 9240, passed: 8900, rejected: 90, rework: 10 },
  { stageId: 'KNOCKOUT', received: 8900, passed: 6480, rejected: 50, rework: 20 },
  // The walkthrough entry. Nothing passed forward yet, one rework hold recorded.
  { stageId: 'FETTLE', received: 6480, passed: 0, rejected: 0, rework: 40 },
  { stageId: 'BLAST', received: 5600, passed: 5240, rejected: 20, rework: 10 },
  { stageId: 'VISUAL', received: 5240, passed: 4780, rejected: 180, rework: 40 },
  { stageId: 'MACHINE', received: 4780, passed: 4320, rejected: 80, rework: 30 },
  { stageId: 'FINAL', received: 4320, passed: 4050, rejected: 40, rework: 10 },
  { stageId: 'DISPATCH', received: 4050, passed: 3880, rejected: 0, rework: 0 },
];

const TODAY_A_VARIANCE: Partial<Record<StageId, VarianceCode>> = {
  KNOCKOUT: 'NOT_YET_MOVED',
  FETTLE: 'MISCOUNT_PREV',
  VISUAL: 'RECOUNT_PENDING',
  MACHINE: 'UNKNOWN',
  FINAL: 'MIXED_BATCH',
  DISPATCH: 'NOT_YET_MOVED',
};

function buildToday(rand: () => number): StageEntry[] {
  const out: StageEntry[] = [];

  TODAY_A_SHIFT.forEach((draft) => {
    const partId = parts[Math.floor(rand() * parts.length) % parts.length].id;
    const entry = makeEntry(DEMO_TODAY, 'A', draft, partId, rand);
    if (TODAY_A_VARIANCE[draft.stageId] && entry.status !== 'clean') {
      entry.varianceReason = TODAY_A_VARIANCE[draft.stageId];
    }
    out.push(entry);
  });

  TODAY_B_SHIFT.forEach((row) => {
    const partId = parts[Math.floor(rand() * parts.length) % parts.length].id;
    out.push({
      id: `${DEMO_TODAY}-B-${row.stageId}`,
      date: DEMO_TODAY,
      shiftId: 'B',
      stageId: row.stageId,
      partId,
      operatorId: operatorFor(row.stageId, 'B'),
      received: row.received,
      openingCarry: 0,
      passed: row.passed,
      rejected: row.rejected,
      rejectBreakdown: breakdownFor(row.stageId, row.rejected),
      heldRework: row.rework,
      unaccounted: 0,
      status: 'open',
      closedAt: undefined,
      ownerAction: 'none',
    });
  });

  return out;
}

export interface SeedResult {
  entries: StageEntry[];
  history: DailyRecord[];
}

export function buildSeed(): SeedResult {
  const rand = mulberry32(20260804);
  const entries: StageEntry[] = [];
  const history: DailyRecord[] = [];

  // Thirty completed days ending yesterday.
  for (let back = 30; back >= 1; back -= 1) {
    const date = addDays(DEMO_TODAY, -back);
    const sunday = isSunday(date);

    const wobble = 1 + (rand() - 0.5) * 0.08;
    const poured = Math.round(plantConfig.dailyMouldsPoured * (sunday ? 0.62 : 1) * wobble);

    // One day that a viewer will notice and ask about.
    const spike = back === 14 ? 1.68 : 1;
    const unaccountedRate = 0.1527 * (1 + (rand() - 0.5) * 0.16) * spike * (sunday ? 0.94 : 1);
    const unaccounted = Math.round(poured * unaccountedRate);
    const rejected = Math.round(poured * 0.0387 * (1 + (rand() - 0.5) * 0.2));
    const rework = Math.round(poured * 0.0099 * (1 + (rand() - 0.5) * 0.24));

    // Anything older than two days has already been through the owner.
    const ownerAction: StageEntry['ownerAction'] = back >= 2 ? 'accepted' : 'none';

    const built = buildCompletedDay(
      date,
      { poured, rejected, rework, unaccounted },
      rand,
      ownerAction,
    );
    entries.push(...built.entries);
    history.push(built.record);
  }

  // Yesterday's C shift closed at 06:00 this morning and has not been looked at.
  entries.forEach((e) => {
    if (e.date === addDays(DEMO_TODAY, -1) && e.shiftId === 'C') e.ownerAction = 'none';
  });

  entries.push(...buildToday(rand));

  assertSeedBalances(entries, history);
  return { entries, history };
}

/**
 * Runs on load. A viewer who adds the columns will find that they balance, and
 * if a future edit breaks that, this stops the application rather than showing
 * figures that do not add up.
 */
export function assertSeedBalances(entries: StageEntry[], history: DailyRecord[]): void {
  const fail = (message: string): never => {
    throw new Error(`Seed data does not reconcile: ${message}`);
  };

  for (const e of entries) {
    if (e.status === 'open') continue;
    const computed = unaccountedOf({
      received: e.received,
      openingCarry: e.openingCarry,
      passed: e.passed,
      rejected: e.rejected,
      heldRework: e.heldRework,
    });
    if (computed !== e.unaccounted) {
      fail(`${e.id} reads ${e.unaccounted} unaccounted, the columns give ${computed}`);
    }
    if (e.passed < 0) fail(`${e.id} passes forward a negative count`);
    const breakdownSum = Object.values(e.rejectBreakdown).reduce((a, b) => a + (b ?? 0), 0);
    if (breakdownSum !== e.rejected) {
      fail(`${e.id} rejects ${e.rejected} but the reason codes account for ${breakdownSum}`);
    }
  }

  for (const day of history) {
    const sum = day.dispatched + day.rejected + day.reworked + day.unaccounted;
    if (sum !== day.poured) {
      fail(`${day.date} poured ${day.poured} but the four categories account for ${sum}`);
    }
  }

  // The stage chain must be continuous within every completed shift.
  const closed = entries.filter((e) => e.status !== 'open');
  const grouped = new Map<string, StageEntry[]>();
  for (const e of closed) {
    const key = `${e.date}-${e.shiftId}`;
    const list = grouped.get(key) ?? [];
    list.push(e);
    grouped.set(key, list);
  }
  for (const [key, list] of grouped) {
    const ordered = list
      .slice()
      .sort(
        (a, b) =>
          stages.findIndex((s) => s.id === a.stageId) - stages.findIndex((s) => s.id === b.stageId),
      );
    for (let i = 1; i < ordered.length; i += 1) {
      if (ordered[i].received !== ordered[i - 1].passed) {
        fail(
          `${key} breaks between ${ordered[i - 1].stageId} and ${ordered[i].stageId}, ` +
            `${ordered[i - 1].passed} passed forward against ${ordered[i].received} received`,
        );
      }
    }
  }

  // The part mix must reconcile to the single average casting weight in plantConfig.
  const mixWeight = parts.reduce((acc, p) => acc + p.weightKg * p.mixShare, 0);
  const mixShare = parts.reduce((acc, p) => acc + p.mixShare, 0);
  if (Math.abs(mixShare - 1) > 0.0001) fail(`part mix shares total ${mixShare}, not 1`);
  if (Math.abs(mixWeight - plantConfig.averageCastingWeightKg) > 0.06) {
    fail(
      `part mix averages ${mixWeight.toFixed(3)} kg against ` +
        `${plantConfig.averageCastingWeightKg} kg in plantConfig`,
    );
  }

  // The guided walkthrough depends on this entry landing on exactly 190.
  const walk = entries.find((e) => e.id === WALKTHROUGH_ENTRY_ID);
  if (!walk) fail(`walkthrough entry ${WALKTHROUGH_ENTRY_ID} is missing`);
  const walkResult = unaccountedOf({
    received: walk!.received,
    openingCarry: walk!.openingCarry,
    passed: WALKTHROUGH_PASSED,
    rejected: WALKTHROUGH_REJECTED,
    heldRework: walk!.heldRework,
  });
  if (walkResult !== WALKTHROUGH_UNACCOUNTED) {
    fail(
      `walkthrough step 8 needs ${WALKTHROUGH_UNACCOUNTED} unaccounted, the seed gives ${walkResult}`,
    );
  }
}
