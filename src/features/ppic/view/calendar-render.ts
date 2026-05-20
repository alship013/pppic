import type { DerivedState } from '@/features/ppic/domain/derived';
import type { RuntimeState } from '@/features/ppic/domain/types';

export function renderCalendar(
  derived: DerivedState,
  appState: RuntimeState['app'],
  todayIso: string,
  formatKg: (value: number) => string,
  formatPercent: (value: number) => string
) {
  const leadingBlanks = Array.from({ length: derived.days[0].date.getDay() }, () => '<div class="hidden xl:block"></div>').join('');
  return `${leadingBlanks}${derived.days.map((day) => renderDayCell(day, derived, appState, todayIso, formatKg, formatPercent)).join('')}`;
}

function renderDayCell(
  day: DerivedState['days'][number],
  derived: DerivedState,
  appState: RuntimeState['app'],
  todayIso: string,
  formatKg: (value: number) => string,
  formatPercent: (value: number) => string
) {
  const actual = appState.dailyActuals[day.iso];
  const target = derived.dailyTargets[day.iso] || 0;
  const deliveries = derived.deliveriesByDate[day.iso] || [];
  const event = derived.eventMap[day.iso];
  const isToday = day.iso === todayIso;
  const weekend = day.date.getDay() === 0 || day.date.getDay() === 6;
  const attainment = target > 0 && actual ? (actual.oilKg || 0) / target * 100 : null;
  const hasMissingActual = day.iso < todayIso && target > 0 && !actual;

  let background = 'bg-white';
  if (event) background = 'bg-slate-100';
  else if (attainment !== null) {
    if (attainment >= 95) background = 'bg-emerald-50';
    else if (attainment >= 80) background = 'bg-amber-50';
    else background = 'bg-rose-50';
  } else if (weekend) background = 'bg-slate-50';

  const deliveryDot = deliveries.length
    ? deliveries.some((item) => item.qcPassed)
      ? '<span class="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>'
      : '<span class="inline-block h-2.5 w-2.5 rounded-full bg-rose-500"></span>'
    : hasMissingActual
      ? '<span class="inline-block h-2.5 w-2.5 rounded-full bg-amber-400"></span>'
      : '<span class="inline-block h-2.5 w-2.5 rounded-full bg-transparent"></span>';

  return `
    <button data-day="${day.iso}" class="day-cell rounded-[26px] border ${isToday ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'} ${background} p-4 text-left shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">${day.weekdayShort}</div>
          <div class="mt-1 font-display text-2xl font-bold text-slate-900">${day.date.getDate()}</div>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          ${deliveryDot}
          ${event ? `<span class="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">${event.type}</span>` : ''}
        </div>
      </div>
      <div class="mt-4 space-y-2 text-sm">
        <div class="flex items-center justify-between text-slate-500"><span>Target</span><strong class="text-slate-800">${target ? formatKg(target) : '-'} kg</strong></div>
        <div class="flex items-center justify-between text-slate-500"><span>Actual</span><strong class="text-slate-900">${actual ? formatKg(actual.oilKg || 0) : '-'} kg</strong></div>
        <div class="flex items-center justify-between text-slate-500"><span>EXC</span><strong>${actual ? formatKg(actual.excKg || 0) : '-'} kg</strong></div>
      </div>
      ${attainment !== null ? `<div class="mt-4 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700">Attainment ${formatPercent(attainment)}</div>` : ''}
      ${hasMissingActual ? '<div class="mt-4 text-xs font-semibold text-amber-600">Missing production actual</div>' : ''}
    </button>
  `;
}
