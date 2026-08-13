import type { Operator, Part, Supervisor } from '../types';

/**
 * Eleven operators across eight stages and three shifts. Six of the eleven
 * prefer a language other than Tamil, which is the reason the language layer
 * exists. The migrant workforce is shown using it, not merely offered it.
 */
export const operators: Operator[] = [
  { id: 'KC-2041', name: 'Murugan Selvaraj', stageId: 'POUR', locale: 'ta', shiftId: 'A' },
  { id: 'KC-2118', name: 'Anbarasan Kalyanam', stageId: 'KNOCKOUT', locale: 'ta', shiftId: 'A' },
  { id: 'KC-2263', name: 'Vetrivel Arumugam', stageId: 'FETTLE', locale: 'ta', shiftId: 'B' },
  { id: 'KC-2307', name: 'Rajendra Nayak', stageId: 'BLAST', locale: 'or', shiftId: 'B' },
  { id: 'KC-2412', name: 'Lakshmi Priya Venkatesan', stageId: 'VISUAL', locale: 'ta', shiftId: 'A' },
  { id: 'KC-2455', name: 'Dinesh Barman', stageId: 'MACHINE', locale: 'bn', shiftId: 'B' },
  { id: 'KC-2519', name: 'Karthikeyan Ramasamy', stageId: 'FINAL', locale: 'ta', shiftId: 'A' },
  { id: 'KC-2604', name: 'Suresh Patil', stageId: 'DISPATCH', locale: 'mr', shiftId: 'A' },
  { id: 'KC-2688', name: 'Sushil Kumar Mahato', stageId: 'POUR', locale: 'bho', shiftId: 'C' },
  { id: 'KC-2731', name: 'Ramesh Tudu', stageId: 'FETTLE', locale: 'or', shiftId: 'C' },
  { id: 'KC-2790', name: 'Ashok Yadav', stageId: 'MACHINE', locale: 'hi', shiftId: 'C' },
];

export const operatorById = operators.reduce(
  (acc, o) => {
    acc[o.id] = o;
    return acc;
  },
  {} as Record<string, Operator>,
);

export const supervisors: Supervisor[] = [
  { id: 'KC-1104', name: 'Balasubramanian Iyer', shiftId: 'A' },
  { id: 'KC-1112', name: 'Mohan Kumar Reddy', shiftId: 'B' },
  { id: 'KC-1127', name: 'Jagdish Prasad Singh', shiftId: 'C' },
];

export const supervisorById = supervisors.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, Supervisor>,
);

export function supervisorForShift(shiftId: Supervisor['shiftId']): Supervisor {
  return supervisors.find((s) => s.shiftId === shiftId) ?? supervisors[0];
}

/**
 * Four part numbers. `mixShare` is the share of daily volume each part takes.
 * The shares are what reconcile the four part weights to the single average
 * casting weight held in plantConfig, and the seed file asserts that they do.
 */
export interface PartWithMix extends Part {
  mixShare: number;
}

export const parts: PartWithMix[] = [
  {
    id: 'CH410',
    code: 'KC-CH-410',
    description: 'Cylinder Head, four cylinder, grey iron',
    weightKg: 8.4,
    mixShare: 0.17,
  },
  {
    id: 'BC118',
    code: 'KC-BC-118',
    description: 'Main Bearing Cap, ductile iron',
    weightKg: 1.6,
    mixShare: 0.35,
  },
  {
    id: 'FH620',
    code: 'KC-FH-620',
    description: 'Flywheel Housing, grey iron',
    weightKg: 6.1,
    mixShare: 0.14,
  },
  {
    id: 'TB205',
    code: 'KC-TB-205',
    description: 'Turbocharger Mounting Bracket, ductile iron',
    weightKg: 1.1,
    mixShare: 0.34,
  },
];

export const partById = parts.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, PartWithMix>,
);
