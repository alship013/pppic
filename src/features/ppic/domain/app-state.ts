import { BYPRODUCT_RATIO, INPUT_RATIO } from '@/features/ppic/domain/constants';
import { addDays, formatISO } from '@/features/ppic/domain/dates';
import { generateWeekAllocations } from '@/features/ppic/domain/planning';
import type { AppState, WeekAllocation } from '@/features/ppic/domain/types';

export function createDefaultAppState(today: Date, currentMonthKey: string): AppState {
  const seedDeliveries = [
    {
      id: crypto.randomUUID(),
      materialType: 'White Copra' as const,
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
      materialType: 'Fresh Coconut' as const,
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
        excKg: Math.round((620 * BYPRODUCT_RATIO + Number.EPSILON) * 100) / 100,
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

export function normalizeAppState(input: Partial<AppState> | Record<string, unknown>, currentMonthKey: string): AppState {
  const candidate = input as Partial<AppState>;
  const rawWeeks = Array.isArray(candidate.weeks) ? candidate.weeks : [];
  const normalized: AppState = {
    product: candidate.product || 'CCNO-T',
    planningMonth: candidate.planningMonth || currentMonthKey,
    monthlyTargetKg: Number(candidate.monthlyTargetKg || 0),
    weeks: rawWeeks as WeekAllocation[],
    deliveries: Array.isArray(candidate.deliveries) ? candidate.deliveries : [],
    dailyActuals: candidate.dailyActuals || {},
    dayEvents: Array.isArray(candidate.dayEvents) ? candidate.dayEvents : [],
    dispatches: Array.isArray(candidate.dispatches) ? candidate.dispatches : [],
    recipeInputRatio: Number(candidate.recipeInputRatio || INPUT_RATIO),
    recipeByProductRatio: Number(candidate.recipeByProductRatio || BYPRODUCT_RATIO),
    validationMode: candidate.validationMode === 'block' ? 'block' : 'warn',
  };

  normalized.weeks = generateWeekAllocations(
    normalized.planningMonth,
    normalized.monthlyTargetKg,
    normalized.dayEvents,
    Object.fromEntries((normalized.weeks || []).map((week) => [week.id, week]))
  );

  return normalized;
}
