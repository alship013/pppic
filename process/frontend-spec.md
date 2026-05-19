# PPIC Frontend Spec — Phase 1

Single page app. Calendar first. localStorage persistence.

**Flow:** Arrival(QC) → Inventory → Planning → Production → Reporting

---

## Modes

### Operator Mode (default)
- Calendar (full view, always visible)
- Two buttons: **[🚚 Truck Arrived]** **[⚙ Production Done]**
- 4 stock badges in header: `BC | FC | CCNO-T | EXC`
- Gear icon ⚙ to access manager mode

### Manager Mode (⚙ panel, slides over from right)
- **Plan tab:** Monthly target → weekly allocation → daily grid
- **Review tab:** Plan vs actual, stock outlook, QC pass rates, re-allocation
- **Inventory tab:** Raw material stock, finished product stock, quarantine, movement log
- Calendar still visible behind the panel

---

## Component Tree

```
App
├── Header
│   ├── StockBadges (BC, FC, CCNO-T, EXC — derived, always visible)
│   └── GearButton (toggles ManagerPanel)
├── Calendar (main view, never hidden)
│   ├── MonthGrid
│   │   └── DayCell
│   │       ├── Target oil (small, top-left)
│   │       ├── Actual oil (bold center, if recorded)
│   │       ├── Color tint (≥95% green, 80-94% yellow, <80% red)
│   │       ├── Delivery dot (green = passed, red = failed)
│   │       ├── Event marker (🏖 holiday, 🔧 maintenance)
│   │       ├── Missing actual amber dot (past working days)
│   │       └── Today: blue border
│   └── DayPopover (click any day)
│       ├── Plan: target oil, input requirement
│       ├── Actual: oil, BC used, FC used, EXC produced
│       ├── QC: CCNO-T results (6 items), EXC results (3 items), pass/fail
│       ├── Deliveries: material, qty, supplier, QC result, failed items
│       ├── Events: holiday/maintenance label
│       └── Actions: Edit Production, Mark Holiday, Mark Maintenance
├── OperatorButtons (fixed bottom bar)
│   ├── TruckArrivedButton → ArrivalModal
│   └── ProductionDoneButton → ProductionModal
└── ManagerPanel (slide-over from right, gear-triggered)
    ├── PlanTab
    │   ├── MonthlyTargetInput (with derived: working days, daily rate, input needed, stock check)
    │   ├── WeeklySliders (auto-balance to 100%, lockable, presets: Equal/Front-loaded/Back-loaded)
    │   └── DailyGrid (oil target row + input requirement row per working day, week sums)
    ├── ReviewTab
    │   ├── OutputSummary (plan vs actual per week, MTD, variance %, color indicators)
    │   ├── InputConsumption (planned vs actual input, BC/FC split, efficiency)
    │   ├── StockForwardLook (per material type: current, remaining need, surplus/deficit, status)
    │   ├── ByProductSummary (EXC produced, in stock, expected remaining, ratio check)
    │   ├── QCSummary (CCNO-T pass rate, EXC pass rate, most common failures)
    │   └── ReallocateButton (lock completed weeks, redistribute remaining)
    └── InventoryTab
        ├── RawMaterialStock (BC, FC: in stock, reserved, available)
        ├── FinishedProductStock (CCNO-T, EXC: in stock, produced MTD, dispatched MTD)
        ├── QuarantineStock (QC-failed CCNO-T and EXC)
        └── StockMovementLog (chronological, filterable by material/type/date/direction)
```

---

## Modal Specifications

### Arrival Modal — [🚚 Truck Arrived]

**Delivery Info Fields (all required):**

| Field | Type | Default |
|-------|------|---------|
| Material type | Dropdown: White Copra / Fresh Coconut | — |
| Date | Date picker | Today |
| Quantity (kg) | Number | — |
| Supplier name | Text | — |
| Vehicle number | Text | — |
| Waybill ticket | Text | — |
| Driver name | Text | — |

**QC Checklist — Fresh Coconut (shown when material type = Fresh Coconut):**

| # | Check | Input Type | Values |
|---|-------|------------|--------|
| 1 | Moisture Level | Toggle | PASS / FAIL |
| 2 | Coconut Maturity Mix | Dropdown | Young / Mengkal / Old / Mixed |
| 3 | Impurities (dirt, fungus) | Toggle | PASS / FAIL |
| 4 | Defect Coconut Quantity | Number | kg or % (observation only, stays in stock) |
| 5 | Reject Coconut Quantity | Number | kg or % (deducted from stock) |
| 6 | Truck Cleanliness | Toggle | PASS / FAIL (not wet, clear from dirt) |
| 7 | Cover (in truck) | Toggle | PASS / FAIL |
| 8 | Handling Method | Toggle | PASS / FAIL (no throwing) |
| 9 | Storage Method | Toggle | PASS / FAIL (dry, under roof) |
| 10 | Cover (in storage) | Toggle | PASS / FAIL |
| 11 | Unloading Photo | File upload | Image |

**QC Checklist — White Copra (shown when material type = White Copra):**

| # | Check | Input Type | Values |
|---|-------|------------|--------|
| 1 | Batch ID | Text | — |
| 2 | Tonnage (Oven Input) | Number | kg |
| 3 | Tonnage (Oven Output) | Number | kg |
| 4 | Moisture (Oven Input) | Number | % |
| 5 | Moisture (Oven Output) | Number | % |
| 6 | FFA (Free Fatty Acid) | Number | % |
| 7 | Colour | Dropdown | White / Yellow / Brown |
| 8 | Reduction Percentage | Number | % |
| 9 | Temperature | Number | °C |
| 10 | Fungus | Toggle | PASS / FAIL |
| 11 | Char / Smoke Residue | Toggle | PASS / FAIL |
| 12 | Oil Content | Number | % |
| 13 | Meat Thickness | Text/Number | Value or rating |
| 14 | Insect Damage | Toggle | PASS / FAIL |
| 15 | Storage Type After Hotroom | Toggle | PASS / FAIL (dry, under roof, off ground) |
| 16 | Batch Photo | File upload | Image |
| 17 | Rejected Quantity | Number | kg |
| 18 | Reject Reason | Text | — |

**QC Result:** PASS / FAIL toggle at bottom.

**On Save:**
- PASS → `quantityKg − rejectQty` added to matching raw material stock
- FAIL → delivery logged, zero stock added
- Calendar: green dot (PASS) or red dot (FAIL) on delivery date
- Stock badges update immediately

---

### Production Modal — [⚙ Production Done]

Two sections, tabbed or stacked.

**Section A — Production Output:**

| Field | Type | Default |
|-------|------|---------|
| Date | Date picker | Today |
| Oil produced (kg) | Number | — |
| White Copra used (kg) | Number | — |
| Fresh Coconut used (kg) | Number | — |

**Auto-calculated (real-time as operator types):**

| Value | Formula |
|-------|---------|
| Expected input total | `oilProduced × 1.72` |
| Actual input total | `BC used + FC used` |
| Input match indicator | ✓ (match) / ⚠ (mismatch, ±1 kg tolerance) |
| EXC produced | `oilProduced × 0.38` |
| Target today | From plan, displayed for context |
| Target attainment | `oilProduced ÷ dailyTarget × 100%` |
| Stock preview | "After save: BC X → Y, FC X → Y, CCNO-T X → Y, EXC X → Y" |

**Validation:**
- `BC + FC ≈ oil × 1.72` (±1 kg) → warn or block based on `validationMode` setting
- BC/FC used cannot exceed current stock → warning
- Holiday/maintenance day → block save entirely

**Section B — Finished Product QC:**

**CCNO-T (6 items):**

| # | Check | Input Type | Values |
|---|-------|------------|--------|
| 1 | Colour | Dropdown | Clear / Light Yellow / Golden / Amber / Brown |
| 2 | Smell | Toggle | PASS / FAIL |
| 3 | M&I (Moisture & Impurities) | Number | % |
| 4 | FFA (Free Fatty Acid) | Number | % |
| 5 | PV (Peroxide Value) | Number | meq/kg |
| 6 | Aflatoxin | Number or Toggle | ppb or PASS/FAIL |

**EXC (3 items):**

| # | Check | Input Type | Values |
|---|-------|------------|--------|
| 1 | Moisture | Number | % |
| 2 | Residual Oil Content | Number | % |
| 3 | Appearance | Toggle | PASS / FAIL |

**QC Result per product:** PASS / FAIL.

**On Save (atomic — all happen in one state update):**
- BC stock = BC stock − BC used
- FC stock = FC stock − FC used
- CCNO-T stock = CCNO-T stock + oilProduced (if CCNO-T QC PASS)
- EXC stock = EXC stock + (oilProduced × 0.38) (if EXC QC PASS)
- QC FAIL → product goes to quarantine bucket (not sellable stock)
- Day cell colored by attainment
- Calendar updates immediately

**Past-day editing:** Click calendar day → popover → "Edit Production" → same modal, pre-filled.

---

## Data Model (Complete)

```ts
// --- QC Checklists (Mammoth Inventory Control standard) ---

interface FreshCoconutQC {
  moistureLevel: "pass" | "fail";
  coconutMaturity: "young" | "mengkal" | "old" | "mixed";
  impurities: "pass" | "fail";
  defectCoconutQty: number;       // kg or % — observation only, stays in stock
  rejectCoconutQty: number;       // kg or % — deducted from inventory
  truckCleanliness: "pass" | "fail";
  coverInTruck: "pass" | "fail";
  handlingMethod: "pass" | "fail";
  storageMethod: "pass" | "fail";
  coverInStorage: "pass" | "fail";
  unloadingPhoto?: string;        // base64 or file ref
}

interface WhiteCopraQC {
  batchId: string;
  tonnageOvenInput: number;
  tonnageOvenOutput: number;
  moistureInput: number;
  moistureOutput: number;
  ffa: number;
  colour: "white" | "yellow" | "brown";
  reductionPercentage: number;
  temperature: number;
  fungus: "pass" | "fail";
  charSmokeResidue: "pass" | "fail";
  oilContent: number;
  meatThickness: string;
  insectDamage: "pass" | "fail";
  storageAfterHotroom: "pass" | "fail";
  batchPhoto?: string;
  rejectedQtyKg: number;          // deducted from inventory
  rejectReason: string;
}

// --- Finished Product QC ---

interface CCNO_T_QC {
  colour: string;
  smell: "pass" | "fail";
  moistureImpurities: number;     // % M&I
  ffa: number;                    // % FFA
  peroxideValue: number;          // meq/kg PV
  aflatoxin: number | "pass" | "fail";
}

interface EXC_QC {
  moisture: number;               // %
  residualOilContent: number;     // %
  appearance: "pass" | "fail";
}

// --- Main Entries ---

interface DeliveryEntry {
  materialType: "White Copra" | "Fresh Coconut";
  quantityKg: number;
  supplierName: string;
  vehicleNumber: string;
  waybillTicket: string;
  driverName: string;
  qcPassed: boolean;
  qcChecklist: FreshCoconutQC | WhiteCopraQC;
  date: string;                   // ISO "YYYY-MM-DD"
}

interface DailyActualEntry {
  oilKg: number;
  bcUsedKg: number;
  fcUsedKg: number;
  excKg: number;                  // derived: oil × 0.38, stored for convenience
  ccnoQC: CCNO_T_QC;
  excQC: EXC_QC;
  ccnoQCPassed: boolean;
  excQCPassed: boolean;
}

interface DayEvent {
  date: string;
  type: "holiday" | "maintenance";
  label: string;
}

interface WeekAllocation {
  percentage: number;             // of monthly target
  locked: boolean;
  dailyTargets: number[];         // kg oil per working day in this week
}

interface DispatchEntry {
  productType: "CCNO-T" | "EXC";
  quantityKg: number;
  date: string;
}

// --- Root State ---

interface AppState {
  // Planning
  product: string;                // "CCNO-T"
  monthlyTargetKg: number;
  weeks: WeekAllocation[];

  // Execution
  dailyActuals: Record<string, DailyActualEntry>;  // keyed by ISO date

  // Arrival
  deliveries: DeliveryEntry[];

  // Calendar
  dayEvents: DayEvent[];

  // Dispatch (Phase 1 optional)
  dispatches: DispatchEntry[];

  // Recipe (hardcoded, stored for configurability)
  recipeInputRatio: number;       // 1.72
  recipeByProductRatio: number;   // 0.38

  // Settings
  validationMode: "warn" | "block";
}
```

---

## Derived Values (computed, never stored)

```ts
// Raw material stock
const bcStock = deliveries
  .filter(d => d.materialType === "White Copra" && d.qcPassed)
  .reduce((sum, d) => sum + d.quantityKg - ((d.qcChecklist as WhiteCopraQC).rejectedQtyKg || 0), 0)
  - sum(Object.values(dailyActuals).map(a => a.bcUsedKg));

const fcStock = deliveries
  .filter(d => d.materialType === "Fresh Coconut" && d.qcPassed)
  .reduce((sum, d) => sum + d.quantityKg - ((d.qcChecklist as FreshCoconutQC).rejectCoconutQty || 0), 0)
  - sum(Object.values(dailyActuals).map(a => a.fcUsedKg));

// Finished product stock
const ccnoStock = sum(Object.values(dailyActuals).filter(a => a.ccnoQCPassed).map(a => a.oilKg))
  - sum(dispatches.filter(d => d.productType === "CCNO-T").map(d => d.quantityKg));

const excStock = sum(Object.values(dailyActuals).filter(a => a.excQCPassed).map(a => a.excKg))
  - sum(dispatches.filter(d => d.productType === "EXC").map(d => d.quantityKg));

// Quarantine (QC-failed, not in sellable stock)
const ccnoQuarantine = sum(Object.values(dailyActuals).filter(a => !a.ccnoQCPassed).map(a => a.oilKg));
const excQuarantine = sum(Object.values(dailyActuals).filter(a => !a.excQCPassed).map(a => a.excKg));

// Planning derivations
const workingDays = daysInMonth − weekends − holidays − maintenanceDays;
const dailyRate = monthlyTargetKg / workingDays;
const plannedInputNeed = monthlyTargetKg * recipeInputRatio;

// Max capacity
const maxOilFromBC = bcStock / recipeInputRatio;
const maxOilFromFC = fcStock / recipeInputRatio;
```

---

## Calendar Cell Spec

Each day cell renders:

| Element | Position | Condition |
|---------|----------|-----------|
| Target oil (kg) | Small, top-left | Working day with plan set |
| Actual oil (kg) | Bold, center | Production recorded |
| Green tint | Background | Attainment ≥ 95% |
| Yellow tint | Background | Attainment 80–94% |
| Red tint | Background | Attainment < 80% |
| Green dot ● | Corner | At least one PASS delivery |
| Red dot ● | Corner | At least one FAIL delivery (and no PASS) |
| Amber dot · | Corner | Past working day, no actuals entered |
| 🏖 | Center | Holiday |
| 🔧 | Center | Maintenance |
| Gray background | Cell | Holiday or maintenance |
| Dimmed | Cell | Weekend |
| Blue border | Cell | Today |

---

## Business Rules (Hardcoded)

| Rule | Value |
|------|-------|
| Input ratio | 1.72 kg raw material per 1 kg oil |
| EXC ratio | 0.38 kg EXC per 1 kg oil |
| Input tolerance | ±1 kg |
| Attainment green | ≥ 95% |
| Attainment yellow | 80–94% |
| Attainment red | < 80% |
| QC gate | Only PASS deliveries add to inventory |
| Stock formula (arrival) | `quantityKg − rejectQty` |
| QC quarantine | Failed CCNO-T/EXC excluded from sellable stock |
| Weekly sliders | Auto-balance to 100%, locked weeks fixed |
| Re-allocation | Completed weeks locked, remaining target redistributed |

---

## Persistence

- All state in `localStorage` under a single key
- Hydrate on `App` mount
- Persist on every state change (debounced)
- No backend, no API calls
