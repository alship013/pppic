import type { DayEvent, MonthDay, MonthKey } from '@/features/ppic/domain/types';

export function formatISO(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}

export function parseMonthKey(value: string): MonthKey {
  const [year, month] = value.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

export function formatMonthLong(monthKey: string) {
  const { year, monthIndex } = parseMonthKey(monthKey);
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatDateShort(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateLong(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

export function addDays(iso: string, delta: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return formatISO(date);
}

export function isWorkingDay(isoDate: string, dayEvents: DayEvent[]) {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const event = dayEvents.find((item) => item.date === isoDate);
  return !weekend && !event;
}

export function getMonthDays(year: number, monthIndex: number): MonthDay[] {
  const date = new Date(year, monthIndex, 1);
  const days: MonthDay[] = [];
  while (date.getMonth() === monthIndex) {
    const iso = formatISO(date);
    days.push({
      date: new Date(date),
      iso,
      weekdayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
      labelShort: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
    date.setDate(date.getDate() + 1);
  }
  return days;
}
