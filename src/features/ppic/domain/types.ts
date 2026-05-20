export type PassFail = 'pass' | 'fail';
export type ValidationMode = 'warn' | 'block';
export type MaterialType = 'White Copra' | 'Fresh Coconut';
export type ProductType = 'CCNO-T' | 'EXC';
export type DayEventType = 'holiday' | 'maintenance';
export type ManagerTab = 'plan' | 'review' | 'inventory';

export type WhiteCopraQC = Record<string, string | number | undefined> & {
  rejectedQtyKg?: number;
};

export type FreshCoconutQC = Record<string, string | number | undefined> & {
  rejectCoconutQty?: number;
};

export type CcnoQc = Record<string, string | number | undefined>;
export type ExcQc = Record<string, string | number | undefined>;

export interface Delivery {
  id: string;
  materialType: MaterialType;
  quantityKg: number;
  supplierName: string;
  vehicleNumber: string;
  waybillTicket: string;
  driverName: string;
  qcPassed: boolean;
  date: string;
  qcChecklist: WhiteCopraQC | FreshCoconutQC;
}

export interface DailyActualEntry {
  oilKg?: number;
  bcUsedKg?: number;
  fcUsedKg?: number;
  excKg?: number;
  ccnoQC?: CcnoQc;
  excQC?: ExcQc;
  ccnoQCPassed?: boolean;
  excQCPassed?: boolean;
}

export interface DayEvent {
  id: string;
  date: string;
  type: DayEventType;
  label: string;
}

export interface DispatchRecord {
  productType: ProductType;
  quantityKg: number;
}

export interface WeekAllocation {
  id: string;
  percentage: number;
  locked: boolean;
  dailyTargets: number[];
  workingDates: string[];
  allDates: string[];
  weekTargetKg: number;
  rangeLabel: string;
}

export interface AppState {
  product: ProductType;
  planningMonth: string;
  monthlyTargetKg: number;
  weeks: WeekAllocation[];
  deliveries: Delivery[];
  dailyActuals: Record<string, DailyActualEntry>;
  dayEvents: DayEvent[];
  dispatches: DispatchRecord[];
  recipeInputRatio: number;
  recipeByProductRatio: number;
  validationMode: ValidationMode;
}

export interface MonthKey {
  year: number;
  monthIndex: number;
}

export interface MonthDay {
  date: Date;
  iso: string;
  weekdayShort: string;
  labelShort: string;
}

export interface StockSummary {
  bcStock: number;
  fcStock: number;
  ccnoStock: number;
  excStock: number;
  ccnoQuarantine: number;
  excQuarantine: number;
}

export interface ReviewWeekRow {
  label: string;
  plan: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

export interface ReviewSummary {
  weekRows: ReviewWeekRow[];
  actualMonth: number;
  actualInput: number;
  bcUsed: number;
  fcUsed: number;
  excProduced: number;
  remainingTarget: number;
  remainingInputNeed: number;
  stockStatus: string;
  monthAttainment: number;
  ccnoPassRate: number;
  excPassRate: number;
  deliveryPassRate: number;
  ccnoDispatched: number;
  excDispatched: number;
}

export interface MovementEntry {
  date: string;
  type: 'Delivery' | 'Production';
  item: string;
  direction: 'IN' | 'OUT' | 'QUAR' | 'BLOCKED';
  qty: number;
}

export interface DayDetail {
  date: string;
  dateLabel: string;
  targetOil: number;
  actualOil: number;
  bcUsed: number;
  fcUsed: number;
  excProduced: number;
  deliveries: Delivery[];
  eventSummary: string;
  ccnoStatus: string;
  excStatus: string;
}

export interface ArrivalDraft {
  materialType: MaterialType;
  date: string;
  quantityKg: string | number;
  supplierName: string;
  vehicleNumber: string;
  waybillTicket: string;
  driverName: string;
  qcPassed: 'true' | 'false';
  qcChecklist: Record<string, string | number>;
}

export interface ProductionDraft {
  date: string;
  oilKg: string | number;
  bcUsedKg: string | number;
  fcUsedKg: string | number;
  ccnoQCPassed: 'true' | 'false';
  excQCPassed: 'true' | 'false';
  ccnoQC: Record<string, string | number>;
  excQC: Record<string, string | number>;
}

export interface EventDraft {
  date: string;
  type: DayEventType;
  label: string;
}

export interface RuntimeState {
  sidebarCollapsed: boolean;
  managerOpen: boolean;
  activeManagerTab: ManagerTab;
  selectedDate: string | null;
  arrivalDraft: ArrivalDraft | null;
  productionDraft: ProductionDraft | null;
  eventDraft: EventDraft | null;
  app: AppState;
}
