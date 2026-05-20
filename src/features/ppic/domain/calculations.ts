import { INPUT_RATIO } from '@/features/ppic/domain/constants';
import { formatDateLong, round } from '@/features/ppic/domain/dates';
import type {
  AppState,
  DailyActualEntry,
  DayDetail,
  Delivery,
  MovementEntry,
  ReviewSummary,
  StockSummary,
  WeekAllocation,
} from '@/features/ppic/domain/types';

export function deriveStock(appState: AppState): StockSummary {
  const passedBC = appState.deliveries
    .filter((item) => item.materialType === 'White Copra' && item.qcPassed)
    .reduce((sum, item) => sum + Number(item.quantityKg) - Number(item.qcChecklist.rejectedQtyKg || 0), 0);
  const passedFC = appState.deliveries
    .filter((item) => item.materialType === 'Fresh Coconut' && item.qcPassed)
    .reduce((sum, item) => sum + Number(item.quantityKg) - Number(item.qcChecklist.rejectCoconutQty || 0), 0);

  const actuals = Object.values(appState.dailyActuals) as DailyActualEntry[];
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

export function buildReviewData(appState: AppState, weeks: WeekAllocation[], stock: StockSummary): ReviewSummary {
  const actualEntries = Object.entries(appState.dailyActuals) as Array<[string, DailyActualEntry]>;
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

export function buildMovementLog(appState: AppState): MovementEntry[] {
  const movements: MovementEntry[] = [];
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
  (Object.entries(appState.dailyActuals) as Array<[string, DailyActualEntry]>).forEach(([date, actual]) => {
    movements.push({ date, type: 'Production', item: 'White Copra', direction: 'OUT', qty: Number(actual.bcUsedKg || 0) });
    movements.push({ date, type: 'Production', item: 'Fresh Coconut', direction: 'OUT', qty: Number(actual.fcUsedKg || 0) });
    movements.push({ date, type: 'Production', item: 'CCNO-T', direction: actual.ccnoQCPassed ? 'IN' : 'QUAR', qty: Number(actual.oilKg || 0) });
    movements.push({ date, type: 'Production', item: 'EXC', direction: actual.excQCPassed ? 'IN' : 'QUAR', qty: Number(actual.excKg || 0) });
  });
  return movements.sort((a, b) => b.date.localeCompare(a.date));
}

export function buildDayDetail(
  date: string,
  appState: AppState,
  derived: {
    dailyTargets: Record<string, number>;
    deliveriesByDate: Record<string, Delivery[]>;
    eventMap: Record<string, AppState['dayEvents'][number]>;
  }
): DayDetail {
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
    eventSummary: event ? `${event.type} â€¢ ${event.label}` : 'No holiday or maintenance event',
    ccnoStatus: actual ? (actual.ccnoQCPassed ? 'PASS' : 'FAIL / quarantine') : 'No production recorded',
    excStatus: actual ? (actual.excQCPassed ? 'PASS' : 'FAIL / quarantine') : 'No production recorded',
  };
}
