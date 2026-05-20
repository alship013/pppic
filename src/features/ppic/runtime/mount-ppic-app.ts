import { createDefaultAppState as createDefaultAppStateLib, normalizeAppState as normalizeAppStateLib } from '@/features/ppic/domain/app-state';
import { BYPRODUCT_RATIO, INPUT_RATIO, STORAGE_KEY } from '@/features/ppic/domain/constants';
import { formatDateLong as formatDateLongLib, formatISO as formatISOLib, formatMonthKey as formatMonthKeyLib, formatMonthLong as formatMonthLongLib, round as roundLib } from '@/features/ppic/domain/dates';
import { buildDerivedState as buildDerivedStateLib } from '@/features/ppic/domain/derived';
import { normalizeWeekObjects as normalizeWeekObjectsLib, rebalanceWeeks as rebalanceWeeksLib } from '@/features/ppic/domain/planning';
import type { MaterialType, RuntimeState } from '@/features/ppic/domain/types';
import { validateArrivalDraft as validateArrivalDraftLib, validateProductionDraft as validateProductionDraftLib } from '@/features/ppic/domain/validation';
import { loadStoredAppState, persistStoredAppState } from '@/features/ppic/persistence/storage';
import { bindPlanControls as bindPlanControlsRuntime } from '@/features/ppic/runtime/bind-plan-controls';
import {
  appendDeliveryAction,
  applyAppStateAction,
  replaceWeeksAction,
  upsertDailyActualAction,
  upsertDayEventAction,
} from '@/features/ppic/state/app-state-actions';
import {
  closeArrivalDraft,
  closeEventDraft,
  closeManager,
  closeProductionDraft,
  openArrivalDraft,
  openEventDraft,
  openManager,
  openProductionDraft,
  patchArrivalDraftField,
  patchEventDraftField,
  patchProductionDraftField,
  replaceArrivalDraftMaterial,
  selectDate,
  setManagerTab,
  toggleSidebar,
} from '@/features/ppic/state/runtime-actions';
import { createRuntimeState } from '@/features/ppic/state/runtime-state';
import { renderCalendar as renderCalendarView } from '@/features/ppic/view/calendar-render';
import {
  renderAppHeader,
  renderCalendarSection,
  renderManagerShell,
  renderOperatorBar,
  renderOverviewSection,
  renderPlanningSummarySection,
  renderSidebar,
} from '@/features/ppic/view/dashboard-render';
import {
  renderInventoryTab as renderInventoryTabView,
  renderPlanTab as renderPlanTabView,
  renderReviewTab as renderReviewTabView,
} from '@/features/ppic/view/manager-panel-render';
import {
  renderArrivalModal as renderArrivalModalView,
  renderDayDrawer as renderDayDrawerView,
  renderEventModal as renderEventModalView,
  renderProductionModal as renderProductionModalView,
} from '@/features/ppic/view/modal-render';

export function mountPpicApp(rootElement: HTMLElement) {
const today = new Date();
const currentMonthKey = formatMonthKey(today);

const state: RuntimeState = createRuntimeState(loadAppState());

const appRoot = rootElement;
let persistTimer = 0;

function loadAppState() {
  return loadStoredAppState(STORAGE_KEY, normalizeAppState, createDefaultAppState);
}

function createDefaultAppState() {
  return createDefaultAppStateLib(today, currentMonthKey);
}

function normalizeAppState(input) {
  return normalizeAppStateLib(input, currentMonthKey);
}

function persistAppState() {
  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    persistStoredAppState(STORAGE_KEY, state.app);
  }, 150);
}

function dispatchAppState(action) {
  state.app = applyAppStateAction(state.app, normalizeAppState, action);
  persistAppState();
  render();
}

function render() {
  const derived = buildDerived(state.app);
  const selectedDate = state.selectedDate || formatISO(today);
  const dayDetail = buildDayDetail(selectedDate, state.app, derived);
  const calendarMarkup = renderCalendar(derived);
  const managerPanelMarkup = renderManagerPanel(derived);

  appRoot.innerHTML = `
    <div class="min-h-screen text-slate-900">
      ${renderAppHeader({ derived, formatTon })}

      <div class="flex min-h-[calc(100vh-73px)]">
        ${renderSidebar({
          sidebarCollapsed: state.sidebarCollapsed,
          activeManagerTab: state.activeManagerTab,
          validationMode: state.app.validationMode,
        })}

        <main class="relative flex-1 px-4 py-6 lg:px-6">
          <div class="mx-auto max-w-[1500px] space-y-6 pb-28">
            ${renderOverviewSection({
              planningMonth: state.app.planningMonth,
              monthlyTargetKg: state.app.monthlyTargetKg,
              derived,
              dayDetail,
              formatMonthLong,
              formatKg,
              formatPercent,
              round,
            })}
            ${renderCalendarSection({
              planningMonth: state.app.planningMonth,
              calendarMarkup,
              formatMonthLong,
            })}
            ${renderPlanningSummarySection({
              derived,
              formatKg,
              formatPercent,
              round,
            })}
          </div>
        </main>

        ${renderManagerShell({
          managerOpen: state.managerOpen,
          activeManagerTab: state.activeManagerTab,
          managerContent: managerPanelMarkup,
        })}
      </div>

      ${renderOperatorBar()}

      ${state.selectedDate ? renderDayDrawer(dayDetail) : ''}
      ${state.arrivalDraft ? renderArrivalModal() : ''}
      ${state.productionDraft ? renderProductionModal(derived) : ''}
      ${state.eventDraft ? renderEventModal() : ''}
    </div>
  `;

  bindGlobalEvents(derived);
}

function buildDerived(appState) {
  return buildDerivedStateLib(appState);
}

function bindGlobalEvents(derived) {
  document.querySelector('#sidebar-toggle')?.addEventListener('click', () => {
    toggleSidebar(state);
    render();
  });
  document.querySelector('#manager-toggle')?.addEventListener('click', () => {
    openManager(state);
    render();
  });
  document.querySelector('#manager-close')?.addEventListener('click', () => {
    closeManager(state);
    render();
  });
  document.querySelector('#open-arrival')?.addEventListener('click', () => {
    openArrivalDraft(state, formatISO(today));
    render();
  });
  document.querySelector('#open-production')?.addEventListener('click', () => {
    openProductionModal(formatISO(today));
  });

  document.querySelectorAll<HTMLElement>('[data-anchor]').forEach((button) => {
    button.addEventListener('click', () => {
      if (['plan', 'review', 'inventory'].includes(button.dataset.anchor)) {
        setManagerTab(state, asManagerTab(button.dataset.anchor));
      }
      const target = document.getElementById(button.dataset.anchor === 'review' ? 'plan' : button.dataset.anchor);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-manager-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      setManagerTab(state, asManagerTab(button.dataset.managerTab));
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-day]').forEach((button) => {
    button.addEventListener('click', () => {
      selectDate(state, button.dataset.day || null);
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-close-day]').forEach((button) => {
    button.addEventListener('click', () => {
      selectDate(state, null);
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-edit-production]').forEach((button) => {
    button.addEventListener('click', () => openProductionModal(button.dataset.editProduction));
  });

  document.querySelectorAll<HTMLElement>('[data-open-event]').forEach((button) => {
    button.addEventListener('click', () => {
      openEventDraft(state, { date: button.dataset.openEvent || '', type: 'holiday', label: '' });
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-reallocate]').forEach((button) => {
    button.addEventListener('click', () => reallocateRemaining(derived));
  });

  bindArrivalModal();
  bindProductionModal(derived);
  bindEventModal();
  bindPlanControlsRuntime({
    appState: state.app,
    dispatchAppState,
    applyWeekPreset,
    rebalanceWeeks,
  });
}

function bindArrivalModal() {
  if (!state.arrivalDraft) return;

  document.querySelectorAll<HTMLElement>('[data-close-arrival]').forEach((button) => {
    button.addEventListener('click', () => {
      closeArrivalDraft(state);
      render();
    });
  });

  document.querySelector('#arrival-material')?.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement;
    replaceArrivalDraftMaterial(state, asMaterialType(target.value));
    render();
  });

  document.querySelector('#arrival-form')?.addEventListener('input', handleArrivalDraftInput);
  document.querySelector('#arrival-form')?.addEventListener('change', handleArrivalDraftInput);
  document.querySelector('#arrival-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveArrivalDraft();
  });
}

function handleArrivalDraftInput(event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const { name, value } = target;
  patchArrivalDraftField(state, name, castInputValue(name, value));
}

function saveArrivalDraft() {
  const draft = state.arrivalDraft;
  const errors = validateArrivalDraft(draft);
  if (errors.length) {
    window.alert(errors.join('\n'));
    return;
  }

  const delivery = {
    id: crypto.randomUUID(),
    materialType: draft.materialType,
    quantityKg: Number(draft.quantityKg),
    supplierName: draft.supplierName,
    vehicleNumber: draft.vehicleNumber,
    waybillTicket: draft.waybillTicket,
    driverName: draft.driverName,
    qcPassed: draft.qcPassed === 'true',
    date: draft.date,
    qcChecklist: { ...draft.qcChecklist },
  };

  dispatchAppState(appendDeliveryAction(delivery));

  closeArrivalDraft(state);
  render();
}

function bindProductionModal(derived) {
  if (!state.productionDraft) return;

  document.querySelectorAll<HTMLElement>('[data-close-production]').forEach((button) => {
    button.addEventListener('click', () => {
      closeProductionDraft(state);
      render();
    });
  });

  document.querySelector('#production-form')?.addEventListener('input', handleProductionDraftInput);
  document.querySelector('#production-form')?.addEventListener('change', handleProductionDraftInput);
  document.querySelector('#production-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveProductionDraft(derived);
  });
}

function handleProductionDraftInput(event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const { name, value } = target;
  patchProductionDraftField(state, name, castInputValue(name, value));
  syncProductionPreview();
}

function saveProductionDraft(derived) {
  const draft = state.productionDraft;
  const errors = validateProductionDraft(draft, derived, state.app.validationMode);
  if (errors.blocking.length) {
    window.alert(errors.blocking.join('\n'));
    return;
  }
  if (errors.warnings.length) {
    const proceed = window.confirm(`Warnings:\n\n${errors.warnings.join('\n')}\n\nSave anyway?`);
    if (!proceed) return;
  }

  const entry = {
    oilKg: Number(draft.oilKg),
    bcUsedKg: Number(draft.bcUsedKg),
    fcUsedKg: Number(draft.fcUsedKg),
    excKg: round(Number(draft.oilKg) * BYPRODUCT_RATIO),
    ccnoQC: { ...draft.ccnoQC },
    excQC: { ...draft.excQC },
    ccnoQCPassed: draft.ccnoQCPassed === 'true',
    excQCPassed: draft.excQCPassed === 'true',
  };

  dispatchAppState(upsertDailyActualAction(draft.date, entry));

  closeProductionDraft(state);
  render();
}

function bindEventModal() {
  if (!state.eventDraft) return;

  document.querySelectorAll<HTMLElement>('[data-close-event]').forEach((button) => {
    button.addEventListener('click', () => {
      closeEventDraft(state);
      render();
    });
  });

  document.querySelector('#event-form')?.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    patchEventDraftField(state, target.name as 'date' | 'type' | 'label', target.value);
  });

  document.querySelector('#event-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.eventDraft.label.trim()) {
      window.alert('Event label is required.');
      return;
    }
    dispatchAppState(upsertDayEventAction({ id: crypto.randomUUID(), ...state.eventDraft }));
    closeEventDraft(state);
    render();
  });
}

function openProductionModal(date) {
  const existing = state.app.dailyActuals[date];
  openProductionDraft(state, date, existing);
  render();
}

function renderCalendar(derived) {
  return renderCalendarView(derived, state.app, formatISO(today), formatKg, formatPercent);
}

function renderManagerPanel(derived) {
  if (state.activeManagerTab === 'review') return renderReviewTab(derived);
  if (state.activeManagerTab === 'inventory') return renderInventoryTab(derived);
  return renderPlanTab(derived);
}

function renderPlanTab(derived) {
  return renderPlanTabView({
    derived,
    monthlyTargetKg: state.app.monthlyTargetKg,
    validationMode: state.app.validationMode,
    formatKg,
    formatPercent,
    round,
  });
}

function renderReviewTab(derived) {
  return renderReviewTabView({
    derived,
    monthlyTargetKg: state.app.monthlyTargetKg,
    formatKg,
    formatPercent,
    formatSignedPercent,
  });
}

function renderInventoryTab(derived) {
  return renderInventoryTabView({
    derived,
    formatKg,
    round,
  });
}

function renderDayDrawer(detail) {
  return renderDayDrawerView(detail, formatKg);
}

function renderArrivalModal() {
  return renderArrivalModalView(state.arrivalDraft);
}

function renderProductionModal(derived) {
  return renderProductionModalView(state.productionDraft, derived, formatKg);
}

function syncProductionPreview() {
  if (!state.productionDraft) return;
  const derived = buildDerived(state.app);
  const date = state.productionDraft.date;
  const oil = Number(state.productionDraft.oilKg || 0);
  const bcUsed = Number(state.productionDraft.bcUsedKg || 0);
  const fcUsed = Number(state.productionDraft.fcUsedKg || 0);
  const target = derived.dailyTargets[date] || 0;

  setText('#preview-target', `${formatKg(target)} kg`);
  setText('#preview-expected', `${formatKg(oil * INPUT_RATIO)} kg`);
  setText('#preview-actual-input', `${formatKg(bcUsed + fcUsed)} kg`);
  setText('#preview-exc', `${formatKg(oil * BYPRODUCT_RATIO)} kg`);
  setText('#preview-bc-after', `${formatKg(derived.stock.bcStock - bcUsed)} kg`);
  setText('#preview-fc-after', `${formatKg(derived.stock.fcStock - fcUsed)} kg`);
}

function renderEventModal() {
  return renderEventModalView(state.eventDraft);
}

function validateArrivalDraft(draft) {
  return validateArrivalDraftLib(draft);
}

function validateProductionDraft(draft, derived, validationMode) {
  return validateProductionDraftLib(draft, derived, validationMode);
}

function buildDayDetail(date, appState, derived) {
  const actual = appState.dailyActuals[date];
  const deliveries = derived.deliveriesByDate[date] || [];
  const event = derived.eventMap[date];
  return {
    date,
    dateLabel: formatDateLong(date),
    targetOil: round(derived.dailyTargets[date] || 0),
    actualOil: round(actual?.oilKg || 0),
    bcUsed: round(actual?.bcUsedKg || 0),
    fcUsed: round(actual?.fcUsedKg || 0),
    excProduced: round(actual?.excKg || 0),
    deliveries,
    eventSummary: event ? `${event.type} • ${event.label}` : 'No holiday or maintenance event',
    ccnoStatus: actual ? (actual.ccnoQCPassed ? 'PASS' : 'FAIL / quarantine') : 'No production recorded',
    excStatus: actual ? (actual.excQCPassed ? 'PASS' : 'FAIL / quarantine') : 'No production recorded',
  };
}

function rebalanceWeeks(weeks, targetId, nextValue) {
  return rebalanceWeeksLib(weeks, targetId, nextValue);
}

function applyWeekPreset(preset) {
  const unlocked = state.app.weeks.filter((week) => !week.locked);
  if (!unlocked.length) return;
  const lockedTotal = state.app.weeks.filter((week) => week.locked).reduce((sum, week) => sum + week.percentage, 0);
  const available = Math.max(0, 100 - lockedTotal);
  let weights = unlocked.map(() => 1);
  if (preset === 'front') weights = unlocked.map((_, index) => unlocked.length - index);
  if (preset === 'back') weights = unlocked.map((_, index) => index + 1);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const adjusted = state.app.weeks.map((week) => {
    if (week.locked) return week;
    const unlockedIndex = unlocked.findIndex((item) => item.id === week.id);
    return {
      ...week,
      percentage: round((available * weights[unlockedIndex]) / totalWeight, 2),
    };
  });

  dispatchAppState(replaceWeeksAction(normalizeWeekObjects(adjusted)));
}

function reallocateRemaining(derived) {
  const actualByWeek = Object.fromEntries(derived.review.weekRows.map((row, index) => [derived.weeks[index].id, row.actual]));
  const completed = derived.weeks.filter((week) => actualByWeek[week.id] > 0);
  const future = derived.weeks.filter((week) => actualByWeek[week.id] === 0);
  if (!future.length) return;

  const remainingTarget = Math.max(0, state.app.monthlyTargetKg - derived.review.actualMonth);
  const futurePercent = state.app.monthlyTargetKg ? round((remainingTarget / state.app.monthlyTargetKg) * 100, 2) : 0;
  const eachFuture = future.length ? futurePercent / future.length : 0;

  const updated = state.app.weeks.map((week) => {
    if (completed.some((item) => item.id === week.id)) {
      const lockedPercent = state.app.monthlyTargetKg ? (actualByWeek[week.id] / state.app.monthlyTargetKg) * 100 : week.percentage;
      return { ...week, locked: true, percentage: round(lockedPercent, 2) };
    }
    return { ...week, locked: false, percentage: round(eachFuture, 2) };
  });

  dispatchAppState(replaceWeeksAction(normalizeWeekObjects(updated)));
}

function normalizeWeekObjects(weeks) {
  return normalizeWeekObjectsLib(weeks);
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function castInputValue(name, value) {
  if (value === '') return '';
  const numericFields = ['quantityKg', 'defectCoconutQty', 'rejectCoconutQty', 'tonnageOvenInput', 'tonnageOvenOutput', 'moistureInput', 'moistureOutput', 'ffa', 'reductionPercentage', 'temperature', 'oilContent', 'rejectedQtyKg', 'oilKg', 'bcUsedKg', 'fcUsedKg', 'moistureImpurities', 'peroxideValue', 'moisture', 'residualOilContent'];
  if (numericFields.some((field) => name.endsWith(field) || name === field)) return Number(value);
  return value;
}

function formatISO(date) {
  return formatISOLib(date);
}

function asManagerTab(value: string | undefined) {
  return value === 'review' || value === 'inventory' ? value : 'plan';
}

function asMaterialType(value: string | undefined): MaterialType {
  return value === 'Fresh Coconut' ? 'Fresh Coconut' : 'White Copra';
}

function formatMonthKey(date) {
  return formatMonthKeyLib(date);
}
function formatMonthLong(monthKey) {
  return formatMonthLongLib(monthKey);
}
function formatDateLong(iso) {
  return formatDateLongLib(iso);
}
function formatKg(value) {
  return round(Number(value || 0)).toLocaleString('en-US', { maximumFractionDigits: 2 });
}
function formatTon(value) {
  return (Number(value || 0) / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
function formatPercent(value) {
  return `${round(Number(value || 0), 1)}%`;
}
function formatSignedPercent(value) {
  const rounded = round(Number(value || 0), 1);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}
function round(value, precision = 2) {
  return roundLib(value, precision);
}

render();

return () => {
  if (persistTimer) {
    window.clearTimeout(persistTimer);
  }
  appRoot.innerHTML = '';
};
}
