import { INPUT_RATIO, INPUT_TOLERANCE } from '@/features/ppic/domain/constants';
import { round } from '@/features/ppic/domain/dates';
import type { ValidationMode } from '@/features/ppic/domain/types';

type DraftRecord = Record<string, unknown>;

export interface ArrivalDraftLike extends DraftRecord {
  qcChecklist: DraftRecord;
}

export interface ProductionDraftLike extends DraftRecord {
  date: string;
  oilKg?: number | string;
  bcUsedKg?: number | string;
  fcUsedKg?: number | string;
  ccnoQC: DraftRecord;
  excQC: DraftRecord;
}

export interface ProductionValidationContext {
  eventMap: Record<string, unknown>;
  stock: {
    bcStock: number;
    fcStock: number;
  };
}

export function validateArrivalDraft(draft: ArrivalDraftLike) {
  const required = ['materialType', 'date', 'quantityKg', 'supplierName', 'vehicleNumber', 'waybillTicket', 'driverName', 'qcPassed'];
  const errors = required.filter((key) => !String(draft[key] ?? '').trim()).map((key) => `${key} is required`);
  Object.entries(draft.qcChecklist).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) errors.push(`QC field ${key} is required`);
  });
  return errors;
}

export function validateProductionDraft(
  draft: ProductionDraftLike,
  derived: ProductionValidationContext,
  validationMode: ValidationMode
) {
  const blocking: string[] = [];
  const warnings: string[] = [];

  ['date', 'oilKg', 'bcUsedKg', 'fcUsedKg', 'ccnoQCPassed', 'excQCPassed'].forEach((key) => {
    if (draft[key] === '' || draft[key] === null || draft[key] === undefined) blocking.push(`${key} is required`);
  });
  Object.entries(draft.ccnoQC).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) blocking.push(`CCNO-T QC ${key} is required`);
  });
  Object.entries(draft.excQC).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) blocking.push(`EXC QC ${key} is required`);
  });

  if (derived.eventMap[draft.date]) blocking.push('Production cannot be saved on holiday or maintenance days.');

  const expected = Number(draft.oilKg || 0) * INPUT_RATIO;
  const actual = Number(draft.bcUsedKg || 0) + Number(draft.fcUsedKg || 0);
  const delta = Math.abs(expected - actual);
  if (delta > INPUT_TOLERANCE) {
    const message = `Input mismatch exceeds tolerance (${formatKg(delta)} kg).`;
    if (validationMode === 'block') blocking.push(message);
    else warnings.push(message);
  }
  if (Number(draft.bcUsedKg || 0) > derived.stock.bcStock) warnings.push('White Copra usage exceeds available stock.');
  if (Number(draft.fcUsedKg || 0) > derived.stock.fcStock) warnings.push('Fresh Coconut usage exceeds available stock.');

  return { blocking, warnings };
}

function formatKg(value: number) {
  return round(Number(value || 0)).toLocaleString('en-US', { maximumFractionDigits: 2 });
}
