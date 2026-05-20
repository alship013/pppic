import type {
  AppState,
  DayEvent,
  Delivery,
  ValidationMode,
  WeekAllocation,
} from '@/features/ppic/domain/types';

export type AppStateAction =
  | { type: 'set_monthly_target'; monthlyTargetKg: number }
  | { type: 'set_validation_mode'; validationMode: ValidationMode }
  | { type: 'replace_weeks'; weeks: WeekAllocation[] }
  | { type: 'append_delivery'; delivery: Delivery }
  | { type: 'upsert_daily_actual'; date: string; entry: AppState['dailyActuals'][string] }
  | { type: 'upsert_day_event'; event: DayEvent };

export function reduceAppState(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'set_monthly_target':
      return { ...state, monthlyTargetKg: action.monthlyTargetKg };
    case 'set_validation_mode':
      return { ...state, validationMode: action.validationMode };
    case 'replace_weeks':
      return { ...state, weeks: action.weeks };
    case 'append_delivery':
      return { ...state, deliveries: [...state.deliveries, action.delivery] };
    case 'upsert_daily_actual':
      return {
        ...state,
        dailyActuals: {
          ...state.dailyActuals,
          [action.date]: action.entry,
        },
      };
    case 'upsert_day_event': {
      const rest = state.dayEvents.filter((item) => item.date !== action.event.date);
      return {
        ...state,
        dayEvents: [...rest, action.event],
      };
    }
    default:
      return state;
  }
}
