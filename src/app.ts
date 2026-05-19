const STORAGE_KEY = 'ppic-operations-state-v1';
const INPUT_RATIO = 1.72;
const BYPRODUCT_RATIO = 0.38;
const INPUT_TOLERANCE = 1;

const today = new Date();
const currentMonthKey = formatMonthKey(today);

const state = {
  sidebarCollapsed: false,
  managerOpen: true,
  activeManagerTab: 'plan',
  selectedDate: null,
  arrivalDraft: null,
  productionDraft: null,
  eventDraft: null,
  app: loadAppState(),
};

const appRoot = document.querySelector('#app');
let persistTimer = null;

function loadAppState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return normalizeAppState(parsed);
    }
  } catch (error) {
    console.error('Failed to load saved PPIC state', error);
  }
  return createDefaultAppState();
}

function createDefaultAppState() {
  const seedDeliveries = [
    {
      id: crypto.randomUUID(),
      materialType: 'White Copra',
      quantityKg: 18000,
      supplierName: 'PT Samudra Copra',
      vehicleNumber: 'KT 8721 AD',
      waybillTicket: 'WB-0512-01',
      driverName: 'Fajar',
      qcPassed: true,
      date: addDays(formatISO(today), -5),
      qcChecklist: {
        batchId: 'BC-0512-A',
        tonnageOvenInput: 19500,
        tonnageOvenOutput: 18000,
        moistureInput: 16,
        moistureOutput: 6.5,
        ffa: 2.1,
        colour: 'white',
        reductionPercentage: 7.6,
        temperature: 68,
        fungus: 'pass',
        charSmokeResidue: 'pass',
        oilContent: 64,
        meatThickness: '8 mm',
        insectDamage: 'pass',
        storageAfterHotroom: 'pass',
        batchPhoto: '',
        rejectedQtyKg: 350,
        rejectReason: 'Minor char pockets removed',
      },
    },
    {
      id: crypto.randomUUID(),
      materialType: 'Fresh Coconut',
      quantityKg: 9500,
      supplierName: 'Kebun Laut Timur',
      vehicleNumber: 'KT 4412 PQ',
      waybillTicket: 'WB-0515-09',
      driverName: 'Rian',
      qcPassed: true,
      date: addDays(formatISO(today), -3),
      qcChecklist: {
        moistureLevel: 'pass',
        coconutMaturity: 'old',
        impurities: 'pass',
        defectCoconutQty: 180,
        rejectCoconutQty: 240,
        truckCleanliness: 'pass',
        coverInTruck: 'pass',
        handlingMethod: 'pass',
        storageMethod: 'pass',
        coverInStorage: 'pass',
        unloadingPhoto: '',
      },
    },
  ];

  const seedActualDate = addDays(formatISO(today), -1);
  const weeks = generateWeekAllocations(currentMonthKey, 12000, [], {});

  return {
    product: 'CCNO-T',
    planningMonth: currentMonthKey,
    monthlyTargetKg: 12000,
    weeks,
    deliveries: seedDeliveries,
    dailyActuals: {
      [seedActualDate]: {
        oilKg: 620,
        bcUsedKg: 720,
        fcUsedKg: 346.4,
        excKg: round(620 * BYPRODUCT_RATIO),
        ccnoQC: {
          colour: 'golden',
          smell: 'pass',
          moistureImpurities: 0.12,
          ffa: 2.8,
          peroxideValue: 1.6,
          aflatoxin: 'pass',
        },
        excQC: {
          moisture: 8.4,
          residualOilContent: 6.8,
          appearance: 'pass',
        },
        ccnoQCPassed: true,
        excQCPassed: true,
      },
    },
    dayEvents: [
      { id: crypto.randomUUID(), date: addDays(formatISO(today), 2), type: 'maintenance', label: 'Press inspection' },
    ],
    dispatches: [],
    recipeInputRatio: INPUT_RATIO,
    recipeByProductRatio: BYPRODUCT_RATIO,
    validationMode: 'warn',
  };
}

function normalizeAppState(input) {
  const normalized = {
    product: input.product || 'CCNO-T',
    planningMonth: input.planningMonth || currentMonthKey,
    monthlyTargetKg: Number(input.monthlyTargetKg || 0),
    weeks: Array.isArray(input.weeks) ? input.weeks : [],
    deliveries: Array.isArray(input.deliveries) ? input.deliveries : [],
    dailyActuals: input.dailyActuals || {},
    dayEvents: Array.isArray(input.dayEvents) ? input.dayEvents : [],
    dispatches: Array.isArray(input.dispatches) ? input.dispatches : [],
    recipeInputRatio: Number(input.recipeInputRatio || INPUT_RATIO),
    recipeByProductRatio: Number(input.recipeByProductRatio || BYPRODUCT_RATIO),
    validationMode: input.validationMode === 'block' ? 'block' : 'warn',
  };
  normalized.weeks = generateWeekAllocations(
    normalized.planningMonth,
    normalized.monthlyTargetKg,
    normalized.dayEvents,
    Object.fromEntries((normalized.weeks || []).map((week) => [week.id, week]))
  );
  return normalized;
}

function persistAppState() {
  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.app));
  }, 150);
}

function setAppState(updater) {
  state.app = typeof updater === 'function' ? updater(state.app) : updater;
  state.app = normalizeAppState(state.app);
  persistAppState();
  render();
}

function render() {
  const derived = buildDerived(state.app);
  const selectedDate = state.selectedDate || formatISO(today);
  const dayDetail = buildDayDetail(selectedDate, state.app, derived);

  appRoot.innerHTML = `
    <div class="min-h-screen text-slate-900">
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
            ${stockBadge('BC', derived.stock.bcStock, 'Raw stock', 'bg-white')}
            ${stockBadge('FC', derived.stock.fcStock, 'Raw stock', 'bg-white')}
            ${stockBadge('CCNO-T', derived.stock.ccnoStock, 'Finished', 'bg-white')}
            ${stockBadge('EXC', derived.stock.excStock, 'By-product', 'bg-white')}
            <button id="manager-toggle" class="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-brand-600">
              ${iconGear()}
              Manager Panel
            </button>
          </div>
        </div>
      </header>

      <div class="flex min-h-[calc(100vh-73px)]">
        <aside class="${state.sidebarCollapsed ? 'w-[92px]' : 'w-[280px]'} hidden shrink-0 border-r border-white/60 bg-slate-950 text-white transition-all duration-300 ease-in-out lg:block">
          <div class="flex h-full flex-col px-4 py-6 ${state.sidebarCollapsed ? 'items-center' : ''}">
            <div class="mb-8 ${state.sidebarCollapsed ? 'text-center' : ''}">
              <div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-100">${iconLeaf()}</div>
              <p class="font-display text-lg font-semibold">${state.sidebarCollapsed ? 'PPIC' : 'Operations Spine'}</p>
              ${state.sidebarCollapsed ? '' : '<p class="mt-1 text-sm text-slate-400">Arrival to reporting in one continuous workflow.</p>'}
            </div>
            <nav class="space-y-2">
              ${sidebarLink('overview', 'Overview', iconDashboard(), state.sidebarCollapsed)}
              ${sidebarLink('calendar', 'Calendar', iconCalendar(), state.sidebarCollapsed)}
              ${sidebarLink('plan', 'Planning', iconBars(), state.sidebarCollapsed)}
              ${sidebarLink('review', 'Review', iconChart(), state.sidebarCollapsed)}
              ${sidebarLink('inventory', 'Inventory', iconArchive(), state.sidebarCollapsed)}
            </nav>
            <div class="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Rules</p>
              ${state.sidebarCollapsed ? '<div class="mt-3 text-xs text-slate-300">1.72 / 0.38</div>' : `
                <div class="mt-3 space-y-2 text-sm text-slate-300">
                  <div class="flex justify-between"><span>Input ratio</span><strong>1.72</strong></div>
                  <div class="flex justify-between"><span>EXC ratio</span><strong>0.38</strong></div>
                  <div class="flex justify-between"><span>Validation</span><strong>${state.app.validationMode}</strong></div>
                </div>
              `}
            </div>
          </div>
        </aside>

        <main class="relative flex-1 px-4 py-6 lg:px-6">
          <div class="mx-auto max-w-[1500px] space-y-6 pb-28">
            <section id="overview" class="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
              <div class="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-panel">
                <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">Operations snapshot</p>
                    <h1 class="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">${formatMonthLong(state.app.planningMonth)}</h1>
                    <p class="mt-2 max-w-2xl text-sm text-slate-600">Planning stays derived from deliveries, production actuals, and day events. The calendar remains the operational source of truth on screen.</p>
                  </div>
                  <div class="grid gap-3 sm:grid-cols-3">
                    ${metricCard('Monthly Target', `${formatKg(state.app.monthlyTargetKg)} kg`, `${derived.workingDays.length} working days`) }
                    ${metricCard('Produced MTD', `${formatKg(derived.review.actualMonth)} kg`, `${formatPercent(derived.review.monthAttainment)} attainment`) }
                    ${metricCard('Planned Input', `${formatKg(round(state.app.monthlyTargetKg * INPUT_RATIO))} kg`, derived.review.stockStatus) }
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
                    ${darkMetricCard('Target', `${formatKg(dayDetail.targetOil)} kg`) }
                    ${darkMetricCard('Actual', `${formatKg(dayDetail.actualOil)} kg`) }
                    ${darkMetricCard('BC Used', `${formatKg(dayDetail.bcUsed)} kg`) }
                    ${darkMetricCard('FC Used', `${formatKg(dayDetail.fcUsed)} kg`) }
                  </div>
                </div>
                <div class="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-panel">
                  <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Alerts</p>
                  <div class="mt-4 space-y-3 text-sm text-slate-600">
                    ${renderAlertRows(derived)}
                  </div>
                </div>
              </div>
            </section>

            <section id="calendar" class="rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-panel lg:p-6">
              <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">Calendar-first dashboard</p>
                  <h2 class="mt-2 font-display text-2xl font-bold text-slate-900">${formatMonthLong(state.app.planningMonth)}</h2>
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
                ${renderCalendar(derived)}
              </div>
            </section>

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
                  ${inventorySnapshotCard('White Copra', derived.stock.bcStock, derived.review.remainingInputNeed, Math.max(0, derived.stock.bcStock - derived.review.remainingInputNeed))}
                  ${inventorySnapshotCard('Fresh Coconut', derived.stock.fcStock, round(derived.review.remainingInputNeed * 0.3), Math.max(0, derived.stock.fcStock - round(derived.review.remainingInputNeed * 0.3)))}
                  ${inventorySnapshotCard('CCNO-T', derived.stock.ccnoStock, 0, derived.stock.ccnoStock)}
                  ${inventorySnapshotCard('EXC', derived.stock.excStock, 0, derived.stock.excStock)}
                </div>
              </div>
            </section>
          </div>
        </main>

        <aside class="fixed inset-y-[73px] right-0 z-30 w-full max-w-xl border-l border-white/70 bg-white/95 shadow-panel backdrop-blur-xl transition-all duration-300 ease-in-out ${state.managerOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}">
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
                ${managerTabButton('plan', 'Plan')}
                ${managerTabButton('review', 'Review')}
                ${managerTabButton('inventory', 'Inventory')}
              </div>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-5">
              ${renderManagerPanel(derived)}
            </div>
          </div>
        </aside>
      </div>

      <div class="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-white/90 px-4 py-4 backdrop-blur-xl">
        <div class="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm text-slate-500">Operator actions stay on-screen while the calendar remains visible.</div>
          <div class="flex flex-wrap items-center gap-3">
            <button id="open-arrival" class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-slate-800">${iconTruck()}Truck Arrived</button>
            <button id="open-production" class="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-brand-600">${iconFactory()}Production Done</button>
          </div>
        </div>
      </div>

      ${state.selectedDate ? renderDayDrawer(dayDetail) : ''}
      ${state.arrivalDraft ? renderArrivalModal() : ''}
      ${state.productionDraft ? renderProductionModal(derived) : ''}
      ${state.eventDraft ? renderEventModal() : ''}
    </div>
  `;

  bindGlobalEvents(derived);
}

function buildDerived(appState) {
  const month = parseMonthKey(appState.planningMonth);
  const days = getMonthDays(month.year, month.monthIndex);
  const eventMap = Object.fromEntries(appState.dayEvents.map((event) => [event.date, event]));
  const deliveriesByDate = groupBy(appState.deliveries, (item) => item.date);

  const weeks = generateWeekAllocations(
    appState.planningMonth,
    appState.monthlyTargetKg,
    appState.dayEvents,
    Object.fromEntries((appState.weeks || []).map((week) => [week.id, week]))
  );

  const dailyTargets = {};
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

function bindGlobalEvents(derived) {
  document.querySelector('#sidebar-toggle')?.addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    render();
  });
  document.querySelector('#manager-toggle')?.addEventListener('click', () => {
    state.managerOpen = true;
    render();
  });
  document.querySelector('#manager-close')?.addEventListener('click', () => {
    state.managerOpen = false;
    render();
  });
  document.querySelector('#open-arrival')?.addEventListener('click', () => {
    state.arrivalDraft = createArrivalDraft(formatISO(today));
    render();
  });
  document.querySelector('#open-production')?.addEventListener('click', () => {
    openProductionModal(formatISO(today));
  });

  document.querySelectorAll<HTMLElement>('[data-anchor]').forEach((button) => {
    button.addEventListener('click', () => {
      if (['plan', 'review', 'inventory'].includes(button.dataset.anchor)) {
        state.activeManagerTab = button.dataset.anchor === 'plan' ? 'plan' : button.dataset.anchor;
        state.managerOpen = true;
      }
      const target = document.getElementById(button.dataset.anchor === 'review' ? 'plan' : button.dataset.anchor);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-manager-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeManagerTab = button.dataset.managerTab;
      state.managerOpen = true;
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-day]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedDate = button.dataset.day;
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-close-day]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedDate = null;
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-edit-production]').forEach((button) => {
    button.addEventListener('click', () => openProductionModal(button.dataset.editProduction));
  });

  document.querySelectorAll<HTMLElement>('[data-open-event]').forEach((button) => {
    button.addEventListener('click', () => {
      state.eventDraft = { date: button.dataset.openEvent, type: 'holiday', label: '' };
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-reallocate]').forEach((button) => {
    button.addEventListener('click', () => reallocateRemaining(derived));
  });

  bindArrivalModal();
  bindProductionModal(derived);
  bindEventModal();
  bindPlanControls();
}

function bindPlanControls() {
  document.querySelector('#monthly-target-input')?.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    setAppState((prev) => ({ ...prev, monthlyTargetKg: Number(target.value || 0) }));
  });

  document.querySelector('#validation-mode')?.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement;
    const validationMode = target.value === 'block' ? 'block' : 'warn';
    setAppState((prev) => ({ ...prev, validationMode }));
  });

  document.querySelectorAll<HTMLElement>('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => applyWeekPreset(button.dataset.preset));
  });

  document.querySelectorAll<HTMLInputElement>('[data-week-lock]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const weekId = checkbox.dataset.weekLock;
      const next = state.app.weeks.map((week) => week.id === weekId ? { ...week, locked: checkbox.checked } : week);
      setAppState((prev) => ({ ...prev, weeks: next }));
    });
  });

  document.querySelectorAll<HTMLInputElement>('[data-week-slider]').forEach((slider) => {
    slider.addEventListener('input', () => {
      const weekId = slider.dataset.weekSlider;
      const adjustedWeeks = rebalanceWeeks(state.app.weeks, weekId, Number(slider.value));
      setAppState((prev) => ({ ...prev, weeks: adjustedWeeks }));
    });
  });
}

function bindArrivalModal() {
  if (!state.arrivalDraft) return;

  document.querySelectorAll<HTMLElement>('[data-close-arrival]').forEach((button) => {
    button.addEventListener('click', () => {
      state.arrivalDraft = null;
      render();
    });
  });

  document.querySelector('#arrival-material')?.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement;
    state.arrivalDraft = createArrivalDraft(state.arrivalDraft.date, target.value);
    render();
  });

  document.querySelector('#arrival-form')?.addEventListener('input', handleArrivalDraftInput);
  document.querySelector('#arrival-form')?.addEventListener('change', handleArrivalDraftInput);
  document.querySelector('#arrival-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveArrivalDraft();
  });
}

function handleArrivalDraftInput(event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const { name, value } = target;
  if (name.startsWith('qc.')) state.arrivalDraft.qcChecklist[name.replace('qc.', '')] = castInputValue(name, value);
  else state.arrivalDraft[name] = castInputValue(name, value);
}

function saveArrivalDraft() {
  const draft = state.arrivalDraft;
  const errors = validateArrivalDraft(draft);
  if (errors.length) {
    window.alert(errors.join('\n'));
    return;
  }

  const delivery = {
    id: crypto.randomUUID(),
    materialType: draft.materialType,
    quantityKg: Number(draft.quantityKg),
    supplierName: draft.supplierName,
    vehicleNumber: draft.vehicleNumber,
    waybillTicket: draft.waybillTicket,
    driverName: draft.driverName,
    qcPassed: draft.qcPassed === 'true',
    date: draft.date,
    qcChecklist: { ...draft.qcChecklist },
  };

  setAppState((prev) => ({
    ...prev,
    deliveries: [...prev.deliveries, delivery],
  }));

  state.arrivalDraft = null;
  render();
}

function bindProductionModal(derived) {
  if (!state.productionDraft) return;

  document.querySelectorAll<HTMLElement>('[data-close-production]').forEach((button) => {
    button.addEventListener('click', () => {
      state.productionDraft = null;
      render();
    });
  });

  document.querySelector('#production-form')?.addEventListener('input', handleProductionDraftInput);
  document.querySelector('#production-form')?.addEventListener('change', handleProductionDraftInput);
  document.querySelector('#production-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveProductionDraft(derived);
  });
}

function handleProductionDraftInput(event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const { name, value } = target;
  if (name.startsWith('ccno.')) state.productionDraft.ccnoQC[name.replace('ccno.', '')] = castInputValue(name, value);
  else if (name.startsWith('exc.')) state.productionDraft.excQC[name.replace('exc.', '')] = castInputValue(name, value);
  else state.productionDraft[name] = castInputValue(name, value);
  syncProductionPreview();
}

function saveProductionDraft(derived) {
  const draft = state.productionDraft;
  const errors = validateProductionDraft(draft, derived, state.app.validationMode);
  if (errors.blocking.length) {
    window.alert(errors.blocking.join('\n'));
    return;
  }
  if (errors.warnings.length) {
    const proceed = window.confirm(`Warnings:\n\n${errors.warnings.join('\n')}\n\nSave anyway?`);
    if (!proceed) return;
  }

  const entry = {
    oilKg: Number(draft.oilKg),
    bcUsedKg: Number(draft.bcUsedKg),
    fcUsedKg: Number(draft.fcUsedKg),
    excKg: round(Number(draft.oilKg) * BYPRODUCT_RATIO),
    ccnoQC: { ...draft.ccnoQC },
    excQC: { ...draft.excQC },
    ccnoQCPassed: draft.ccnoQCPassed === 'true',
    excQCPassed: draft.excQCPassed === 'true',
  };

  setAppState((prev) => ({
    ...prev,
    dailyActuals: {
      ...prev.dailyActuals,
      [draft.date]: entry,
    },
  }));

  state.productionDraft = null;
  render();
}

function bindEventModal() {
  if (!state.eventDraft) return;

  document.querySelectorAll<HTMLElement>('[data-close-event]').forEach((button) => {
    button.addEventListener('click', () => {
      state.eventDraft = null;
      render();
    });
  });

  document.querySelector('#event-form')?.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    state.eventDraft[target.name] = target.value;
  });

  document.querySelector('#event-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.eventDraft.label.trim()) {
      window.alert('Event label is required.');
      return;
    }
    setAppState((prev) => {
      const rest = prev.dayEvents.filter((item) => item.date !== state.eventDraft.date);
      return {
        ...prev,
        dayEvents: [...rest, { id: crypto.randomUUID(), ...state.eventDraft }],
      };
    });
    state.eventDraft = null;
    render();
  });
}

function openProductionModal(date) {
  const existing = state.app.dailyActuals[date];
  state.productionDraft = existing
    ? {
        date,
        oilKg: existing.oilKg,
        bcUsedKg: existing.bcUsedKg,
        fcUsedKg: existing.fcUsedKg,
        ccnoQC: { ...existing.ccnoQC },
        excQC: { ...existing.excQC },
        ccnoQCPassed: String(existing.ccnoQCPassed),
        excQCPassed: String(existing.excQCPassed),
      }
    : createProductionDraft(date);
  render();
}

function createArrivalDraft(date, materialType = 'White Copra') {
  return {
    materialType,
    date,
    quantityKg: '',
    supplierName: '',
    vehicleNumber: '',
    waybillTicket: '',
    driverName: '',
    qcPassed: 'true',
    qcChecklist: materialType === 'Fresh Coconut' ? createFreshCoconutQC() : createWhiteCopraQC(),
  };
}

function createProductionDraft(date) {
  return {
    date,
    oilKg: '',
    bcUsedKg: '',
    fcUsedKg: '',
    ccnoQCPassed: 'true',
    excQCPassed: 'true',
    ccnoQC: {
      colour: 'clear',
      smell: 'pass',
      moistureImpurities: '',
      ffa: '',
      peroxideValue: '',
      aflatoxin: 'pass',
    },
    excQC: {
      moisture: '',
      residualOilContent: '',
      appearance: 'pass',
    },
  };
}

function createFreshCoconutQC() {
  return {
    moistureLevel: 'pass',
    coconutMaturity: 'old',
    impurities: 'pass',
    defectCoconutQty: '',
    rejectCoconutQty: '',
    truckCleanliness: 'pass',
    coverInTruck: 'pass',
    handlingMethod: 'pass',
    storageMethod: 'pass',
    coverInStorage: 'pass',
    unloadingPhoto: '',
  };
}

function createWhiteCopraQC() {
  return {
    batchId: '',
    tonnageOvenInput: '',
    tonnageOvenOutput: '',
    moistureInput: '',
    moistureOutput: '',
    ffa: '',
    colour: 'white',
    reductionPercentage: '',
    temperature: '',
    fungus: 'pass',
    charSmokeResidue: 'pass',
    oilContent: '',
    meatThickness: '',
    insectDamage: 'pass',
    storageAfterHotroom: 'pass',
    batchPhoto: '',
    rejectedQtyKg: '',
    rejectReason: '',
  };
}

function renderCalendar(derived) {
  const leadingBlanks = Array.from({ length: derived.days[0].date.getDay() }, () => '<div class="hidden xl:block"></div>').join('');
  return `${leadingBlanks}${derived.days.map((day) => renderDayCell(day, derived)).join('')}`;
}

function renderDayCell(day, derived) {
  const actual = state.app.dailyActuals[day.iso];
  const target = derived.dailyTargets[day.iso] || 0;
  const deliveries = derived.deliveriesByDate[day.iso] || [];
  const event = derived.eventMap[day.iso];
  const isToday = day.iso === formatISO(today);
  const weekend = day.date.getDay() === 0 || day.date.getDay() === 6;
  const attainment = target > 0 && actual ? (actual.oilKg / target) * 100 : null;
  const hasMissingActual = day.iso < formatISO(today) && target > 0 && !actual;

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
        <div class="flex items-center justify-between text-slate-500"><span>Actual</span><strong class="text-slate-900">${actual ? formatKg(actual.oilKg) : '-' } kg</strong></div>
        <div class="flex items-center justify-between text-slate-500"><span>EXC</span><strong>${actual ? formatKg(actual.excKg) : '-' } kg</strong></div>
      </div>
      ${attainment !== null ? `<div class="mt-4 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700">Attainment ${formatPercent(attainment)}</div>` : ''}
      ${hasMissingActual ? '<div class="mt-4 text-xs font-semibold text-amber-600">Missing production actual</div>' : ''}
    </button>
  `;
}

function renderManagerPanel(derived) {
  if (state.activeManagerTab === 'review') return renderReviewTab(derived);
  if (state.activeManagerTab === 'inventory') return renderInventoryTab(derived);
  return renderPlanTab(derived);
}

function renderPlanTab(derived) {
  return `
    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>Monthly target (kg)</span>
            <input id="monthly-target-input" type="number" min="0" step="10" value="${state.app.monthlyTargetKg}" class="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-200 ease-in-out focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>Validation mode</span>
            <select id="validation-mode" class="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-200 ease-in-out focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="warn" ${state.app.validationMode === 'warn' ? 'selected' : ''}>Warn</option>
              <option value="block" ${state.app.validationMode === 'block' ? 'selected' : ''}>Block</option>
            </select>
          </label>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          ${metricPill('Working days', String(derived.workingDays.length))}
          ${metricPill('Daily rate', `${formatKg(derived.workingDays.length ? state.app.monthlyTargetKg / derived.workingDays.length : 0)} kg`) }
          ${metricPill('Input need', `${formatKg(state.app.monthlyTargetKg * INPUT_RATIO)} kg`) }
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

function renderReviewTab(derived) {
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
            <div class="rounded-2xl bg-slate-50 p-4">Planned input: <strong class="text-slate-900">${formatKg(state.app.monthlyTargetKg * INPUT_RATIO)} kg</strong></div>
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

function renderInventoryTab(derived) {
  return `
    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <p class="font-display text-lg font-semibold">Raw material stock</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          ${inventoryStatCard('White Copra', derived.stock.bcStock, derived.review.remainingInputNeed, Math.max(0, derived.stock.bcStock - derived.review.remainingInputNeed))}
          ${inventoryStatCard('Fresh Coconut', derived.stock.fcStock, round(derived.review.remainingInputNeed * 0.3), Math.max(0, derived.stock.fcStock - round(derived.review.remainingInputNeed * 0.3)))}
        </div>
      </section>
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <p class="font-display text-lg font-semibold">Finished product stock</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          ${finishedStatCard('CCNO-T', derived.stock.ccnoStock, derived.review.actualMonth, derived.review.ccnoDispatched)}
          ${finishedStatCard('EXC', derived.stock.excStock, derived.review.excProduced, derived.review.excDispatched)}
        </div>
      </section>
      <section class="rounded-[28px] border border-slate-200 bg-white p-5">
        <p class="font-display text-lg font-semibold">Quarantine</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          ${quarantineCard('CCNO-T', derived.stock.ccnoQuarantine)}
          ${quarantineCard('EXC', derived.stock.excQuarantine)}
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

function renderDayDrawer(detail) {
  return `
    <div class="fixed inset-0 z-50 flex justify-end bg-slate-950/35 modal-backdrop">
      <div class="h-full w-full max-w-lg overflow-y-auto border-l border-white/70 bg-white p-6 shadow-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Day detail</p>
            <h3 class="mt-2 font-display text-2xl font-bold">${detail.dateLabel}</h3>
          </div>
          <button data-close-day="true" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
        </div>
        <div class="mt-6 space-y-5 text-sm text-slate-600">
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">Plan</p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>Target oil: <strong class="text-slate-900">${formatKg(detail.targetOil)} kg</strong></div>
              <div>Input required: <strong class="text-slate-900">${formatKg(detail.targetOil * INPUT_RATIO)} kg</strong></div>
            </div>
          </div>
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">Actual</p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>Oil: <strong class="text-slate-900">${formatKg(detail.actualOil)} kg</strong></div>
              <div>EXC: <strong class="text-slate-900">${formatKg(detail.excProduced)} kg</strong></div>
              <div>BC used: <strong class="text-slate-900">${formatKg(detail.bcUsed)} kg</strong></div>
              <div>FC used: <strong class="text-slate-900">${formatKg(detail.fcUsed)} kg</strong></div>
            </div>
          </div>
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">QC</p>
            <div class="mt-3 space-y-2">
              <div>CCNO-T: <strong class="text-slate-900">${detail.ccnoStatus}</strong></div>
              <div>EXC: <strong class="text-slate-900">${detail.excStatus}</strong></div>
            </div>
          </div>
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">Deliveries</p>
            <div class="mt-3 space-y-3">
              ${detail.deliveries.length ? detail.deliveries.map((delivery) => `<div class="rounded-2xl border border-slate-200 bg-white p-3"><div class="font-semibold text-slate-900">${delivery.materialType} • ${formatKg(delivery.quantityKg)} kg</div><div class="text-xs text-slate-500">${delivery.supplierName} • ${delivery.qcPassed ? 'PASS' : 'FAIL'}</div></div>`).join('') : '<div>No deliveries logged.</div>'}
            </div>
          </div>
          <div class="rounded-[24px] bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">Events</p>
            <div class="mt-3">${detail.eventSummary}</div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button data-edit-production="${detail.date}" class="rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-brand-600">Edit production</button>
            <button data-open-event="${detail.date}" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Mark holiday / maintenance</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderArrivalModal() {
  const draft = state.arrivalDraft;
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 modal-backdrop p-4">
      <div class="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-6 shadow-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Arrival</p>
            <h3 class="mt-2 font-display text-2xl font-bold">Receive and QC raw materials</h3>
          </div>
          <button data-close-arrival="true" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
        </div>
        <form id="arrival-form" class="mt-6 space-y-6">
          <div class="grid gap-4 md:grid-cols-3">
            ${fieldSelect('Material type', 'materialType', 'arrival-material', draft.materialType, ['White Copra', 'Fresh Coconut'])}
            ${fieldInput('Date', 'date', 'date', draft.date)}
            ${fieldInput('Quantity (kg)', 'quantityKg', 'number', draft.quantityKg, '0', '1')}
            ${fieldInput('Supplier name', 'supplierName', 'text', draft.supplierName)}
            ${fieldInput('Vehicle number', 'vehicleNumber', 'text', draft.vehicleNumber)}
            ${fieldInput('Waybill ticket', 'waybillTicket', 'text', draft.waybillTicket)}
            ${fieldInput('Driver name', 'driverName', 'text', draft.driverName)}
            ${fieldSelect('QC Result', 'qcPassed', '', draft.qcPassed, [{ label: 'PASS', value: 'true' }, { label: 'FAIL', value: 'false' }])}
          </div>
          <div class="rounded-[28px] bg-slate-50 p-5">
            <p class="font-display text-lg font-semibold">${draft.materialType} checklist</p>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              ${draft.materialType === 'Fresh Coconut' ? renderFreshCoconutFields(draft.qcChecklist) : renderWhiteCopraFields(draft.qcChecklist)}
            </div>
          </div>
          <div class="flex items-center justify-end gap-3">
            <button type="button" data-close-arrival="true" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Cancel</button>
            <button type="submit" class="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-slate-800">Save delivery</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderProductionModal(derived) {
  const draft = state.productionDraft;
  const dayEvent = derived.eventMap[draft.date];
  const target = derived.dailyTargets[draft.date] || 0;
  const expectedInput = Number(draft.oilKg || 0) * INPUT_RATIO;
  const actualInput = Number(draft.bcUsedKg || 0) + Number(draft.fcUsedKg || 0);
  const excProduced = Number(draft.oilKg || 0) * BYPRODUCT_RATIO;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 modal-backdrop p-4">
      <div class="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-6 shadow-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Production</p>
            <h3 class="mt-2 font-display text-2xl font-bold">Record output and finished product QC</h3>
          </div>
          <button data-close-production="true" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
        </div>
        ${dayEvent ? `<div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">${dayEvent.type} day: ${dayEvent.label}. Production save is blocked.</div>` : ''}
        <form id="production-form" class="mt-6 space-y-6">
          <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div class="rounded-[28px] bg-slate-50 p-5">
              <p class="font-display text-lg font-semibold">Production output</p>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                ${fieldInput('Date', 'date', 'date', draft.date)}
                ${fieldInput('Oil produced (kg)', 'oilKg', 'number', draft.oilKg, '0', '1')}
                ${fieldInput('White Copra used (kg)', 'bcUsedKg', 'number', draft.bcUsedKg, '0', '1')}
                ${fieldInput('Fresh Coconut used (kg)', 'fcUsedKg', 'number', draft.fcUsedKg, '0', '1')}
              </div>
              <div class="mt-5 grid gap-3 md:grid-cols-2 text-sm text-slate-600">
                <div class="rounded-2xl bg-white p-4">Target today: <strong id="preview-target" class="text-slate-900">${formatKg(target)} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">Expected input: <strong id="preview-expected" class="text-slate-900">${formatKg(expectedInput)} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">Actual input: <strong id="preview-actual-input" class="text-slate-900">${formatKg(actualInput)} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">EXC produced: <strong id="preview-exc" class="text-slate-900">${formatKg(excProduced)} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">BC after save: <strong id="preview-bc-after" class="text-slate-900">${formatKg(derived.stock.bcStock - Number(draft.bcUsedKg || 0))} kg</strong></div>
                <div class="rounded-2xl bg-white p-4">FC after save: <strong id="preview-fc-after" class="text-slate-900">${formatKg(derived.stock.fcStock - Number(draft.fcUsedKg || 0))} kg</strong></div>
              </div>
            </div>
            <div class="rounded-[28px] bg-slate-50 p-5">
              <p class="font-display text-lg font-semibold">CCNO-T QC</p>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                ${fieldSelect('Colour', 'ccno.colour', '', draft.ccnoQC.colour, ['clear', 'light yellow', 'golden', 'amber', 'brown'])}
                ${fieldSelect('Smell', 'ccno.smell', '', draft.ccnoQC.smell, ['pass', 'fail'])}
                ${fieldInput('M&I (%)', 'ccno.moistureImpurities', 'number', draft.ccnoQC.moistureImpurities, '0', '0.01')}
                ${fieldInput('FFA (%)', 'ccno.ffa', 'number', draft.ccnoQC.ffa, '0', '0.01')}
                ${fieldInput('PV (meq/kg)', 'ccno.peroxideValue', 'number', draft.ccnoQC.peroxideValue, '0', '0.01')}
                ${fieldInput('Aflatoxin', 'ccno.aflatoxin', 'text', draft.ccnoQC.aflatoxin)}
                ${fieldSelect('CCNO-T result', 'ccnoQCPassed', '', draft.ccnoQCPassed, [{ label: 'PASS', value: 'true' }, { label: 'FAIL', value: 'false' }])}
              </div>
              <p class="mt-6 font-display text-lg font-semibold">EXC QC</p>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                ${fieldInput('Moisture (%)', 'exc.moisture', 'number', draft.excQC.moisture, '0', '0.01')}
                ${fieldInput('Residual oil (%)', 'exc.residualOilContent', 'number', draft.excQC.residualOilContent, '0', '0.01')}
                ${fieldSelect('Appearance', 'exc.appearance', '', draft.excQC.appearance, ['pass', 'fail'])}
                ${fieldSelect('EXC result', 'excQCPassed', '', draft.excQCPassed, [{ label: 'PASS', value: 'true' }, { label: 'FAIL', value: 'false' }])}
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3">
            <button type="button" data-close-production="true" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Cancel</button>
            <button type="submit" class="rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-brand-600">Save production</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function syncProductionPreview() {
  if (!state.productionDraft) return;
  const derived = buildDerived(state.app);
  const date = state.productionDraft.date;
  const oil = Number(state.productionDraft.oilKg || 0);
  const bcUsed = Number(state.productionDraft.bcUsedKg || 0);
  const fcUsed = Number(state.productionDraft.fcUsedKg || 0);
  const target = derived.dailyTargets[date] || 0;

  setText('#preview-target', `${formatKg(target)} kg`);
  setText('#preview-expected', `${formatKg(oil * INPUT_RATIO)} kg`);
  setText('#preview-actual-input', `${formatKg(bcUsed + fcUsed)} kg`);
  setText('#preview-exc', `${formatKg(oil * BYPRODUCT_RATIO)} kg`);
  setText('#preview-bc-after', `${formatKg(derived.stock.bcStock - bcUsed)} kg`);
  setText('#preview-fc-after', `${formatKg(derived.stock.fcStock - fcUsed)} kg`);
}

function renderEventModal() {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 modal-backdrop p-4">
      <div class="w-full max-w-lg rounded-[32px] border border-white/70 bg-white p-6 shadow-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-brand-600">Calendar event</p>
            <h3 class="mt-2 font-display text-2xl font-bold">Mark holiday or maintenance</h3>
          </div>
          <button data-close-event="true" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">${iconClose()}</button>
        </div>
        <form id="event-form" class="mt-6 space-y-4">
          ${fieldInput('Date', 'date', 'date', state.eventDraft.date)}
          ${fieldSelect('Type', 'type', '', state.eventDraft.type, ['holiday', 'maintenance'])}
          ${fieldInput('Label', 'label', 'text', state.eventDraft.label)}
          <div class="flex items-center justify-end gap-3">
            <button type="button" data-close-event="true" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-300 ease-in-out hover:border-brand-500 hover:text-brand-600">Cancel</button>
            <button type="submit" class="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-slate-800">Save event</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderFreshCoconutFields(qc) {
  return [
    fieldSelect('Moisture level', 'qc.moistureLevel', '', qc.moistureLevel, ['pass', 'fail']),
    fieldSelect('Coconut maturity', 'qc.coconutMaturity', '', qc.coconutMaturity, ['young', 'mengkal', 'old', 'mixed']),
    fieldSelect('Impurities', 'qc.impurities', '', qc.impurities, ['pass', 'fail']),
    fieldInput('Defect coconut qty', 'qc.defectCoconutQty', 'number', qc.defectCoconutQty, '0', '1'),
    fieldInput('Reject coconut qty', 'qc.rejectCoconutQty', 'number', qc.rejectCoconutQty, '0', '1'),
    fieldSelect('Truck cleanliness', 'qc.truckCleanliness', '', qc.truckCleanliness, ['pass', 'fail']),
    fieldSelect('Cover in truck', 'qc.coverInTruck', '', qc.coverInTruck, ['pass', 'fail']),
    fieldSelect('Handling method', 'qc.handlingMethod', '', qc.handlingMethod, ['pass', 'fail']),
    fieldSelect('Storage method', 'qc.storageMethod', '', qc.storageMethod, ['pass', 'fail']),
    fieldSelect('Cover in storage', 'qc.coverInStorage', '', qc.coverInStorage, ['pass', 'fail']),
    fieldInput('Unloading photo ref', 'qc.unloadingPhoto', 'text', qc.unloadingPhoto),
  ].join('');
}

function renderWhiteCopraFields(qc) {
  return [
    fieldInput('Batch ID', 'qc.batchId', 'text', qc.batchId),
    fieldInput('Tonnage oven input', 'qc.tonnageOvenInput', 'number', qc.tonnageOvenInput, '0', '1'),
    fieldInput('Tonnage oven output', 'qc.tonnageOvenOutput', 'number', qc.tonnageOvenOutput, '0', '1'),
    fieldInput('Moisture input (%)', 'qc.moistureInput', 'number', qc.moistureInput, '0', '0.01'),
    fieldInput('Moisture output (%)', 'qc.moistureOutput', 'number', qc.moistureOutput, '0', '0.01'),
    fieldInput('FFA (%)', 'qc.ffa', 'number', qc.ffa, '0', '0.01'),
    fieldSelect('Colour', 'qc.colour', '', qc.colour, ['white', 'yellow', 'brown']),
    fieldInput('Reduction (%)', 'qc.reductionPercentage', 'number', qc.reductionPercentage, '0', '0.01'),
    fieldInput('Temperature', 'qc.temperature', 'number', qc.temperature, '0', '0.1'),
    fieldSelect('Fungus', 'qc.fungus', '', qc.fungus, ['pass', 'fail']),
    fieldSelect('Char / smoke residue', 'qc.charSmokeResidue', '', qc.charSmokeResidue, ['pass', 'fail']),
    fieldInput('Oil content (%)', 'qc.oilContent', 'number', qc.oilContent, '0', '0.01'),
    fieldInput('Meat thickness', 'qc.meatThickness', 'text', qc.meatThickness),
    fieldSelect('Insect damage', 'qc.insectDamage', '', qc.insectDamage, ['pass', 'fail']),
    fieldSelect('Storage after hotroom', 'qc.storageAfterHotroom', '', qc.storageAfterHotroom, ['pass', 'fail']),
    fieldInput('Batch photo ref', 'qc.batchPhoto', 'text', qc.batchPhoto),
    fieldInput('Rejected qty (kg)', 'qc.rejectedQtyKg', 'number', qc.rejectedQtyKg, '0', '1'),
    fieldInput('Reject reason', 'qc.rejectReason', 'text', qc.rejectReason),
  ].join('');
}

function validateArrivalDraft(draft) {
  const required = ['materialType', 'date', 'quantityKg', 'supplierName', 'vehicleNumber', 'waybillTicket', 'driverName', 'qcPassed'];
  const errors = required.filter((key) => !String(draft[key] ?? '').trim()).map((key) => `${key} is required`);
  Object.entries(draft.qcChecklist).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) errors.push(`QC field ${key} is required`);
  });
  return errors;
}

function validateProductionDraft(draft, derived, validationMode) {
  const blocking = [];
  const warnings = [];

  ['date', 'oilKg', 'bcUsedKg', 'fcUsedKg', 'ccnoQCPassed', 'excQCPassed'].forEach((key) => {
    if (draft[key] === '' || draft[key] === null || draft[key] === undefined) blocking.push(`${key} is required`);
  });
  Object.entries(draft.ccnoQC).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) blocking.push(`CCNO-T QC ${key} is required`);
  });
  Object.entries(draft.excQC).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) blocking.push(`EXC QC ${key} is required`);
  });

  if (derived.eventMap[draft.date]) blocking.push('Production cannot be saved on holiday or maintenance days.');

  const expected = Number(draft.oilKg || 0) * INPUT_RATIO;
  const actual = Number(draft.bcUsedKg || 0) + Number(draft.fcUsedKg || 0);
  const delta = Math.abs(expected - actual);
  if (delta > INPUT_TOLERANCE) {
    const message = `Input mismatch exceeds tolerance (${formatKg(delta)} kg).`;
    if (validationMode === 'block') blocking.push(message);
    else warnings.push(message);
  }
  if (Number(draft.bcUsedKg || 0) > derived.stock.bcStock) warnings.push('White Copra usage exceeds available stock.');
  if (Number(draft.fcUsedKg || 0) > derived.stock.fcStock) warnings.push('Fresh Coconut usage exceeds available stock.');

  return { blocking, warnings };
}

function deriveStock(appState) {
  const passedBC = appState.deliveries
    .filter((item) => item.materialType === 'White Copra' && item.qcPassed)
    .reduce((sum, item) => sum + Number(item.quantityKg) - Number(item.qcChecklist.rejectedQtyKg || 0), 0);
  const passedFC = appState.deliveries
    .filter((item) => item.materialType === 'Fresh Coconut' && item.qcPassed)
    .reduce((sum, item) => sum + Number(item.quantityKg) - Number(item.qcChecklist.rejectCoconutQty || 0), 0);

  const actuals = Object.values(appState.dailyActuals) as any[];
  const bcUsed = actuals.reduce((sum, item) => sum + Number(item.bcUsedKg || 0), 0);
  const fcUsed = actuals.reduce((sum, item) => sum + Number(item.fcUsedKg || 0), 0);
  const ccnoStock = actuals.filter((item) => item.ccnoQCPassed).reduce((sum, item) => sum + Number(item.oilKg || 0), 0)
    - appState.dispatches.filter((item) => item.productType === 'CCNO-T').reduce((sum, item) => sum + Number(item.quantityKg || 0), 0);
  const excStock = actuals.filter((item) => item.excQCPassed).reduce((sum, item) => sum + Number(item.excKg || 0), 0)
    - appState.dispatches.filter((item) => item.productType === 'EXC').reduce((sum, item) => sum + Number(item.quantityKg || 0), 0);

  return {
    bcStock: round(passedBC - bcUsed),
    fcStock: round(passedFC - fcUsed),
    ccnoStock: round(ccnoStock),
    excStock: round(excStock),
    ccnoQuarantine: round(actuals.filter((item) => !item.ccnoQCPassed).reduce((sum, item) => sum + Number(item.oilKg || 0), 0)),
    excQuarantine: round(actuals.filter((item) => !item.excQCPassed).reduce((sum, item) => sum + Number(item.excKg || 0), 0)),
  };
}

function buildReviewData(appState, weeks, stock) {
  const actualEntries = Object.entries(appState.dailyActuals) as Array<[string, any]>;
  const actualMonth = actualEntries.reduce((sum, [, actual]) => sum + Number(actual.oilKg || 0), 0);
  const actualInput = actualEntries.reduce((sum, [, actual]) => sum + Number(actual.bcUsedKg || 0) + Number(actual.fcUsedKg || 0), 0);
  const bcUsed = actualEntries.reduce((sum, [, actual]) => sum + Number(actual.bcUsedKg || 0), 0);
  const fcUsed = actualEntries.reduce((sum, [, actual]) => sum + Number(actual.fcUsedKg || 0), 0);
  const excProduced = actualEntries.reduce((sum, [, actual]) => sum + Number(actual.excKg || 0), 0);
  const ccnoPasses = actualEntries.filter(([, actual]) => actual.ccnoQCPassed).length;
  const excPasses = actualEntries.filter(([, actual]) => actual.excQCPassed).length;
  const deliveryPassRate = appState.deliveries.length ? (appState.deliveries.filter((item) => item.qcPassed).length / appState.deliveries.length) * 100 : 0;

  const weekRows = weeks.map((week, index) => {
    const actual = week.allDates.reduce((sum, date) => sum + Number(appState.dailyActuals[date]?.oilKg || 0), 0);
    const variance = actual - week.weekTargetKg;
    return {
      label: `Week ${index + 1}`,
      plan: round(week.weekTargetKg),
      actual: round(actual),
      variance: round(variance),
      variancePercent: week.weekTargetKg ? (variance / week.weekTargetKg) * 100 : 0,
    };
  });

  const remainingTarget = Math.max(0, round(appState.monthlyTargetKg - actualMonth));
  const remainingInputNeed = round(remainingTarget * INPUT_RATIO);
  const ccnoDispatched = appState.dispatches.filter((item) => item.productType === 'CCNO-T').reduce((sum, item) => sum + Number(item.quantityKg), 0);
  const excDispatched = appState.dispatches.filter((item) => item.productType === 'EXC').reduce((sum, item) => sum + Number(item.quantityKg), 0);

  return {
    weekRows,
    actualMonth: round(actualMonth),
    actualInput: round(actualInput),
    bcUsed: round(bcUsed),
    fcUsed: round(fcUsed),
    excProduced: round(excProduced),
    remainingTarget,
    remainingInputNeed,
    stockStatus: stock.bcStock + stock.fcStock >= remainingInputNeed ? 'Feasible from current stock' : 'Needs more input stock',
    monthAttainment: appState.monthlyTargetKg ? (actualMonth / appState.monthlyTargetKg) * 100 : 0,
    ccnoPassRate: actualEntries.length ? (ccnoPasses / actualEntries.length) * 100 : 0,
    excPassRate: actualEntries.length ? (excPasses / actualEntries.length) * 100 : 0,
    deliveryPassRate,
    ccnoDispatched: round(ccnoDispatched),
    excDispatched: round(excDispatched),
  };
}

function buildMovementLog(appState) {
  const movements = [];
  appState.deliveries.forEach((delivery) => {
    const reject = Number(delivery.materialType === 'White Copra' ? delivery.qcChecklist.rejectedQtyKg || 0 : delivery.qcChecklist.rejectCoconutQty || 0);
    movements.push({
      date: delivery.date,
      type: 'Delivery',
      item: delivery.materialType,
      direction: delivery.qcPassed ? 'IN' : 'BLOCKED',
      qty: delivery.qcPassed ? Number(delivery.quantityKg) - reject : 0,
    });
  });
  (Object.entries(appState.dailyActuals) as Array<[string, any]>).forEach(([date, actual]) => {
    movements.push({ date, type: 'Production', item: 'White Copra', direction: 'OUT', qty: Number(actual.bcUsedKg || 0) });
    movements.push({ date, type: 'Production', item: 'Fresh Coconut', direction: 'OUT', qty: Number(actual.fcUsedKg || 0) });
    movements.push({ date, type: 'Production', item: 'CCNO-T', direction: actual.ccnoQCPassed ? 'IN' : 'QUAR', qty: Number(actual.oilKg || 0) });
    movements.push({ date, type: 'Production', item: 'EXC', direction: actual.excQCPassed ? 'IN' : 'QUAR', qty: Number(actual.excKg || 0) });
  });
  return movements.sort((a, b) => b.date.localeCompare(a.date));
}

function buildDayDetail(date, appState, derived) {
  const actual = appState.dailyActuals[date];
  const deliveries = derived.deliveriesByDate[date] || [];
  const event = derived.eventMap[date];
  return {
    date,
    dateLabel: formatDateLong(date),
    targetOil: round(derived.dailyTargets[date] || 0),
    actualOil: round(actual?.oilKg || 0),
    bcUsed: round(actual?.bcUsedKg || 0),
    fcUsed: round(actual?.fcUsedKg || 0),
    excProduced: round(actual?.excKg || 0),
    deliveries,
    eventSummary: event ? `${event.type} • ${event.label}` : 'No holiday or maintenance event',
    ccnoStatus: actual ? (actual.ccnoQCPassed ? 'PASS' : 'FAIL / quarantine') : 'No production recorded',
    excStatus: actual ? (actual.excQCPassed ? 'PASS' : 'FAIL / quarantine') : 'No production recorded',
  };
}

function generateWeekAllocations(monthKey, monthlyTargetKg, dayEvents, previousWeeksById = {}) {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const days = getMonthDays(year, monthIndex);
  const weekMap = new Map();

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

function rebalanceWeeks(weeks, targetId, nextValue) {
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

function applyWeekPreset(preset) {
  const unlocked = state.app.weeks.filter((week) => !week.locked);
  if (!unlocked.length) return;
  const lockedTotal = state.app.weeks.filter((week) => week.locked).reduce((sum, week) => sum + week.percentage, 0);
  const available = Math.max(0, 100 - lockedTotal);
  let weights = unlocked.map(() => 1);
  if (preset === 'front') weights = unlocked.map((_, index) => unlocked.length - index);
  if (preset === 'back') weights = unlocked.map((_, index) => index + 1);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const adjusted = state.app.weeks.map((week) => {
    if (week.locked) return week;
    const unlockedIndex = unlocked.findIndex((item) => item.id === week.id);
    return {
      ...week,
      percentage: round((available * weights[unlockedIndex]) / totalWeight, 2),
    };
  });

  setAppState((prev) => ({ ...prev, weeks: normalizeWeekObjects(adjusted) }));
}

function reallocateRemaining(derived) {
  const actualByWeek = Object.fromEntries(derived.review.weekRows.map((row, index) => [derived.weeks[index].id, row.actual]));
  const completed = derived.weeks.filter((week) => actualByWeek[week.id] > 0);
  const future = derived.weeks.filter((week) => actualByWeek[week.id] === 0);
  if (!future.length) return;

  const remainingTarget = Math.max(0, state.app.monthlyTargetKg - derived.review.actualMonth);
  const futurePercent = state.app.monthlyTargetKg ? round((remainingTarget / state.app.monthlyTargetKg) * 100, 2) : 0;
  const eachFuture = future.length ? futurePercent / future.length : 0;

  const updated = state.app.weeks.map((week) => {
    if (completed.some((item) => item.id === week.id)) {
      const lockedPercent = state.app.monthlyTargetKg ? (actualByWeek[week.id] / state.app.monthlyTargetKg) * 100 : week.percentage;
      return { ...week, locked: true, percentage: round(lockedPercent, 2) };
    }
    return { ...week, locked: false, percentage: round(eachFuture, 2) };
  });

  setAppState((prev) => ({ ...prev, weeks: normalizeWeekObjects(updated) }));
}

function normalizeWeekObjects(weeks) {
  const normalized = normalizePercentages(weeks.map((week) => week.percentage));
  return weeks.map((week, index) => ({ ...week, percentage: normalized[index] }));
}

function normalizePercentages(values) {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const normalized = values.map((value) => round((value / total) * 100, 2));
  const delta = round(100 - normalized.reduce((sum, value) => sum + value, 0), 2);
  if (normalized.length) normalized[normalized.length - 1] = round(normalized[normalized.length - 1] + delta, 2);
  return normalized;
}

function isWorkingDay(isoDate, dayEvents) {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const event = dayEvents.find((item) => item.date === isoDate);
  return !weekend && !event;
}

function getMonthDays(year, monthIndex) {
  const date = new Date(year, monthIndex, 1);
  const days = [];
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

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function castInputValue(name, value) {
  if (value === '') return '';
  const numericFields = ['quantityKg', 'defectCoconutQty', 'rejectCoconutQty', 'tonnageOvenInput', 'tonnageOvenOutput', 'moistureInput', 'moistureOutput', 'ffa', 'reductionPercentage', 'temperature', 'oilContent', 'rejectedQtyKg', 'oilKg', 'bcUsedKg', 'fcUsedKg', 'moistureImpurities', 'peroxideValue', 'moisture', 'residualOilContent'];
  if (numericFields.some((field) => name.endsWith(field) || name === field)) return Number(value);
  return value;
}

function fieldInput(label, name, type, value, min = '', step = '') {
  return `
    <label class="space-y-2 text-sm font-medium text-slate-700">
      <span>${label}</span>
      <input name="${name}" type="${type}" value="${value ?? ''}" ${min !== '' ? `min="${min}"` : ''} ${step !== '' ? `step="${step}"` : ''} class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all duration-200 ease-in-out focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
    </label>
  `;
}

function fieldSelect(label, name, id, value, options) {
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

function metricCard(label, value, note) {
  return `<div class="rounded-3xl bg-slate-50 px-4 py-4"><div class="text-xs uppercase tracking-[0.18em] text-slate-400">${label}</div><div class="mt-2 text-lg font-bold text-slate-900">${value}</div><div class="mt-1 text-xs text-slate-500">${note}</div></div>`;
}
function darkMetricCard(label, value) {
  return `<div class="rounded-2xl bg-white/10 px-4 py-4"><div class="text-xs uppercase tracking-[0.18em] text-slate-300">${label}</div><div class="mt-2 text-lg font-bold text-white">${value}</div></div>`;
}
function metricPill(label, value) {
  return `<div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><span class="text-slate-400">${label}</span><div class="mt-1 font-semibold text-slate-900">${value}</div></div>`;
}
function inventorySnapshotCard(label, stock, reserved, available) {
  return `<div class="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600"><div class="font-semibold text-slate-900">${label}</div><div class="mt-2">In stock: ${formatKg(stock)} kg</div><div>Reserved: ${formatKg(reserved)} kg</div><div>Available: ${formatKg(available)} kg</div></div>`;
}
function inventoryStatCard(label, stock, reserved, available) {
  return `<div class="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600"><div class="font-semibold text-slate-900">${label}</div><div class="mt-3 grid gap-2"><div>In stock: <strong class="text-slate-900">${formatKg(stock)} kg</strong></div><div>Reserved: <strong class="text-slate-900">${formatKg(reserved)} kg</strong></div><div>Available: <strong class="text-slate-900">${formatKg(available)} kg</strong></div></div></div>`;
}
function finishedStatCard(label, stock, produced, dispatched) {
  return `<div class="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600"><div class="font-semibold text-slate-900">${label}</div><div class="mt-3 grid gap-2"><div>In stock: <strong class="text-slate-900">${formatKg(stock)} kg</strong></div><div>Produced MTD: <strong class="text-slate-900">${formatKg(produced)} kg</strong></div><div>Dispatched MTD: <strong class="text-slate-900">${formatKg(dispatched)} kg</strong></div></div></div>`;
}
function quarantineCard(label, qty) {
  return `<div class="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700"><div class="font-semibold">${label}</div><div class="mt-2">Quarantine: <strong>${formatKg(qty)} kg</strong></div></div>`;
}
function stockBadge(label, value, note, classes) {
  return `<div class="rounded-2xl border border-slate-200 px-4 py-3 ${classes}"><div class="text-xs uppercase tracking-[0.18em] text-slate-400">${label}</div><div class="mt-1 text-sm font-bold text-slate-900">${formatTon(value)} t</div><div class="text-[11px] text-slate-500">${note}</div></div>`;
}
function legendPill(title, note, classes) {
  return `<div class="rounded-full px-3 py-2 ${classes}"><strong>${title}</strong> ${note}</div>`;
}
function sidebarLink(anchor, label, icon, collapsed) {
  const active = (anchor === 'plan' && state.activeManagerTab === 'plan') || state.activeManagerTab === anchor;
  return `<button data-anchor="${anchor}" class="sidebar-link ${active ? 'active' : ''} flex w-full items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-2xl border border-white/5 px-3 py-3 text-sm font-medium text-slate-300 transition-all duration-300 ease-in-out hover:border-white/10 hover:bg-white/10 hover:text-white">${icon}${collapsed ? '' : `<span>${label}</span>`}</button>`;
}
function managerTabButton(tab, label) {
  return `<button data-manager-tab="${tab}" class="rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 ease-in-out ${state.activeManagerTab === tab ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600'}">${label}</button>`;
}
function renderAlertRows(derived) {
  const rows = [];
  if (derived.review.remainingTarget > 0) rows.push(`<div class="rounded-2xl bg-slate-50 px-4 py-3">Remaining target this month: <strong class="text-slate-900">${formatKg(derived.review.remainingTarget)} kg</strong></div>`);
  if (derived.stock.ccnoQuarantine > 0 || derived.stock.excQuarantine > 0) rows.push(`<div class="rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">Quarantine stock present. CCNO-T ${formatKg(derived.stock.ccnoQuarantine)} kg, EXC ${formatKg(derived.stock.excQuarantine)} kg.</div>`);
  if (derived.stock.bcStock < derived.review.remainingInputNeed) rows.push('<div class="rounded-2xl bg-amber-50 px-4 py-3 text-amber-700">BC inventory is tighter than the remaining month input need.</div>');
  if (!rows.length) rows.push('<div class="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">No immediate stock or plan exceptions detected.</div>');
  return rows.join('');
}

function formatISO(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function formatMonthKey(date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}
function parseMonthKey(value) {
  const [year, month] = value.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}
function formatMonthLong(monthKey) {
  const { year, monthIndex } = parseMonthKey(monthKey);
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
function formatDateShort(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatDateLong(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function formatKg(value) {
  return round(Number(value || 0)).toLocaleString('en-US', { maximumFractionDigits: 2 });
}
function formatTon(value) {
  return (Number(value || 0) / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
function formatPercent(value) {
  return `${round(Number(value || 0), 1)}%`;
}
function formatSignedPercent(value) {
  const rounded = round(Number(value || 0), 1);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}
function round(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}
function addDays(iso, delta) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return formatISO(date);
}

function iconMenu() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16M4 12h16M4 17h16" /></svg>'; }
function iconGear() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.898 1.924 1.724 1.724 0 001.066 2.573 1.724 1.724 0 010 3.35 1.724 1.724 0 00-1.066 2.573 1.724 1.724 0 01-2.898 1.924 1.724 1.724 0 00-2.573 1.066 1.724 1.724 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.898-1.924 1.724 1.724 0 00-1.066-2.573 1.724 1.724 0 010-3.35 1.724 1.724 0 001.066-2.573 1.724 1.724 0 012.898-1.924 1.724 1.724 0 002.573-1.066z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'; }
function iconClose() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" /></svg>'; }
function iconTruck() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 17h6m-8 0H5a2 2 0 01-2-2V8a2 2 0 012-2h10a2 2 0 012 2v7m0 0h1.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 0021 12.586V11a1 1 0 00-1-1h-3m0 7a2 2 0 11-4 0 2 2 0 014 0zm-10 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg>'; }
function iconFactory() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 21h18M5 21V9l5 3V9l5 3V5l4 2v14" /></svg>'; }
function iconLeaf() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 21c6 0 14-4 14-14-6 0-14 4-14 14zm0 0c2-3 5-6 9-8" /></svg>'; }
function iconDashboard() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" /></svg>'; }
function iconCalendar() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10m-13 9h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>'; }
function iconBars() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h10M4 18h7" /></svg>'; }
function iconChart() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 12l3-3 2 2 5-5m0 0v5m0-5h-5M5 19h14" /></svg>'; }
function iconArchive() { return '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 8h14M5 8l1 11a2 2 0 002 2h8a2 2 0 002-2l1-11M9 8V5a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>'; }

render();
