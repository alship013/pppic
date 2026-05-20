import type {
  AppState,
  DayEvent,
  Delivery,
  ValidationMode,
  WeekAllocation,
} from '@/features/ppic/domain/types';
import { reduceAppState, type AppStateAction } from '@/features/ppic/state/app-state-reducer';

export function applyAppStateAction(
  currentState: AppState,
  normalize: (input: AppState) => AppState,
  action: AppStateAction
) {
  return normalize(reduceAppState(currentState, action));
}

export function setMonthlyTargetAction(monthlyTargetKg: number): AppStateAction {
  return { type: 'set_monthly_target', monthlyTargetKg };
}

export function setValidationModeAction(validationMode: ValidationMode): AppStateAction {
  return { type: 'set_validation_mode', validationMode };
}

export function replaceWeeksAction(weeks: WeekAllocation[]): AppStateAction {
  return { type: 'replace_weeks', weeks };
}

export function appendDeliveryAction(delivery: Delivery): AppStateAction {
  return { type: 'append_delivery', delivery };
}

export function upsertDailyActualAction(
  date: string,
  entry: AppState['dailyActuals'][string]
): AppStateAction {
  return { type: 'upsert_daily_actual', date, entry };
}

export function upsertDayEventAction(event: DayEvent): AppStateAction {
  return { type: 'upsert_day_event', event };
}
