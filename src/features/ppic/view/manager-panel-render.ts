import { INPUT_RATIO } from '@/features/ppic/domain/constants';
import type { ValidationMode } from '@/features/ppic/domain/types';
import type { DerivedState } from '@/features/ppic/domain/derived';
import {
  finishedStatCard,
  inventoryStatCard,
  metricPill,
  quarantineCard,
} from '@/features/ppic/view/ui-fragments';

interface PlanTabOptions {
  derived: DerivedState;
  monthlyTargetKg: number;
  validationMode: ValidationMode;
  formatKg: (value: number) => string;
  formatPercent: (value: number) => string;
  round: (value: number, digits?: number) => number;
}

interface ReviewTabOptions {
  derived: DerivedState;
  monthlyTargetKg: number;
  formatKg: (value: number) => string;
  formatPercent: (value: number) => string;
  formatSignedPercent: (value: number) => string;
}

interface InventoryTabOptions {
  derived: DerivedState;
  formatKg: (value: number) => string;
  round: (value: number, digits?: number) => number;
}

export function renderPlanTab({
  derived,
  monthlyTargetKg,
  validationMode,
  formatKg,
  formatPercent,
  round,
}: PlanTabOptions) {
  return `
    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>Monthly target (kg)</span>
            <input id="monthly-target-input" type="number" min="0" step="10" value="${monthlyTargetKg}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-200 ease-in-out focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>Validation mode</span>
            <select id="validation-mode" class="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-200 ease-in-out focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="warn" ${validationMode === 'warn' ? 'selected' : ''}>Warn</option>
              <option value="block" ${validationMode === 'block' ? 'selected' : ''}>Block</option>
            </select>
          </label>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          ${metricPill('Working days', String(derived.workingDays.length))}
          ${metricPill('Daily rate', `${formatKg(derived.workingDays.length ? monthlyTargetKg / derived.workingDays.length : 0)} kg`)}
          ${metricPill('Input need', `${formatKg(monthlyTargetKg * INPUT_RATIO)} kg`)}
        </div>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-display text-lg font-semibold">Weekly sliders</p>
            <p class="text-sm text-slate-500">Unlocked weeks rebalance automatically to keep the month at 100%.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button data-preset="equal" class="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Equal</button>
            <button data-preset="front" class="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Front-loaded</button>
            <button data-preset="back" class="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Back-loaded</button>
          </div>
        </div>
        <div class="mt-5 space-y-5">
          ${derived.weeks.map((week, index) => `
            <div class="rounded-3xl border border-slate-200 p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold text-slate-900">Week ${index + 1}</p>
                  <p class="text-xs text-slate-500">${week.rangeLabel}</p>
                </div>
                <label class="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" data-week-lock="${week.id}" ${week.locked ? 'checked' : ''} class="rounded border-slate-300 text-brand-500 focus:ring-brand-200" />
                  Lock week
                </label>
              </div>
              <div class="mt-4 flex items-center gap-4">
                <input data-week-slider="${week.id}" type="range" min="0" max="100" step="1" value="${round(week.percentage)}" ${week.locked ? 'disabled' : ''} class="w-full" />
                <div class="w-28 rounded-2xl bg-slate-100 px-3 py-2 text-right text-sm font-semibold text-slate-700">${formatPercent(week.percentage)}</div>
              </div>
              <div class="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
                <div class="rounded-2xl bg-slate-50 px-3 py-3">Oil target: <strong class="text-slate-900">${formatKg(week.weekTargetKg)} kg</strong></div>
                <div class="rounded-2xl bg-slate-50 px-3 py-3">Input need: <strong class="text-slate-900">${formatKg(week.weekTargetKg * INPUT_RATIO)} kg</strong></div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <p class="font-display text-lg font-semibold">Daily grid</p>
        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr class="text-left text-slate-500">
                <th class="px-3 py-2">Date</th>
                <th class="px-3 py-2">Week</th>
                <th class="px-3 py-2">Oil target</th>
                <th class="px-3 py-2">Input need</th>
                <th class="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              ${derived.days.map((day) => {
                const target = derived.dailyTargets[day.iso] || 0;
                const event = derived.eventMap[day.iso];
                const weekIndex = derived.weeks.findIndex((week) => week.allDates.includes(day.iso));
                return `
                  <tr class="rounded-2xl bg-slate-50 text-slate-700">
                    <td class="rounded-l-2xl px-3 py-3">${day.labelShort}</td>
                    <td class="px-3 py-3">Week ${weekIndex + 1}</td>
                    <td class="px-3 py-3">${target ? `${formatKg(target)} kg` : '-'}</td>
                    <td class="px-3 py-3">${target ? `${formatKg(target * INPUT_RATIO)} kg` : '-'}</td>
                    <td class="rounded-r-2xl px-3 py-3">${event ? event.type : day.date.getDay() === 0 || day.date.getDay() === 6 ? 'weekend' : 'working'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

export function renderReviewTab({
  derived,
  monthlyTargetKg,
  formatKg,
  formatPercent,
  formatSignedPercent,
}: ReviewTabOptions) {
  return `
    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-display text-lg font-semibold">Plan versus actual</p>
            <p class="text-sm text-slate-500">Completed weeks can be locked, then the balance can be redistributed.</p>
          </div>
          <button data-reallocate="true" class="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-brand-600">Reallocate remaining</button>
        </div>
        <div class="mt-4 space-y-3">
          ${derived.review.weekRows.map((week) => `
            <div class="grid gap-3 rounded-3xl border border-slate-200 p-4 text-sm text-slate-600 sm:grid-cols-4">
              <div><p class="text-xs uppercase tracking-[0.18em] text-slate-400">Week</p><p class="mt-1 font-semibold text-slate-900">${week.label}</p></div>
              <div><p class="text-xs uppercase tracking-[0.18em] text-slate-400">Plan</p><p class="mt-1 font-semibold text-slate-900">${formatKg(week.plan)} kg</p></div>
              <div><p class="text-xs uppercase tracking-[0.18em] text-slate-400">Actual</p><p class="mt-1 font-semibold text-slate-900">${formatKg(week.actual)} kg</p></div>
              <div><p class="text-xs uppercase tracking-[0.18em] text-slate-400">Variance</p><p class="mt-1 font-semibold ${week.variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${formatSignedPercent(week.variancePercent)}</p></div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-2">
        <div class="rounded-[28px] border border-slate-200 bg-white p-5">
          <p class="font-display text-lg font-semibold">Input consumption</p>
          <div class="mt-4 space-y-3 text-sm text-slate-600">
            <div class="rounded-2xl bg-slate-50 p-4">Planned input: <strong class="text-slate-900">${formatKg(monthlyTargetKg * INPUT_RATIO)} kg</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">Actual input: <strong class="text-slate-900">${formatKg(derived.review.actualInput)} kg</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">BC used: <strong class="text-slate-900">${formatKg(derived.review.bcUsed)} kg</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">FC used: <strong class="text-slate-900">${formatKg(derived.review.fcUsed)} kg</strong></div>
          </div>
        </div>
        <div class="rounded-[28px] border border-slate-200 bg-white p-5">
          <p class="font-display text-lg font-semibold">Stock forward look</p>
          <div class="mt-4 space-y-3 text-sm text-slate-600">
            <div class="rounded-2xl bg-slate-50 p-4">Remaining target: <strong class="text-slate-900">${formatKg(derived.review.remainingTarget)} kg</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">Remaining input need: <strong class="text-slate-900">${formatKg(derived.review.remainingInputNeed)} kg</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">BC status: <strong class="${derived.stock.bcStock >= derived.review.remainingInputNeed ? 'text-emerald-700' : 'text-amber-700'}">${derived.stock.bcStock >= derived.review.remainingInputNeed ? 'Sufficient' : 'Tight'}</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">FC status: <strong class="${derived.stock.fcStock >= derived.review.remainingInputNeed * 0.25 ? 'text-emerald-700' : 'text-amber-700'}">${derived.stock.fcStock >= derived.review.remainingInputNeed * 0.25 ? 'Sufficient' : 'Tight'}</strong></div>
          </div>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-2">
        <div class="rounded-[28px] border border-slate-200 bg-white p-5">
          <p class="font-display text-lg font-semibold">By-product summary</p>
          <div class="mt-4 space-y-3 text-sm text-slate-600">
            <div class="rounded-2xl bg-slate-50 p-4">EXC produced MTD: <strong class="text-slate-900">${formatKg(derived.review.excProduced)} kg</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">EXC in stock: <strong class="text-slate-900">${formatKg(derived.stock.excStock)} kg</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">EXC quarantine: <strong class="text-slate-900">${formatKg(derived.stock.excQuarantine)} kg</strong></div>
          </div>
        </div>
        <div class="rounded-[28px] border border-slate-200 bg-white p-5">
          <p class="font-display text-lg font-semibold">QC summary</p>
          <div class="mt-4 space-y-3 text-sm text-slate-600">
            <div class="rounded-2xl bg-slate-50 p-4">CCNO-T pass rate: <strong class="text-slate-900">${formatPercent(derived.review.ccnoPassRate)}</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">EXC pass rate: <strong class="text-slate-900">${formatPercent(derived.review.excPassRate)}</strong></div>
            <div class="rounded-2xl bg-slate-50 p-4">Deliveries pass rate: <strong class="text-slate-900">${formatPercent(derived.review.deliveryPassRate)}</strong></div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderInventoryTab({
  derived,
  formatKg,
  round,
}: InventoryTabOptions) {
  return `
    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <p class="font-display text-lg font-semibold">Raw material stock</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          ${inventoryStatCard('White Copra', derived.stock.bcStock, derived.review.remainingInputNeed, Math.max(0, derived.stock.bcStock - derived.review.remainingInputNeed), formatKg)}
          ${inventoryStatCard('Fresh Coconut', derived.stock.fcStock, round(derived.review.remainingInputNeed * 0.3), Math.max(0, derived.stock.fcStock - round(derived.review.remainingInputNeed * 0.3)), formatKg)}
        </div>
      </section>
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <p class="font-display text-lg font-semibold">Finished product stock</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          ${finishedStatCard('CCNO-T', derived.stock.ccnoStock, derived.review.actualMonth, derived.review.ccnoDispatched, formatKg)}
          ${finishedStatCard('EXC', derived.stock.excStock, derived.review.excProduced, derived.review.excDispatched, formatKg)}
        </div>
      </section>
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <p class="font-display text-lg font-semibold">Quarantine</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          ${quarantineCard('CCNO-T', derived.stock.ccnoQuarantine, formatKg)}
          ${quarantineCard('EXC', derived.stock.excQuarantine, formatKg)}
        </div>
      </section>
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <p class="font-display text-lg font-semibold">Movement log</p>
        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr class="text-left text-slate-500">
                <th class="px-3 py-2">Date</th>
                <th class="px-3 py-2">Type</th>
                <th class="px-3 py-2">Item</th>
                <th class="px-3 py-2">Direction</th>
                <th class="px-3 py-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${derived.movementLog.map((row) => `
                <tr class="bg-slate-50 text-slate-700">
                  <td class="rounded-l-2xl px-3 py-3">${row.date}</td>
                  <td class="px-3 py-3">${row.type}</td>
                  <td class="px-3 py-3">${row.item}</td>
                  <td class="px-3 py-3">${row.direction}</td>
                  <td class="rounded-r-2xl px-3 py-3 font-semibold ${row.direction === 'IN' ? 'text-emerald-700' : row.direction === 'OUT' ? 'text-rose-700' : 'text-amber-700'}">${formatKg(row.qty)} kg</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}
