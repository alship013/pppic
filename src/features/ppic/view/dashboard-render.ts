import type { DerivedState } from '@/features/ppic/domain/derived';
import type { DayDetail, ManagerTab, ValidationMode } from '@/features/ppic/domain/types';
import { INPUT_RATIO } from '@/features/ppic/domain/constants';
import {
  darkMetricCard,
  iconArchive,
  iconBars,
  iconCalendar,
  iconChart,
  iconClose,
  iconDashboard,
  iconFactory,
  iconGear,
  iconLeaf,
  iconMenu,
  iconTruck,
  inventorySnapshotCard,
  legendPill,
  managerTabButton,
  metricCard,
  renderAlertRows,
  sidebarLink,
  stockBadge,
} from '@/features/ppic/view/ui-fragments';

interface HeaderOptions {
  derived: DerivedState;
  formatTon: (value: number) => string;
}

interface SidebarOptions {
  sidebarCollapsed: boolean;
  activeManagerTab: ManagerTab;
  validationMode: ValidationMode;
}

interface OverviewOptions {
  planningMonth: string;
  monthlyTargetKg: number;
  derived: DerivedState;
  dayDetail: DayDetail;
  formatMonthLong: (monthKey: string) => string;
  formatKg: (value: number) => string;
  formatPercent: (value: number) => string;
  round: (value: number, digits?: number) => number;
}

interface CalendarOptions {
  planningMonth: string;
  calendarMarkup: string;
  formatMonthLong: (monthKey: string) => string;
}

interface PlanningSummaryOptions {
  derived: DerivedState;
  formatKg: (value: number) => string;
  formatPercent: (value: number) => string;
  round: (value: number, digits?: number) => number;
}

interface ManagerShellOptions {
  managerOpen: boolean;
  activeManagerTab: ManagerTab;
  managerContent: string;
}

export function renderAppHeader({ derived, formatTon }: HeaderOptions) {
  return `
    <header class="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl shadow-sm">
      <div class="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div class="flex items-center gap-3">
          <button id="sidebar-toggle" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-600">
            ${iconMenu()}
          </button>
          <div>
            <p class="font-display text-lg font-bold tracking-tight text-slate-900 lg:text-2xl">PPIC Operations System</p>
            <p class="text-sm text-slate-500">Calendar-first planning, production, inventory, and control for CCNO-T</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-3">
          ${stockBadge('BC', derived.stock.bcStock, 'Raw stock', 'bg-white', formatTon)}
          ${stockBadge('FC', derived.stock.fcStock, 'Raw stock', 'bg-white', formatTon)}
          ${stockBadge('CCNO-T', derived.stock.ccnoStock, 'Finished', 'bg-white', formatTon)}
          ${stockBadge('EXC', derived.stock.excStock, 'By-product', 'bg-white', formatTon)}
          <button id="manager-toggle" class="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-brand-600">
            ${iconGear()}
            Manager Panel
          </button>
        </div>
      </div>
    </header>
  `;
}

export function renderSidebar({ sidebarCollapsed, activeManagerTab, validationMode }: SidebarOptions) {
  return `
    <aside class="${sidebarCollapsed ? 'w-[92px]' : 'w-[280px]'} hidden shrink-0 border-r border-white/60 bg-slate-950 text-white transition-all duration-300 ease-in-out lg:block">
      <div class="flex h-full flex-col px-4 py-6 ${sidebarCollapsed ? 'items-center' : ''}">
        <div class="mb-8 ${sidebarCollapsed ? 'text-center' : ''}">
          <div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-100">${iconLeaf()}</div>
          <p class="font-display text-lg font-semibold">${sidebarCollapsed ? 'PPIC' : 'Operations Spine'}</p>
          ${sidebarCollapsed ? '' : '<p class="mt-1 text-sm text-slate-400">Arrival to reporting in one continuous workflow.</p>'}
        </div>
        <nav class="space-y-2">
          ${sidebarLink('overview', 'Overview', iconDashboard(), sidebarCollapsed, activeManagerTab)}
          ${sidebarLink('calendar', 'Calendar', iconCalendar(), sidebarCollapsed, activeManagerTab)}
          ${sidebarLink('plan', 'Planning', iconBars(), sidebarCollapsed, activeManagerTab)}
          ${sidebarLink('review', 'Review', iconChart(), sidebarCollapsed, activeManagerTab)}
          ${sidebarLink('inventory', 'Inventory', iconArchive(), sidebarCollapsed, activeManagerTab)}
        </nav>
        <div class="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Rules</p>
          ${sidebarCollapsed ? '<div class="mt-3 text-xs text-slate-300">1.72 / 0.38</div>' : `
            <div class="mt-3 space-y-2 text-sm text-slate-300">
              <div class="flex justify-between"><span>Input ratio</span><strong>1.72</strong></div>
              <div class="flex justify-between"><span>EXC ratio</span><strong>0.38</strong></div>
              <div class="flex justify-between"><span>Validation</span><strong>${validationMode}</strong></div>
            </div>
          `}
        </div>
      </div>
    </aside>
  `;
}

export function renderOverviewSection({
  planningMonth,
  monthlyTargetKg,
  derived,
  dayDetail,
  formatMonthLong,
  formatKg,
  formatPercent,
  round,
}: OverviewOptions) {
  return `
    <section id="overview" class="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <div class="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-panel">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">Operations snapshot</p>
            <h1 class="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">${formatMonthLong(planningMonth)}</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-600">Planning stays derived from deliveries, production actuals, and day events. The calendar remains the operational source of truth on screen.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            ${metricCard('Monthly Target', `${formatKg(monthlyTargetKg)} kg`, `${derived.workingDays.length} working days`)}
            ${metricCard('Produced MTD', `${formatKg(derived.review.actualMonth)} kg`, `${formatPercent(derived.review.monthAttainment)} attainment`)}
            ${metricCard('Planned Input', `${formatKg(round(monthlyTargetKg * INPUT_RATIO))} kg`, derived.review.stockStatus)}
          </div>
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <div class="rounded-[28px] border border-white/70 bg-slate-950 p-6 text-white shadow-panel">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.25em] text-brand-100">Calendar status</p>
              <p class="mt-2 font-display text-2xl font-semibold">${dayDetail.dateLabel}</p>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-2 text-sm text-slate-200">${dayDetail.eventSummary}</div>
          </div>
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            ${darkMetricCard('Target', `${formatKg(dayDetail.targetOil)} kg`)}
            ${darkMetricCard('Actual', `${formatKg(dayDetail.actualOil)} kg`)}
            ${darkMetricCard('BC Used', `${formatKg(dayDetail.bcUsed)} kg`)}
            ${darkMetricCard('FC Used', `${formatKg(dayDetail.fcUsed)} kg`)}
          </div>
        </div>
        <div class="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-panel">
          <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Alerts</p>
          <div class="mt-4 space-y-3 text-sm text-slate-600">
            ${renderAlertRows(derived, formatKg)}
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderCalendarSection({ planningMonth, calendarMarkup, formatMonthLong }: CalendarOptions) {
  return `
    <section id="calendar" class="rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-panel lg:p-6">
      <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">Calendar-first dashboard</p>
          <h2 class="mt-2 font-display text-2xl font-bold text-slate-900">${formatMonthLong(planningMonth)}</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          ${legendPill('Green', '>=95% attainment', 'bg-emerald-100 text-emerald-700')}
          ${legendPill('Yellow', '80-94%', 'bg-amber-100 text-amber-700')}
          ${legendPill('Red', '<80%', 'bg-rose-100 text-rose-700')}
          ${legendPill('Dot', 'Delivery / missing actuals', 'bg-slate-100 text-slate-700')}
        </div>
      </div>
      <div class="grid grid-cols-7 gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => `<div class="px-2 py-2">${day}</div>`).join('')}
      </div>
      <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
        ${calendarMarkup}
      </div>
    </section>
  `;
}

export function renderPlanningSummarySection({ derived, formatKg, formatPercent, round }: PlanningSummaryOptions) {
  return `
    <section id="plan" class="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <div class="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-panel">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Planning summary</p>
            <h3 class="mt-2 font-display text-xl font-bold">Weekly allocation</h3>
          </div>
          <button data-manager-tab="plan" class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Open manager panel</button>
        </div>
        <div class="mt-6 space-y-4">
          ${derived.weeks.map((week, index) => `
            <div class="rounded-3xl border border-slate-200 p-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-slate-900">Week ${index + 1}</p>
                  <p class="text-xs text-slate-500">${week.rangeLabel}</p>
                </div>
                <div class="text-right text-sm text-slate-600">
                  <div>${formatPercent(week.percentage)} of month</div>
                  <div>${formatKg(week.weekTargetKg)} kg oil</div>
                </div>
              </div>
              <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-brand-500" style="width:${Math.min(100, week.percentage)}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div id="inventory" class="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-panel">
        <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Inventory snapshot</p>
        <h3 class="mt-2 font-display text-xl font-bold">Available versus reserved</h3>
        <div class="mt-5 space-y-4">
          ${inventorySnapshotCard('White Copra', derived.stock.bcStock, derived.review.remainingInputNeed, Math.max(0, derived.stock.bcStock - derived.review.remainingInputNeed), formatKg)}
          ${inventorySnapshotCard('Fresh Coconut', derived.stock.fcStock, round(derived.review.remainingInputNeed * 0.3), Math.max(0, derived.stock.fcStock - round(derived.review.remainingInputNeed * 0.3)), formatKg)}
          ${inventorySnapshotCard('CCNO-T', derived.stock.ccnoStock, 0, derived.stock.ccnoStock, formatKg)}
          ${inventorySnapshotCard('EXC', derived.stock.excStock, 0, derived.stock.excStock, formatKg)}
        </div>
      </div>
    </section>
  `;
}

export function renderManagerShell({ managerOpen, activeManagerTab, managerContent }: ManagerShellOptions) {
  return `
    <aside class="fixed inset-y-[73px] right-0 z-30 w-full max-w-xl border-l border-white/70 bg-white/95 shadow-panel backdrop-blur-xl transition-all duration-300 ease-in-out ${managerOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}">
      <div class="flex h-full flex-col">
        <div class="border-b border-slate-200 px-5 py-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Manager workspace</p>
              <h2 class="mt-1 font-display text-xl font-bold">Plan, review, and inventory</h2>
            </div>
            <button id="manager-close" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            ${managerTabButton('plan', 'Plan', activeManagerTab)}
            ${managerTabButton('review', 'Review', activeManagerTab)}
            ${managerTabButton('inventory', 'Inventory', activeManagerTab)}
          </div>
        </div>
        <div class="flex-1 overflow-y-auto px-5 py-5">
          ${managerContent}
        </div>
      </div>
    </aside>
  `;
}

export function renderOperatorBar() {
  return `
    <div class="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-white/90 px-4 py-4 backdrop-blur-xl">
      <div class="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-slate-500">Operator actions stay on-screen while the calendar remains visible.</div>
        <div class="flex flex-wrap items-center gap-3">
          <button id="open-arrival" class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-slate-800">${iconTruck()}Truck Arrived</button>
          <button id="open-production" class="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-brand-600">${iconFactory()}Production Done</button>
        </div>
      </div>
    </div>
  `;
}
