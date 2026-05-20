import type { ManagerTab } from '@/features/ppic/domain/types';

type Option = string | { label: string; value: string };

export function fieldInput(label: string, name: string, type: string, value: string | number | undefined, min = '', step = '') {
  return `
    <label class="space-y-2 text-sm font-medium text-slate-700">
      <span>${label}</span>
      <input name="${name}" type="${type}" value="${value ?? ''}" ${min !== '' ? `min="${min}"` : ''} ${step !== '' ? `step="${step}"` : ''} class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all duration-200 ease-in-out focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
    </label>
  `;
}

export function fieldSelect(label: string, name: string, id: string, value: string | number | undefined, options: Option[]) {
  const normalizedOptions = options.map((option) => typeof option === 'string' ? { label: option, value: option } : option);
  return `
    <label class="space-y-2 text-sm font-medium text-slate-700">
      <span>${label}</span>
      <select ${id ? `id="${id}"` : ''} name="${name}" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all duration-200 ease-in-out focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
        ${normalizedOptions.map((option) => `<option value="${option.value}" ${String(value) === String(option.value) ? 'selected' : ''}>${option.label}</option>`).join('')}
      </select>
    </label>
  `;
}

export function metricCard(label: string, value: string, note: string) {
  return `<div class="rounded-3xl bg-slate-50 px-4 py-4"><div class="text-xs uppercase tracking-[0.18em] text-slate-400">${label}</div><div class="mt-2 text-lg font-bold text-slate-900">${value}</div><div class="mt-1 text-xs text-slate-500">${note}</div></div>`;
}

export function darkMetricCard(label: string, value: string) {
  return `<div class="rounded-2xl bg-white/10 px-4 py-4"><div class="text-xs uppercase tracking-[0.18em] text-slate-300">${label}</div><div class="mt-2 text-lg font-bold text-white">${value}</div></div>`;
}

export function metricPill(label: string, value: string) {
  return `<div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><span class="text-slate-400">${label}</span><div class="mt-1 font-semibold text-slate-900">${value}</div></div>`;
}

export function inventorySnapshotCard(label: string, stock: number, reserved: number, available: number, formatKg: (value: number) => string) {
  return `<div class="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600"><div class="font-semibold text-slate-900">${label}</div><div class="mt-2">In stock: ${formatKg(stock)} kg</div><div>Reserved: ${formatKg(reserved)} kg</div><div>Available: ${formatKg(available)} kg</div></div>`;
}

export function inventoryStatCard(label: string, stock: number, reserved: number, available: number, formatKg: (value: number) => string) {
  return `<div class="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600"><div class="font-semibold text-slate-900">${label}</div><div class="mt-3 grid gap-2"><div>In stock: <strong class="text-slate-900">${formatKg(stock)} kg</strong></div><div>Reserved: <strong class="text-slate-900">${formatKg(reserved)} kg</strong></div><div>Available: <strong class="text-slate-900">${formatKg(available)} kg</strong></div></div></div>`;
}

export function finishedStatCard(label: string, stock: number, produced: number, dispatched: number, formatKg: (value: number) => string) {
  return `<div class="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600"><div class="font-semibold text-slate-900">${label}</div><div class="mt-3 grid gap-2"><div>In stock: <strong class="text-slate-900">${formatKg(stock)} kg</strong></div><div>Produced MTD: <strong class="text-slate-900">${formatKg(produced)} kg</strong></div><div>Dispatched MTD: <strong class="text-slate-900">${formatKg(dispatched)} kg</strong></div></div></div>`;
}

export function quarantineCard(label: string, qty: number, formatKg: (value: number) => string) {
  return `<div class="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700"><div class="font-semibold">${label}</div><div class="mt-2">Quarantine: <strong>${formatKg(qty)} kg</strong></div></div>`;
}

export function stockBadge(label: string, value: number, note: string, classes: string, formatTon: (value: number) => string) {
  return `<div class="rounded-2xl border border-slate-200 px-4 py-3 ${classes}"><div class="text-xs uppercase tracking-[0.18em] text-slate-400">${label}</div><div class="mt-1 text-sm font-bold text-slate-900">${formatTon(value)} t</div><div class="text-[11px] text-slate-500">${note}</div></div>`;
}

export function legendPill(title: string, note: string, classes: string) {
  return `<div class="rounded-full px-3 py-2 ${classes}"><strong>${title}</strong> ${note}</div>`;
}

export function sidebarLink(anchor: string, label: string, icon: string, collapsed: boolean, activeManagerTab: ManagerTab) {
  const active = (anchor === 'plan' && activeManagerTab === 'plan') || activeManagerTab === anchor;
  return `<button data-anchor="${anchor}" class="sidebar-link ${active ? 'active' : ''} flex w-full items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-2xl border border-white/5 px-3 py-3 text-sm font-medium text-slate-300 transition-all duration-300 ease-in-out hover:border-white/10 hover:bg-white/10 hover:text-white">${icon}${collapsed ? '' : `<span>${label}</span>`}</button>`;
}

export function managerTabButton(tab: ManagerTab, label: string, activeManagerTab: ManagerTab) {
  return `<button data-manager-tab="${tab}" class="rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 ease-in-out ${activeManagerTab === tab ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600'}">${label}</button>`;
}

export function renderAlertRows(
  derived: {
    review: { remainingTarget: number; remainingInputNeed: number };
    stock: { ccnoQuarantine: number; excQuarantine: number; bcStock: number };
  },
  formatKg: (value: number) => string
) {
  const rows = [];
  if (derived.review.remainingTarget > 0) rows.push(`<div class="rounded-2xl bg-slate-50 px-4 py-3">Remaining target this month: <strong class="text-slate-900">${formatKg(derived.review.remainingTarget)} kg</strong></div>`);
  if (derived.stock.ccnoQuarantine > 0 || derived.stock.excQuarantine > 0) rows.push(`<div class="rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">Quarantine stock present. CCNO-T ${formatKg(derived.stock.ccnoQuarantine)} kg, EXC ${formatKg(derived.stock.excQuarantine)} kg.</div>`);
  if (derived.stock.bcStock < derived.review.remainingInputNeed) rows.push('<div class="rounded-2xl bg-amber-50 px-4 py-3 text-amber-700">BC inventory is tighter than the remaining month input need.</div>');
  if (!rows.length) rows.push('<div class="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">No immediate stock or plan exceptions detected.</div>');
  return rows.join('');
}

export function iconMenu() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16M4 12h16M4 17h16" /></svg>'; }
export function iconGear() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.898 1.924 1.724 1.724 0 001.066 2.573 1.724 1.724 0 010 3.35 1.724 1.724 0 00-1.066 2.573 1.724 1.724 0 01-2.898 1.924 1.724 1.724 0 00-2.573 1.066 1.724 1.724 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.898-1.924 1.724 1.724 0 00-1.066-2.573 1.724 1.724 0 010-3.35 1.724 1.724 0 001.066-2.573 1.724 1.724 0 012.898-1.924 1.724 1.724 0 002.573-1.066z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'; }
export function iconClose() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" /></svg>'; }
export function iconTruck() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 17h6m-8 0H5a2 2 0 01-2-2V8a2 2 0 012-2h10a2 2 0 012 2v7m0 0h1.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 0021 12.586V11a1 1 0 00-1-1h-3m0 7a2 2 0 11-4 0 2 2 0 014 0zm-10 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg>'; }
export function iconFactory() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 21h18M5 21V9l5 3V9l5 3V5l4 2v14" /></svg>'; }
export function iconLeaf() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 21c6 0 14-4 14-14-6 0-14 4-14 14zm0 0c2-3 5-6 9-8" /></svg>'; }
export function iconDashboard() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" /></svg>'; }
export function iconCalendar() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10m-13 9h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>'; }
export function iconBars() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h10M4 18h7" /></svg>'; }
export function iconChart() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 12l3-3 2 2 5-5m0 0v5m0-5h-5M5 19h14" /></svg>'; }
export function iconArchive() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 8h14M5 8l1 11a2 2 0 002 2h8a2 2 0 002-2l1-11M9 8V5a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>'; }
