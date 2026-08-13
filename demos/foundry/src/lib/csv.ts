import { costPerUnit } from '../config/plantConfig';
import { operatorById, supervisorById, partById } from '../data/people';
import { stageById } from '../data/stages';
import { reasonByCode, varianceByCode } from '../data/reasons';
import type { StageEntry } from '../types';

const HEADERS = [
  'entry_id',
  'production_date',
  'shift',
  'stage',
  'operator_id',
  'operator_name',
  'part_number',
  'received',
  'opening_carry_forward',
  'passed_forward',
  'rejected',
  'held_for_rework',
  'unaccounted',
  'unaccounted_value_inr',
  'status',
  'variance_reason',
  'supervisor',
  'closed_at',
  'photograph',
  'owner_action',
  'reject_reasons',
];

function cell(value: string | number | undefined): string {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function entriesToCsv(entries: StageEntry[]): string {
  const lines = [HEADERS.join(',')];

  for (const e of entries) {
    const operator = operatorById[e.operatorId];
    const reasons = Object.entries(e.rejectBreakdown)
      .filter(([, count]) => (count ?? 0) > 0)
      .map(([code, count]) => `${reasonByCode[code as keyof typeof reasonByCode].labelEn}: ${count}`)
      .join('; ');

    lines.push(
      [
        e.id,
        e.date,
        e.shiftId,
        stageById[e.stageId].nameEn,
        e.operatorId,
        operator?.name ?? '',
        partById[e.partId]?.code ?? e.partId,
        e.received,
        e.openingCarry,
        e.passed,
        e.rejected,
        e.heldRework,
        e.status === 'open' ? '' : e.unaccounted,
        e.status === 'open' ? '' : Math.round(Math.abs(e.unaccounted) * costPerUnit),
        e.status,
        e.varianceReason ? varianceByCode[e.varianceReason].labelEn : '',
        e.supervisorId ? (supervisorById[e.supervisorId]?.name ?? e.supervisorId) : '',
        e.closedAt ?? '',
        e.photo ? e.photo.kind : '',
        e.ownerAction,
        reasons,
      ]
        .map(cell)
        .join(','),
    );
  }

  return lines.join('\n');
}

export function downloadCsv(filename: string, contents: string): void {
  const blob = new Blob([`﻿${contents}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
