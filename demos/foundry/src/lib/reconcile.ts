import { plantConfig, costPerUnit, netLossPerUnit } from '../config/plantConfig';
import type { ReconInput, ReconState } from '../types';

/**
 * The equation the whole application exists to enforce.
 *
 *   received + opening carry forward
 *     - passed to next stage
 *     - rejected
 *     - held for rework
 *   = unaccounted
 *
 * Pure, integer in and integer out, no dependency on React or the store.
 */
export function unaccountedOf(input: ReconInput): number {
  return (
    input.received + input.openingCarry - input.passed - input.rejected - input.heldRework
  );
}

/**
 * Which of the four closure states a figure falls into. Thresholds are read
 * from plantConfig and are never duplicated.
 *
 * A negative figure means more units left the stage than entered it, which is
 * just as much a counting failure as a shortfall, so magnitude decides the state.
 */
export function reconStateOf(unaccounted: number): ReconState {
  const magnitude = Math.abs(unaccounted);
  if (magnitude === 0) return 'balanced';
  if (magnitude <= plantConfig.varianceToleranceUnits) return 'tolerance';
  if (magnitude < plantConfig.supervisorApprovalThreshold) return 'variance';
  return 'approval';
}

export function requiresVarianceReason(unaccounted: number): boolean {
  const state = reconStateOf(unaccounted);
  return state === 'variance' || state === 'approval';
}

export function requiresSupervisorApproval(unaccounted: number): boolean {
  return reconStateOf(unaccounted) === 'approval';
}

export function requiresRejectPhoto(rejectCount: number): boolean {
  return rejectCount > plantConfig.photoRequiredRejectThreshold;
}

/** Landed value of a number of castings. */
export function valueOf(units: number): number {
  return Math.round(Math.abs(units) * costPerUnit);
}

/** Landed value less scrap recovery, for units that left the line as scrap. */
export function netLossOf(units: number): number {
  return Math.round(Math.abs(units) * netLossPerUnit);
}

/** Colour token for a closure state. Paired with an icon everywhere it is used. */
export const stateColour: Record<ReconState, string> = {
  balanced: '#2E8B57',
  tolerance: '#2E8B57',
  variance: '#C98A2E',
  approval: '#C4453A',
};

export const stateTextClass: Record<ReconState, string> = {
  balanced: 'text-signalgreen',
  tolerance: 'text-signalgreen',
  variance: 'text-signalamber',
  approval: 'text-signalred',
};

/** i18n key for the headline on the closure gate, per state. */
export const stateHeadlineKey: Record<ReconState, string> = {
  balanced: 'close.state.balanced',
  tolerance: 'close.state.tolerance',
  variance: 'close.state.variance',
  approval: 'close.state.approval',
};
