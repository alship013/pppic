import type {
  DailyActualEntry,
  EventDraft,
  ManagerTab,
  MaterialType,
  RuntimeState,
} from '@/features/ppic/domain/types';
import { applyRuntimeAction } from '@/features/ppic/state/runtime-reducer';

export function toggleSidebar(state: RuntimeState) {
  applyRuntimeAction(state, { type: 'toggle_sidebar' });
}

export function openManager(state: RuntimeState) {
  applyRuntimeAction(state, { type: 'open_manager' });
}

export function closeManager(state: RuntimeState) {
  applyRuntimeAction(state, { type: 'close_manager' });
}

export function setManagerTab(state: RuntimeState, tab: ManagerTab) {
  applyRuntimeAction(state, { type: 'set_manager_tab', tab });
}

export function selectDate(state: RuntimeState, date: string | null) {
  applyRuntimeAction(state, { type: 'select_date', date });
}

export function openArrivalDraft(state: RuntimeState, date: string, materialType: MaterialType = 'White Copra') {
  applyRuntimeAction(state, { type: 'open_arrival_draft', date, materialType });
}

export function closeArrivalDraft(state: RuntimeState) {
  applyRuntimeAction(state, { type: 'close_arrival_draft' });
}

export function replaceArrivalDraftMaterial(state: RuntimeState, materialType: MaterialType) {
  applyRuntimeAction(state, { type: 'replace_arrival_material', materialType });
}

export function patchArrivalDraftField(
  state: RuntimeState,
  name: string,
  value: string | number
) {
  applyRuntimeAction(state, { type: 'patch_arrival_field', name, value });
}

export function openProductionDraft(state: RuntimeState, date: string, existing?: DailyActualEntry) {
  applyRuntimeAction(state, { type: 'open_production_draft', date, existing });
}

export function closeProductionDraft(state: RuntimeState) {
  applyRuntimeAction(state, { type: 'close_production_draft' });
}

export function patchProductionDraftField(
  state: RuntimeState,
  name: string,
  value: string | number
) {
  applyRuntimeAction(state, { type: 'patch_production_field', name, value });
}

export function openEventDraft(state: RuntimeState, draft: EventDraft) {
  applyRuntimeAction(state, { type: 'open_event_draft', draft });
}

export function closeEventDraft(state: RuntimeState) {
  applyRuntimeAction(state, { type: 'close_event_draft' });
}

export function patchEventDraftField(
  state: RuntimeState,
  name: keyof EventDraft,
  value: string
) {
  applyRuntimeAction(state, { type: 'patch_event_field', name, value });
}
