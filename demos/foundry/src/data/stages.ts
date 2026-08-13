import type { StageDef, StageId } from '../types';

/**
 * Eight sequential checkpoints. Each has an operator who counts, and each is a
 * boundary where units can leave the line.
 *
 * The flow itself is an assumption. It follows common practice for a ferrous
 * foundry with an attached machining shop and has not been checked against the
 * Kestrel line.
 */
export const stages: StageDef[] = [
  {
    id: 'POUR',
    order: 1,
    nameKey: 'stage.POUR',
    roleKey: 'role.POUR',
    nameEn: 'Melting and Pouring',
    roleEn: 'Furnace Operator',
    icon: 'Flame',
    basis: 'Count taken off the pouring log at the end of each ladle run.',
  },
  {
    id: 'KNOCKOUT',
    order: 2,
    nameKey: 'stage.KNOCKOUT',
    roleKey: 'role.KNOCKOUT',
    nameEn: 'Knockout and Shakeout',
    roleEn: 'Shakeout Operator',
    icon: 'Hammer',
    basis: 'Count taken as castings come off the shakeout grid onto the conveyor.',
  },
  {
    id: 'FETTLE',
    order: 3,
    nameKey: 'stage.FETTLE',
    roleKey: 'role.FETTLE',
    nameEn: 'Fettling and Grinding',
    roleEn: 'Fettling Operator',
    icon: 'Wrench',
    basis: 'Count taken at the fettling bay outfeed rack.',
  },
  {
    id: 'BLAST',
    order: 4,
    nameKey: 'stage.BLAST',
    roleKey: 'role.BLAST',
    nameEn: 'Shot Blasting',
    roleEn: 'Blast Operator',
    icon: 'Wind',
    basis: 'Count taken per blast basket, multiplied by baskets run.',
  },
  {
    id: 'VISUAL',
    order: 5,
    nameKey: 'stage.VISUAL',
    roleKey: 'role.VISUAL',
    nameEn: 'Visual and Dimensional Inspection',
    roleEn: 'Inspector',
    icon: 'Eye',
    basis: 'Count taken at the inspection bench, against the gauge sheet.',
  },
  {
    id: 'MACHINE',
    order: 6,
    nameKey: 'stage.MACHINE',
    roleKey: 'role.MACHINE',
    nameEn: 'CNC Machining',
    roleEn: 'Machine Operator',
    icon: 'Cog',
    basis: 'Count taken off the machine counter at the end of each run.',
  },
  {
    id: 'FINAL',
    order: 7,
    nameKey: 'stage.FINAL',
    roleKey: 'role.FINAL',
    nameEn: 'Final Inspection and Leak Test',
    roleEn: 'Quality Inspector',
    icon: 'ShieldCheck',
    basis: 'Count taken off the leak test rig log.',
  },
  {
    id: 'DISPATCH',
    order: 8,
    nameKey: 'stage.DISPATCH',
    roleKey: 'role.DISPATCH',
    nameEn: 'Packing and Dispatch',
    roleEn: 'Stores In-charge',
    icon: 'Package',
    basis: 'Count taken off the packing list against the lorry receipt.',
  },
];

export const stageIds: StageId[] = stages.map((s) => s.id);

export const stageById: Record<StageId, StageDef> = stages.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<StageId, StageDef>,
);

export function previousStage(id: StageId): StageDef | null {
  const stage = stageById[id];
  return stages.find((s) => s.order === stage.order - 1) ?? null;
}

export function nextStage(id: StageId): StageDef | null {
  const stage = stageById[id];
  return stages.find((s) => s.order === stage.order + 1) ?? null;
}
