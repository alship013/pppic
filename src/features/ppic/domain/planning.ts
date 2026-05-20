import { formatDateShort, getMonthDays, isWorkingDay, parseMonthKey, round } from '@/features/ppic/domain/dates';
import type { DayEvent, WeekAllocation } from '@/features/ppic/domain/types';

export function generateWeekAllocations(
  monthKey: string,
  monthlyTargetKg: number,
  dayEvents: DayEvent[],
  previousWeeksById: Record<string, Partial<WeekAllocation>> = {}
) {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const days = getMonthDays(year, monthIndex);
  const weekMap = new Map<number, { weekOfMonth: number; allDates: string[]; workingDates: string[] }>();

  days.forEach((day) => {
    const weekOfMonth = Math.floor((day.date.getDate() - 1) / 7) + 1;
    const existing = weekMap.get(weekOfMonth) || { weekOfMonth, allDates: [], workingDates: [] };
    existing.allDates.push(day.iso);
    if (isWorkingDay(day.iso, dayEvents)) existing.workingDates.push(day.iso);
    weekMap.set(weekOfMonth, existing);
  });

  const basePercentages = Array.from(weekMap.values()).map((week) => {
    const prior = previousWeeksById[`week-${week.weekOfMonth}`];
    return prior?.percentage ?? round(100 / weekMap.size, 2);
  });
  const normalizedPercentages = normalizePercentages(basePercentages);

  return Array.from(weekMap.values()).map((week, index) => {
    const prior = previousWeeksById[`week-${week.weekOfMonth}`] || {};
    const percentage = normalizedPercentages[index];
    const weekTargetKg = monthlyTargetKg * (percentage / 100);
    const perDay = week.workingDates.length ? round(weekTargetKg / week.workingDates.length) : 0;
    return {
      id: `week-${week.weekOfMonth}`,
      percentage,
      locked: Boolean(prior.locked),
      dailyTargets: week.workingDates.map(() => perDay),
      workingDates: week.workingDates,
      allDates: week.allDates,
      weekTargetKg: round(weekTargetKg),
      rangeLabel: `${formatDateShort(week.allDates[0])} - ${formatDateShort(week.allDates[week.allDates.length - 1])}`,
    };
  });
}

export function normalizeWeekObjects(weeks: WeekAllocation[]) {
  const normalized = normalizePercentages(weeks.map((week) => week.percentage));
  return weeks.map((week, index) => ({ ...week, percentage: normalized[index] }));
}

export function normalizePercentages(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const normalized = values.map((value) => round((value / total) * 100, 2));
  const delta = round(100 - normalized.reduce((sum, value) => sum + value, 0), 2);
  if (normalized.length) normalized[normalized.length - 1] = round(normalized[normalized.length - 1] + delta, 2);
  return normalized;
}

export function rebalanceWeeks(weeks: WeekAllocation[], targetId: string, nextValue: number) {
  const lockedOthers = weeks.filter((week) => week.id !== targetId && week.locked);
  const editableOthers = weeks.filter((week) => week.id !== targetId && !week.locked);
  const lockedTotal = lockedOthers.reduce((sum, week) => sum + week.percentage, 0);
  const available = Math.max(0, 100 - lockedTotal);
  const clampedTarget = Math.min(available, Math.max(0, nextValue));
  const remaining = Math.max(0, 100 - lockedTotal - clampedTarget);
  const currentEditableTotal = editableOthers.reduce((sum, week) => sum + week.percentage, 0) || editableOthers.length;

  return normalizeWeekObjects(weeks.map((week) => {
    if (week.id === targetId) return { ...week, percentage: round(clampedTarget, 2) };
    if (week.locked) return week;
    if (!editableOthers.length) return week;
    const basis = currentEditableTotal ? week.percentage / currentEditableTotal : 1 / editableOthers.length;
    return { ...week, percentage: round(remaining * basis, 2) };
  }));
}
