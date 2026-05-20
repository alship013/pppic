import type {
  EventDraft,
  ManagerTab,
  MaterialType,
  RuntimeState,
} from '@/features/ppic/domain/types';
import {
  createArrivalDraft,
  createProductionDraft,
  createProductionDraftFromActual,
} from '@/features/ppic/state/runtime-state';

export type RuntimeAction =
  | { type: 'toggle_sidebar' }
  | { type: 'open_manager' }
  | { type: 'close_manager' }
  | { type: 'set_manager_tab'; tab: ManagerTab }
  | { type: 'select_date'; date: string | null }
  | { type: 'open_arrival_draft'; date: string; materialType?: MaterialType }
  | { type: 'close_arrival_draft' }
  | { type: 'replace_arrival_material'; materialType: MaterialType }
  | { type: 'patch_arrival_field'; name: string; value: string | number }
  | { type: 'open_production_draft'; date: string; existing?: RuntimeState['app']['dailyActuals'][string] }
  | { type: 'close_production_draft' }
  | { type: 'patch_production_field'; name: string; value: string | number }
  | { type: 'open_event_draft'; draft: EventDraft }
  | { type: 'close_event_draft' }
  | { type: 'patch_event_field'; name: keyof EventDraft; value: string };

export function reduceRuntimeState(state: RuntimeState, action: RuntimeAction): RuntimeState {
  switch (action.type) {
    case 'toggle_sidebar':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'open_manager':
      return { ...state, managerOpen: true };
    case 'close_manager':
      return { ...state, managerOpen: false };
    case 'set_manager_tab':
      return { ...state, activeManagerTab: action.tab, managerOpen: true };
    case 'select_date':
      return { ...state, selectedDate: action.date };
    case 'open_arrival_draft':
      return {
        ...state,
        arrivalDraft: createArrivalDraft(action.date, action.materialType ?? 'White Copra'),
      };
    case 'close_arrival_draft':
      return { ...state, arrivalDraft: null };
    case 'replace_arrival_material':
      if (!state.arrivalDraft) return state;
      return {
        ...state,
        arrivalDraft: createArrivalDraft(state.arrivalDraft.date, action.materialType),
      };
    case 'patch_arrival_field':
      if (!state.arrivalDraft) return state;
      if (action.name.startsWith('qc.')) {
        return {
          ...state,
          arrivalDraft: {
            ...state.arrivalDraft,
            qcChecklist: {
              ...state.arrivalDraft.qcChecklist,
              [action.name.replace('qc.', '')]: action.value,
            },
          },
        };
      }
      return {
        ...state,
        arrivalDraft: {
          ...state.arrivalDraft,
          [action.name]: action.value,
        },
      };
    case 'open_production_draft':
      return {
        ...state,
        productionDraft: action.existing
          ? createProductionDraftFromActual(action.date, action.existing)
          : createProductionDraft(action.date),
      };
    case 'close_production_draft':
      return { ...state, productionDraft: null };
    case 'patch_production_field':
      if (!state.productionDraft) return state;
      if (action.name.startsWith('ccno.')) {
        return {
          ...state,
          productionDraft: {
            ...state.productionDraft,
            ccnoQC: {
              ...state.productionDraft.ccnoQC,
              [action.name.replace('ccno.', '')]: action.value,
            },
          },
        };
      }
      if (action.name.startsWith('exc.')) {
        return {
          ...state,
          productionDraft: {
            ...state.productionDraft,
            excQC: {
              ...state.productionDraft.excQC,
              [action.name.replace('exc.', '')]: action.value,
            },
          },
        };
      }
      return {
        ...state,
        productionDraft: {
          ...state.productionDraft,
          [action.name]: action.value,
        },
      };
    case 'open_event_draft':
      return { ...state, eventDraft: action.draft };
    case 'close_event_draft':
      return { ...state, eventDraft: null };
    case 'patch_event_field':
      if (!state.eventDraft) return state;
      return {
        ...state,
        eventDraft: {
          ...state.eventDraft,
          [action.name]: action.value,
        },
      };
    default:
      return state;
  }
}

export function applyRuntimeAction(state: RuntimeState, action: RuntimeAction) {
  const nextState = reduceRuntimeState(state, action);
  Object.assign(state, nextState);
}
