import { DEMO_TODAY } from '../data/seed';
import { stages } from '../data/stages';
import { addDays } from '../lib/format';
import type { Filters } from '../store/useStore';
import type { ShiftId, StageEntry, StageId } from '../types';

export interface Range {
  from: string;
  to: string;
  label: string;
}

export function resolveRange(range: Filters['range']): Range {
  if (range === 'week') {
    return { from: addDays(DEMO_TODAY, -6), to: DEMO_TODAY, label: 'Last 7 days' };
  }
  return { from: DEMO_TODAY, to: DEMO_TODAY, label: 'Today' };
}

/** The day an entry reached the office, which is when the shift closed. */
export function closedDate(entry: StageEntry): string {
  return entry.closedAt ? entry.closedAt.slice(0, 10) : entry.date;
}

export function inRange(entries: StageEntry[], range: Range, byClosedDate = false): StageEntry[] {
  return entries.filter((e) => {
    const date = byClosedDate ? closedDate(e) : e.date;
    return date >= range.from && date <= range.to;
  });
}

export interface Headline {
  poured: number;
  dispatched: number;
  rejected: number;
  reworked: number;
  unaccounted: number;
  inProcess: number;
}

export function headlineOf(entries: StageEntry[]): Headline {
  let poured = 0;
  let dispatched = 0;
  let rejected = 0;
  let reworked = 0;
  let unaccounted = 0;

  for (const e of entries) {
    if (e.stageId === 'POUR') poured += e.received + e.openingCarry;
    if (e.stageId === 'DISPATCH') dispatched += e.passed;
    rejected += e.rejected;
    reworked += e.heldRework;
    if (e.status !== 'open') unaccounted += e.unaccounted;
  }

  const inProcess = Math.max(0, poured - dispatched - rejected - reworked - unaccounted);
  return { poured, dispatched, rejected, reworked, unaccounted, inProcess };
}

export interface StageRow {
  stageId: StageId;
  name: string;
  received: number;
  lost: number;
  openVariances: number;
}

export function stageRowsOf(entries: StageEntry[]): StageRow[] {
  return stages.map((stage) => {
    const rows = entries.filter((e) => e.stageId === stage.id);
    let received = 0;
    let passed = 0;
    let openVariances = 0;

    for (const e of rows) {
      received += e.received + e.openingCarry;
      passed += e.passed;
      if (
        (e.status === 'variance' || e.status === 'approved_variance') &&
        e.ownerAction === 'none'
      ) {
        openVariances += 1;
      }
    }
    return {
      stageId: stage.id,
      name: stage.nameEn,
      received,
      lost: Math.max(0, received - passed),
      openVariances,
    };
  });
}

export interface ShiftRow {
  shiftId: ShiftId;
  unaccounted: number;
}

/**
 * Comparing shifts needs more than one part day, so this always reads the last
 * seven completed days and the panel says so.
 */
export function shiftRowsOf(entries: StageEntry[]): ShiftRow[] {
  const from = addDays(DEMO_TODAY, -7);
  const to = addDays(DEMO_TODAY, -1);
  const shiftIds: ShiftId[] = ['A', 'B', 'C'];

  return shiftIds.map((shiftId) => ({
    shiftId,
    unaccounted: entries
      .filter((e) => e.date >= from && e.date <= to && e.shiftId === shiftId && e.status !== 'open')
      .reduce((acc, e) => acc + e.unaccounted, 0),
  }));
}

/** Closures with a difference the owner has not dealt with yet. */
export function attentionOf(entries: StageEntry[], range: Range): StageEntry[] {
  return inRange(entries, range, true)
    .filter(
      (e) =>
        (e.status === 'variance' || e.status === 'approved_variance') && e.ownerAction === 'none',
    )
    /* Newest first. A shift that just closed is the one being talked about. */
    .sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''));
}
