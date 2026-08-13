/**
 * Single source of truth for every plant assumption in this demonstration.
 *
 * None of these figures were measured at Kestrel Castings. They are drawn
 * from typical practice at an Indian ferrous foundry supplying engine components
 * and are expected to change once the line is walked.
 *
 * Nothing in this object may be duplicated elsewhere in the codebase. Change a
 * value here and the entire demonstration follows.
 */

export interface ShiftDef {
  id: 'A' | 'B' | 'C';
  label: string;
  start: string;
  end: string;
}

export interface PlantConfig {
  clientName: string;
  plantLocation: string;
  demoDate: string;

  dailyMouldsPoured: number;
  dailyDispatched: number;

  averageCastingWeightKg: number;
  landedCostPerKg: number;
  scrapRecoveryPerKg: number;

  shifts: ShiftDef[];

  varianceToleranceUnits: number;
  supervisorApprovalThreshold: number;
  photoRequiredRejectThreshold: number;
}

export const plantConfig: PlantConfig = {
  clientName: 'Kestrel Castings',
  plantLocation: 'Hosur, Tamil Nadu',
  demoDate: '2026-08-04',

  // Daily throughput
  dailyMouldsPoured: 52400,
  dailyDispatched: 41850,

  // Costing basis
  averageCastingWeightKg: 3.2,
  landedCostPerKg: 82, // INR
  scrapRecoveryPerKg: 31, // INR, credit against melt loss

  // Shift structure
  shifts: [
    { id: 'A', label: 'A Shift', start: '06:00', end: '14:00' },
    { id: 'B', label: 'B Shift', start: '14:00', end: '22:00' },
    { id: 'C', label: 'C Shift', start: '22:00', end: '06:00' },
  ],

  // Variance thresholds
  varianceToleranceUnits: 25, // below this, closure passes silently
  supervisorApprovalThreshold: 100, // above this, supervisor PIN required
  photoRequiredRejectThreshold: 50, // above this, reject batch needs a photo
};

/** Landed cost of one finished casting. Derived, never hardcoded. */
export const costPerUnit = plantConfig.averageCastingWeightKg * plantConfig.landedCostPerKg;

/** Value recovered when a casting returns to the melt as scrap. Derived. */
export const scrapCreditPerUnit =
  plantConfig.averageCastingWeightKg * plantConfig.scrapRecoveryPerKg;

/** Net loss on one casting that leaves the line and cannot be sold. Derived. */
export const netLossPerUnit = costPerUnit - scrapCreditPerUnit;

/**
 * A one line basis for each assumption, shown in the owner side assumptions
 * drawer. Keys match the plantConfig keys they explain.
 */
export const assumptionBasis: Record<string, string> = {
  clientName: 'Supplied by the plant.',
  plantLocation: 'Supplied by the plant.',
  demoDate: 'Date this demonstration was prepared.',
  dailyMouldsPoured: 'Stated by the plant in conversation. Not yet read off a pouring log.',
  dailyDispatched: 'Stated by the plant in conversation. Not yet read off a dispatch register.',
  averageCastingWeightKg:
    'Mid point of the four part numbers modelled here. Actual mix weight will differ.',
  landedCostPerKg:
    'Typical landed cost of grey iron including melt, labour, power and consumables, August 2026.',
  scrapRecoveryPerKg: 'Typical foundry return scrap rate against a returns melt.',
  shifts: 'Standard three shift pattern. Start and end times not yet confirmed with the plant.',
  varianceToleranceUnits:
    'Set at roughly 0.4 percent of a stage shift volume, so that ordinary counting error passes without friction.',
  supervisorApprovalThreshold:
    'Set at four times tolerance. Above this a difference is large enough to warrant a named approver.',
  photoRequiredRejectThreshold:
    'Set so that a routine reject passes quickly and a large one leaves visual evidence.',
};
