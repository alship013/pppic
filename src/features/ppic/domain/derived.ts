import { buildMovementLog, buildReviewData, deriveStock } from '@/features/ppic/domain/calculations';
import { groupBy } from '@/features/ppic/domain/collections';
import { getMonthDays, isWorkingDay, parseMonthKey } from '@/features/ppic/domain/dates';
import { generateWeekAllocations } from '@/features/ppic/domain/planning';
import type {
  AppState,
  DayEvent,
  Delivery,
  MonthDay,
  MonthKey,
  MovementEntry,
  ReviewSummary,
  StockSummary,
  WeekAllocation,
} from '@/features/ppic/domain/types';

export interface DerivedState {
  month: MonthKey;
  days: MonthDay[];
  weeks: WeekAllocation[];
  dailyTargets: Record<string, number>;
  stock: StockSummary;
  workingDays: MonthDay[];
  deliveriesByDate: Record<string, Delivery[]>;
  eventMap: Record<string, DayEvent>;
  review: ReviewSummary;
  movementLog: MovementEntry[];
}

export function buildDerivedState(appState: AppState): DerivedState {
  const month = parseMonthKey(appState.planningMonth);
  const days = getMonthDays(month.year, month.monthIndex);
  const eventMap = Object.fromEntries(appState.dayEvents.map((event) => [event.date, event])) as Record<string, DayEvent>;
  const deliveriesByDate = groupBy(appState.deliveries, (item) => item.date);

  const weeks = generateWeekAllocations(
    appState.planningMonth,
    appState.monthlyTargetKg,
    appState.dayEvents,
    Object.fromEntries((appState.weeks || []).map((week) => [week.id, week]))
  );

  const dailyTargets: Record<string, number> = {};
  weeks.forEach((week) => {
    week.dailyTargets.forEach((value, index) => {
      const date = week.workingDates[index];
      if (date) dailyTargets[date] = value;
    });
  });

  const stock = deriveStock(appState);
  const workingDays = days.filter((day) => isWorkingDay(day.iso, appState.dayEvents));
  const review = buildReviewData(appState, weeks, stock);
  const movementLog = buildMovementLog(appState);

  return {
    month,
    days,
    weeks,
    dailyTargets,
    stock,
    workingDays,
    deliveriesByDate,
    eventMap,
    review,
    movementLog,
  };
}
