import type {
  AppState,
  ArrivalDraft,
  DailyActualEntry,
  MaterialType,
  ProductionDraft,
  RuntimeState,
} from '@/features/ppic/domain/types';

export function createRuntimeState(appState: AppState): RuntimeState {
  return {
    sidebarCollapsed: false,
    managerOpen: true,
    activeManagerTab: 'plan',
    selectedDate: null,
    arrivalDraft: null,
    productionDraft: null,
    eventDraft: null,
    app: appState,
  };
}

export function createArrivalDraft(date: string, materialType: MaterialType = 'White Copra'): ArrivalDraft {
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

export function createProductionDraft(date: string): ProductionDraft {
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

export function createProductionDraftFromActual(date: string, existing: DailyActualEntry): ProductionDraft {
  return {
    date,
    oilKg: existing.oilKg ?? '',
    bcUsedKg: existing.bcUsedKg ?? '',
    fcUsedKg: existing.fcUsedKg ?? '',
    ccnoQC: { ...existing.ccnoQC },
    excQC: { ...existing.excQC },
    ccnoQCPassed: String(existing.ccnoQCPassed) as 'true' | 'false',
    excQCPassed: String(existing.excQCPassed) as 'true' | 'false',
  };
}

export function createFreshCoconutQC() {
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

export function createWhiteCopraQC() {
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
