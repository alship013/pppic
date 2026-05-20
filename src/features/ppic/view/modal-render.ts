import { INPUT_RATIO, BYPRODUCT_RATIO } from '@/features/ppic/domain/constants';
import type { DayDetail, ArrivalDraft, ProductionDraft, EventDraft } from '@/features/ppic/domain/types';
import type { DerivedState } from '@/features/ppic/domain/derived';
import { fieldInput, fieldSelect, iconClose } from '@/features/ppic/view/ui-fragments';

export function renderDayDrawer(detail: DayDetail, formatKg: (value: number) => string) {
  return `
    <div class="fixed inset-0 z-50 flex justify-end bg-slate-950/35 modal-backdrop">
      <div class="h-full w-full max-w-lg overflow-y-auto border-l border-white/70 bg-white p-6 shadow-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Day detail</p>
            <h3 class="mt-2 font-display text-2xl font-bold">${detail.dateLabel}</h3>
          </div>
          <button data-close-day="true" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
        </div>
        <div class="mt-6 space-y-5 text-sm text-slate-600">
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">Plan</p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>Target oil: <strong class="text-slate-900">${formatKg(detail.targetOil)} kg</strong></div>
              <div>Input required: <strong class="text-slate-900">${formatKg(detail.targetOil * INPUT_RATIO)} kg</strong></div>
            </div>
          </div>
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">Actual</p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>Oil: <strong class="text-slate-900">${formatKg(detail.actualOil)} kg</strong></div>
              <div>EXC: <strong class="text-slate-900">${formatKg(detail.excProduced)} kg</strong></div>
              <div>BC used: <strong class="text-slate-900">${formatKg(detail.bcUsed)} kg</strong></div>
              <div>FC used: <strong class="text-slate-900">${formatKg(detail.fcUsed)} kg</strong></div>
            </div>
          </div>
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">QC</p>
            <div class="mt-3 space-y-2">
              <div>CCNO-T: <strong class="text-slate-900">${detail.ccnoStatus}</strong></div>
              <div>EXC: <strong class="text-slate-900">${detail.excStatus}</strong></div>
            </div>
          </div>
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">Deliveries</p>
            <div class="mt-3 space-y-3">
              ${detail.deliveries.length ? detail.deliveries.map((delivery) => `<div class="rounded-2xl border border-slate-200 bg-white p-3"><div class="font-semibold text-slate-900">${delivery.materialType} â€¢ ${formatKg(delivery.quantityKg)} kg</div><div class="text-xs text-slate-500">${delivery.supplierName} â€¢ ${delivery.qcPassed ? 'PASS' : 'FAIL'}</div></div>`).join('') : '<div>No deliveries logged.</div>'}
            </div>
          </div>
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">Events</p>
            <div class="mt-3">${detail.eventSummary}</div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button data-edit-production="${detail.date}" class="rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-brand-600">Edit production</button>
            <button data-open-event="${detail.date}" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Mark holiday / maintenance</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderArrivalModal(draft: ArrivalDraft) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 modal-backdrop p-4">
      <div class="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-6 shadow-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Arrival</p>
            <h3 class="mt-2 font-display text-2xl font-bold">Receive and QC raw materials</h3>
          </div>
          <button data-close-arrival="true" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
        </div>
        <form id="arrival-form" class="mt-6 space-y-6">
          <div class="grid gap-4 md:grid-cols-3">
            ${fieldSelect('Material type', 'materialType', 'arrival-material', draft.materialType, ['White Copra', 'Fresh Coconut'])}
            ${fieldInput('Date', 'date', 'date', draft.date)}
            ${fieldInput('Quantity (kg)', 'quantityKg', 'number', draft.quantityKg, '0', '1')}
            ${fieldInput('Supplier name', 'supplierName', 'text', draft.supplierName)}
            ${fieldInput('Vehicle number', 'vehicleNumber', 'text', draft.vehicleNumber)}
            ${fieldInput('Waybill ticket', 'waybillTicket', 'text', draft.waybillTicket)}
            ${fieldInput('Driver name', 'driverName', 'text', draft.driverName)}
            ${fieldSelect('QC Result', 'qcPassed', '', draft.qcPassed, [{ label: 'PASS', value: 'true' }, { label: 'FAIL', value: 'false' }])}
          </div>
          <div class="rounded-[28px] bg-slate-50 p-5">
            <p class="font-display text-lg font-semibold">${draft.materialType} checklist</p>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              ${draft.materialType === 'Fresh Coconut' ? renderFreshCoconutFields(draft.qcChecklist) : renderWhiteCopraFields(draft.qcChecklist)}
            </div>
          </div>
          <div class="flex items-center justify-end gap-3">
            <button type="button" data-close-arrival="true" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Cancel</button>
            <button type="submit" class="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-slate-800">Save delivery</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderProductionModal(
  draft: ProductionDraft,
  derived: DerivedState,
  formatKg: (value: number) => string
) {
  const dayEvent = derived.eventMap[draft.date];
  const target = derived.dailyTargets[draft.date] || 0;
  const expectedInput = Number(draft.oilKg || 0) * INPUT_RATIO;
  const actualInput = Number(draft.bcUsedKg || 0) + Number(draft.fcUsedKg || 0);
  const excProduced = Number(draft.oilKg || 0) * BYPRODUCT_RATIO;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 modal-backdrop p-4">
      <div class="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-6 shadow-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Production</p>
            <h3 class="mt-2 font-display text-2xl font-bold">Record output and finished product QC</h3>
          </div>
          <button data-close-production="true" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
        </div>
        ${dayEvent ? `<div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">${dayEvent.type} day: ${dayEvent.label}. Production save is blocked.</div>` : ''}
        <form id="production-form" class="mt-6 space-y-6">
          <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div class="rounded-[28px] bg-slate-50 p-5">
              <p class="font-display text-lg font-semibold">Production output</p>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                ${fieldInput('Date', 'date', 'date', draft.date)}
                ${fieldInput('Oil produced (kg)', 'oilKg', 'number', draft.oilKg, '0', '1')}
                ${fieldInput('White Copra used (kg)', 'bcUsedKg', 'number', draft.bcUsedKg, '0', '1')}
                ${fieldInput('Fresh Coconut used (kg)', 'fcUsedKg', 'number', draft.fcUsedKg, '0', '1')}
              </div>
              <div class="mt-5 grid gap-3 md:grid-cols-2 text-sm text-slate-600">
                <div class="rounded-2xl bg-white p-4">Target today: <strong id="preview-target" class="text-slate-900">${formatKg(target)} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">Expected input: <strong id="preview-expected" class="text-slate-900">${formatKg(expectedInput)} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">Actual input: <strong id="preview-actual-input" class="text-slate-900">${formatKg(actualInput)} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">EXC produced: <strong id="preview-exc" class="text-slate-900">${formatKg(excProduced)} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">BC after save: <strong id="preview-bc-after" class="text-slate-900">${formatKg(derived.stock.bcStock - Number(draft.bcUsedKg || 0))} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">FC after save: <strong id="preview-fc-after" class="text-slate-900">${formatKg(derived.stock.fcStock - Number(draft.fcUsedKg || 0))} kg</strong></div>
              </div>
            </div>
            <div class="rounded-[28px] bg-slate-50 p-5">
              <p class="font-display text-lg font-semibold">CCNO-T QC</p>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                ${fieldSelect('Colour', 'ccno.colour', '', draft.ccnoQC.colour, ['clear', 'light yellow', 'golden', 'amber', 'brown'])}
                ${fieldSelect('Smell', 'ccno.smell', '', draft.ccnoQC.smell, ['pass', 'fail'])}
                ${fieldInput('M&I (%)', 'ccno.moistureImpurities', 'number', draft.ccnoQC.moistureImpurities, '0', '0.01')}
                ${fieldInput('FFA (%)', 'ccno.ffa', 'number', draft.ccnoQC.ffa, '0', '0.01')}
                ${fieldInput('PV (meq/kg)', 'ccno.peroxideValue', 'number', draft.ccnoQC.peroxideValue, '0', '0.01')}
                ${fieldInput('Aflatoxin', 'ccno.aflatoxin', 'text', draft.ccnoQC.aflatoxin)}
                ${fieldSelect('CCNO-T result', 'ccnoQCPassed', '', draft.ccnoQCPassed, [{ label: 'PASS', value: 'true' }, { label: 'FAIL', value: 'false' }])}
              </div>
              <p class="mt-6 font-display text-lg font-semibold">EXC QC</p>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                ${fieldInput('Moisture (%)', 'exc.moisture', 'number', draft.excQC.moisture, '0', '0.01')}
                ${fieldInput('Residual oil (%)', 'exc.residualOilContent', 'number', draft.excQC.residualOilContent, '0', '0.01')}
                ${fieldSelect('Appearance', 'exc.appearance', '', draft.excQC.appearance, ['pass', 'fail'])}
                ${fieldSelect('EXC result', 'excQCPassed', '', draft.excQCPassed, [{ label: 'PASS', value: 'true' }, { label: 'FAIL', value: 'false' }])}
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3">
            <button type="button" data-close-production="true" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Cancel</button>
            <button type="submit" class="rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-brand-600">Save production</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderEventModal(draft: EventDraft) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 modal-backdrop p-4">
      <div class="w-full max-w-lg rounded-[32px] border border-white/70 bg-white p-6 shadow-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Calendar event</p>
            <h3 class="mt-2 font-display text-2xl font-bold">Mark holiday or maintenance</h3>
          </div>
          <button data-close-event="true" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
        </div>
        <form id="event-form" class="mt-6 space-y-4">
          ${fieldInput('Date', 'date', 'date', draft.date)}
          ${fieldSelect('Type', 'type', '', draft.type, ['holiday', 'maintenance'])}
          ${fieldInput('Label', 'label', 'text', draft.label)}
          <div class="flex items-center justify-end gap-3">
            <button type="button" data-close-event="true" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Cancel</button>
            <button type="submit" class="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-slate-800">Save event</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderFreshCoconutFields(qc: Record<string, string | number>) {
  return [
    fieldSelect('Moisture level', 'qc.moistureLevel', '', qc.moistureLevel, ['pass', 'fail']),
    fieldSelect('Coconut maturity', 'qc.coconutMaturity', '', qc.coconutMaturity, ['young', 'mengkal', 'old', 'mixed']),
    fieldSelect('Impurities', 'qc.impurities', '', qc.impurities, ['pass', 'fail']),
    fieldInput('Defect coconut qty', 'qc.defectCoconutQty', 'number', qc.defectCoconutQty, '0', '1'),
    fieldInput('Reject coconut qty', 'qc.rejectCoconutQty', 'number', qc.rejectCoconutQty, '0', '1'),
    fieldSelect('Truck cleanliness', 'qc.truckCleanliness', '', qc.truckCleanliness, ['pass', 'fail']),
    fieldSelect('Cover in truck', 'qc.coverInTruck', '', qc.coverInTruck, ['pass', 'fail']),
    fieldSelect('Handling method', 'qc.handlingMethod', '', qc.handlingMethod, ['pass', 'fail']),
    fieldSelect('Storage method', 'qc.storageMethod', '', qc.storageMethod, ['pass', 'fail']),
    fieldSelect('Cover in storage', 'qc.coverInStorage', '', qc.coverInStorage, ['pass', 'fail']),
    fieldInput('Unloading photo ref', 'qc.unloadingPhoto', 'text', qc.unloadingPhoto),
  ].join('');
}

function renderWhiteCopraFields(qc: Record<string, string | number>) {
  return [
    fieldInput('Batch ID', 'qc.batchId', 'text', qc.batchId),
    fieldInput('Tonnage oven input', 'qc.tonnageOvenInput', 'number', qc.tonnageOvenInput, '0', '1'),
    fieldInput('Tonnage oven output', 'qc.tonnageOvenOutput', 'number', qc.tonnageOvenOutput, '0', '1'),
    fieldInput('Moisture input (%)', 'qc.moistureInput', 'number', qc.moistureInput, '0', '0.01'),
    fieldInput('Moisture output (%)', 'qc.moistureOutput', 'number', qc.moistureOutput, '0', '0.01'),
    fieldInput('FFA (%)', 'qc.ffa', 'number', qc.ffa, '0', '0.01'),
    fieldSelect('Colour', 'qc.colour', '', qc.colour, ['white', 'yellow', 'brown']),
    fieldInput('Reduction (%)', 'qc.reductionPercentage', 'number', qc.reductionPercentage, '0', '0.01'),
    fieldInput('Temperature', 'qc.temperature', 'number', qc.temperature, '0', '0.1'),
    fieldSelect('Fungus', 'qc.fungus', '', qc.fungus, ['pass', 'fail']),
    fieldSelect('Char / smoke residue', 'qc.charSmokeResidue', '', qc.charSmokeResidue, ['pass', 'fail']),
    fieldInput('Oil content (%)', 'qc.oilContent', 'number', qc.oilContent, '0', '0.01'),
    fieldInput('Meat thickness', 'qc.meatThickness', 'text', qc.meatThickness),
    fieldSelect('Insect damage', 'qc.insectDamage', '', qc.insectDamage, ['pass', 'fail']),
    fieldSelect('Storage after hotroom', 'qc.storageAfterHotroom', '', qc.storageAfterHotroom, ['pass', 'fail']),
    fieldInput('Batch photo ref', 'qc.batchPhoto', 'text', qc.batchPhoto),
    fieldInput('Rejected qty (kg)', 'qc.rejectedQtyKg', 'number', qc.rejectedQtyKg, '0', '1'),
    fieldInput('Reject reason', 'qc.rejectReason', 'text', qc.rejectReason),
  ].join('');
}
