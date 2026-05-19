# PPIC System Flow — Single Path, End to End

**Product:** CCNO-T (Coconut Oil) and EXC (by-product, Expeller Cake)
**Raw Materials:** White Copra (BC), Fresh Coconut (FC)
**Line:** CCO (Copra Crushing Oil)

---

## The Single Flow

```
ARRIVAL → INVENTORY → PLANNING → PRODUCTION → REPORTING
  (QC)      (stock)   (M→W→D)   (consume +    (plan vs
                                   produce)      actual)
```

Every step feeds the next. Nothing branches. One path.

---

## 1. ARRIVAL — Receive & QC Materials

**Who:** Operator (or warehouse)
**Trigger:** Truck arrives with raw materials

**Flow:**
1. Operator clicks **[🚚 Truck Arrived]**
2. Modal opens — enter delivery info + QC checklist based on material type:

### Fresh Coconut Delivery
| Delivery Info | QC Checklist |
|---------------|-------------|
| Material type | 1. Moisture level |
| Supplier name | 2. Coconut maturity mix (young/mengkal/old) |
| Vehicle number | 3. Impurities (dirt, fungus) |
| Waybill ticket | 4. Defect coconut qty |
| Driver name | 5. Reject coconut qty |
| Quantity (kg) | 6. Truck cleanliness |
| Date | 7. Cover (in truck) |
| | 8. Handling method (no throwing) |
| | 9. Storage method (dry, under roof) |
| | 10. Cover (in storage) |
| | 11. Unloading photo |
| | QC result: PASS / FAIL |

### White Copra Delivery/Production
| Delivery Info | QC Checklist |
|---------------|-------------|
| Batch ID | 1. Tonnage (oven input) |
| Material type | 2. Tonnage (oven output) |
| Quantity (kg) | 3. Moisture (input %) |
| Date | 4. Moisture (output %) |
| | 5. FFA (Free Fatty Acid) |
| | 6. Colour (white/yellow/brown) |
| | 7. Reduction percentage |
| | 8. Temperature (°C) |
| | 9. Fungus check |
| | 10. Char/smoke residue |
| | 11. Oil content (%) |
| | 12. Meat thickness |
| | 13. Insect damage |
| | 14. Storage after hotroom |
| | 15. Batch photo |
| | 16. Rejected qty + reason |
| | QC result: PASS / FAIL |

3. On save:
   - **QC PASS** → quantity added to INVENTORY stock for that material type
   - **QC FAIL** → recorded in history only, NOT added to stock
   - Calendar gets a delivery dot on that day (green = passed, red = failed)

**Data stored:**
- Delivery log: materialType, quantity, supplier, vehicle, waybill, driver, qcResult, full qcChecklist, photo, date
- Inventory: materialType stock increases (pass only)

**Key rule:** QC is a gate. Only passed materials enter inventory.

---

## 2. INVENTORY — Stock Overview

**Who:** Both operator and manager
**Where:** Always visible — stock badges in header, plus dedicated Inventory tab in manager panel

**What it shows:**

### Header badges (always visible):
```
BC: 45.0t | FC: 12.3t | CCNO-T: 8.5t | EXC: 3.2t
```

### Inventory tab (manager panel):
Two sections:

#### Raw Materials (Input)
| Material | In Stock | Incoming (scheduled) | Reserved for Plan | Available |
|----------|----------|----------------------|--------------------|-----------|
| White Copra | 45,000 kg | 10,000 kg | 20,640 kg | 24,360 kg |
| Fresh Coconut | 12,300 kg | 0 kg | 5,000 kg | 7,300 kg |

#### Finished Products (Output)
| Product | In Stock | Produced This Month | Dispatched This Month |
|---------|----------|--------------------|------------------------|
| CCNO-T | 8,500 kg | 12,000 kg | 3,500 kg |
| EXC | 3,200 kg | 4,560 kg | 1,360 kg |

**Stock movement log:**
- Every stock change is recorded: date, type (receive/produce/dispatch), material/product, quantity, running balance
- Filterable by material/product type

**Key rule:** Inventory is the single source of truth for stock. Arrival adds to raw materials. Production consumes raw materials and adds finished products.

---

## 3. PLANNING — Monthly → Weekly → Daily

**Who:** Manager
**Where:** Manager panel → Plan tab

### Step 3a: Monthly Target

1. Manager sets monthly oil output target (e.g., 12,000 kg CCNO-T)
2. System auto-calculates:
   - Working days (calendar days minus weekends, holidays, maintenance)
   - Daily rate = target ÷ working days
   - Input required = target × 1.72 (BC-equivalent total)
   - Stock check: do we have enough raw materials?
     ```
     BC available: 45,000 kg → can produce 26,163 kg oil
     FC available: 12,300 kg → can produce 7,151 kg oil
     Total max output: 33,314 kg oil ✓ (target 12,000 kg)
     ```

### Step 3b: Weekly Allocation

1. System splits month into weeks
2. Manager allocates percentages across weeks (sliders, total must = 100%)
3. Per week the system shows:
   - Weekly oil target
   - Weekly input need
   - Stock sufficiency indicator (green/yellow/red)
4. Manager can lock weeks (e.g., week 1 done → locked)

### Step 3c: Daily Targets

1. Weekly target distributed across working days in that week
2. Grid view:
   ```
   Week 1 | Mon 5  | Tue 6  | Wed 7  | Thu 8  | Fri 9  |
          | 600 kg | 600 kg | 600 kg | 600 kg | 600 kg |
          | 1,032  | 1,032  | 1,032  | 1,032  | 1,032  |
   ```
   Top row: oil target. Bottom row: input requirement (oil × 1.72).
3. Holidays and maintenance days = 0 target, grayed out
4. Calendar reflects these daily targets immediately

### Plan Presets:
- Equal distribution
- Front-loaded (more early, less late)
- Back-loaded (less early, more late)
- Manual (drag sliders)

---

## 4. PRODUCTION — Execute the Plan

**Who:** Operator
**Where:** **[⚙ Production Done]** button
**Trigger:** Production shift ends, operator records output

### Flow:

1. Operator clicks **[⚙ Production Done]**
2. Modal opens with two sections:

**Section A — Production Output:**
```
Date: [Today]
Target today: 600 kg oil

Oil produced: [____] kg

--- Raw Material Used ---
White Copra used: [____] kg  (available: 45,000 kg)
Fresh Coconut used: [____] kg (available: 12,300 kg)

--- Auto-calculated ---
Expected input: [oil × 1.72] kg
Input match: ✓ / ⚠ (tolerance ±1 kg)
EXC produced: [oil × 0.38] kg
```

**Section B — Finished Product QC (CCNO-T, 6 items):**
| Check | Type |
|-------|------|
| Colour | Visual (clear/light yellow/golden/amber/brown) |
| Smell | PASS/FAIL (no rancid odour) |
| M&I (Moisture & Impurities) | % |
| FFA (Free Fatty Acid) | % |
| PV (Peroxide Value) | meq/kg |
| Aflatoxin | ppb or PASS/FAIL |

**EXC QC (3 items):**
| Check | Type |
|-------|------|
| Moisture | % |
| Oil Content (Residual) | % |
| Appearance | PASS/FAIL (consistent, no mold) |

3. Validation on save:
   - BC used + FC used ≈ oil × 1.72 (±1 kg tolerance)
   - If mismatch → warning but allow override (configurable: warn/block)
   - Cannot exceed available stock
   - Holiday/maintenance days → blocked
   - Finished product QC must be completed

4. On save:
   - **Consume from inventory:** deduct BC used and FC used from raw material stock
   - **Produce to inventory:** add CCNO-T and EXC to finished product stock (QC PASS only)
   - QC FAIL → product recorded but goes to quarantine (not sellable stock)
   - Store daily actual entry with full QC results
   - Calendar updates: day cell colored by target attainment
     - Green: ≥95%, Yellow: 80-94%, Red: <80%
   - Missing actuals on past working days → subtle amber dot

### Production History:
- Each day: date, oilKg, bcUsed, fcUsed, excKg, targetAttainment%
- Full QC results: CCNO-T (6 items) + EXC (3 items)
- Editable from calendar popover (past days)

---

## 5. REPORTING — Plan vs Actual

**Who:** Manager
**Where:** Manager panel → Review tab

### What it shows:

#### Output Summary
```
         | Plan    | Actual  | Variance
Week 1   | 3,600   | 3,420   | -5.0%
Week 2   | 3,000   | 2,850   | -5.0%
Week 3   | 2,400   | —       | —
Week 4   | 3,000   | —       | —
MTD      | 6,600   | 6,270   | -5.0%
```

#### Input Consumption
```
         | Planned Input | Actual Input | BC Used | FC Used
Week 1   | 6,192 kg      | 5,882 kg     | 4,200   | 1,682
Week 2   | 5,160 kg      | 4,902 kg     | 3,500   | 1,402
```

#### Stock Forward Look
```
Material    | Current | Week 3 Need | Week 4 Need | Status
White Copra | 35,500  | 4,128 kg    | 5,160 kg    | ✓ Sufficient
Fresh Coco  | 5,600   | 2,000 kg    | 2,500 kg    | ⚠ Tight
```

#### By-Product Summary
```
EXC produced MTD: 2,383 kg
EXC in stock: 3,200 kg
EXC QC pass rate: 100%
```

#### QC Summary
```
CCNO-T QC pass rate: 95% (19/20 batches)
  - Most common fail: FFA (1 batch)
EXC QC pass rate: 100%
```

### Re-Allocation:
- If behind plan → lock completed weeks, redistribute remaining target to future weeks
- System validates new plan against remaining stock
- Calendar updates with new daily targets

---

## The Calendar — Central Hub

The calendar is the single operational view. Everything ties to a date.

**Day cell shows:**
- Target oil (kg) — small number top-left
- Actual oil (kg) — bold center (if recorded)
- Color tint by attainment: green/yellow/red
- Delivery dot (green/red)
- Holiday 🏖 or maintenance 🔧 marker
- Missing actual amber dot (past working days only)
- Today → blue border

**Day popover (click a day):**
- Target oil + input requirement
- Actual oil + BC used + FC used + EXC produced
- Finished product QC: CCNO-T (colour, smell, M&I, FFA, PV, aflatoxin) + EXC (moisture, oil, appearance)
- Deliveries received that day (material, qty, supplier, QC result)
- Events (holiday/maintenance)
- Quick actions: Mark Holiday, Mark Maintenance, Edit Production

---

## Key Business Rules (Hardcoded)

| Rule | Value |
|------|-------|
| Input ratio (raw material → oil) | 1.72 kg input per 1 kg oil |
| By-product ratio (oil → EXC) | 0.38 kg EXC per 1 kg oil |
| Input validation tolerance | ±1 kg |
| QC: only PASS enters inventory | enforced |

---

## Modes

### Operator Mode (default)
- Calendar (full view)
- Two buttons: [🚚 Truck Arrived] [⚙ Production Done]
- Stock badges in header
- Gear icon ⚙ to access manager mode

### Manager Mode (⚙ panel)
- **Plan tab:** Set monthly target → allocate weeks → view daily grid
- **Review tab:** Plan vs actual, stock outlook, re-allocation
- **Inventory tab:** Full stock view, movement log
- Overlays on calendar (doesn't hide it)

---

## Data Model

```ts
// --- QC Checklists (from Mammoth Inventory Control standard) ---

interface FreshCoconutQC {
  moistureLevel: "pass" | "fail";
  coconutMaturity: "young" | "mengkal" | "old" | "mixed"; // predominant type
  impurities: "pass" | "fail";              // dirt, fungus
  defectCoconutQty: number;                 // kg or %
  rejectCoconutQty: number;                 // kg or %
  truckCleanliness: "pass" | "fail";        // not wet, clear from dirt
  coverInTruck: "pass" | "fail";           // covered during transport
  handlingMethod: "pass" | "fail";          // no throwing
  storageMethod: "pass" | "fail";           // dry, under roof
  coverInStorage: "pass" | "fail";          // covered after unloading
  unloadingPhoto?: string;                   // base64 or file ref
}

interface WhiteCopraQC {
  batchId: string;
  tonnageOvenInput: number;                 // kg
  tonnageOvenOutput: number;                // kg
  moistureInput: number;                    // %
  moistureOutput: number;                   // %
  ffa: number;                              // % Free Fatty Acid
  colour: "white" | "yellow" | "brown";
  reductionPercentage: number;              // %
  temperature: number;                      // °C
  fungus: "pass" | "fail";
  charSmokeResidue: "pass" | "fail";
  oilContent: number;                       // %
  meatThickness: string;                    // value or rating
  insectDamage: "pass" | "fail";
  storageAfterHotroom: "pass" | "fail";     // dry, under roof, off ground
  batchPhoto?: string;
  rejectedQtyKg: number;
  rejectReason: string;
}

// --- Finished Product QC ---

interface CCNO_T_QC {
  colour: string;                           // clear, light yellow, golden, amber, brown
  smell: "pass" | "fail";                   // no rancid odour
  moistureImpurities: number;               // % M&I
  ffa: number;                              // % Free Fatty Acid
  peroxideValue: number;                    // meq/kg PV
  aflatoxin: number | "pass" | "fail";      // ppb or pass/fail
}

interface EXC_QC {
  moisture: number;                         // %
  residualOilContent: number;               // %
  appearance: "pass" | "fail";              // consistent texture, no mold
}

// --- Main State ---

interface AppState {
  // Planning
  monthlyTargetKg: number;
  weeks: {
    percentage: number;
    locked: boolean;
    dailyTargets: number[];
  }[];

  // Execution
  dailyActuals: Record<string, {
    oilKg: number;
    bcUsedKg: number;
    fcUsedKg: number;
    excKg: number;                          // derived: oil × 0.38
    ccnoQC: CCNO_T_QC;
    excQC: EXC_QC;
    ccnoQCPassed: boolean;
    excQCPassed: boolean;
  }>;

  // Arrival
  deliveries: {
    materialType: "White Copra" | "Fresh Coconut";
    quantityKg: number;
    supplierName: string;
    vehicleNumber: string;
    waybillTicket: string;
    driverName: string;
    qcPassed: boolean;
    qcChecklist: FreshCoconutQC | WhiteCopraQC; // depends on materialType
    date: string;
  }[];

  // Calendar
  dayEvents: {
    date: string;
    type: "holiday" | "maintenance";
    label: string;
  }[];

  // Dispatch
  dispatches: {
    productType: "CCNO-T" | "EXC";
    quantityKg: number;
    date: string;
  }[];

  // Settings
  validationMode: "warn" | "block";
}
```

## Derived State (computed, not stored)

- **BC stock:** sum(passed BC deliveries: quantityKg − rejectedQtyKg) − sum(BC used in production)
- **FC stock:** sum(passed FC deliveries: quantityKg − rejectCoconutQty) − sum(FC used in production)
- **CCNO-T stock:** sum(oil produced where ccnoQCPassed) − sum(CCNO-T dispatched)
- **EXC stock:** sum(EXC produced where excQCPassed) − sum(EXC dispatched)
- **CCNO-T quarantine:** sum(oil produced where !ccnoQCPassed) — not in sellable stock
- **Working days:** calendar days − weekends − holidays − maintenance
- **Daily rate:** monthlyTarget ÷ workingDays
- **Planned input:** monthlyTarget × 1.72
- **Max production capacity:** min(BC stock / 1.72, FC stock / 1.72)

---

## Phase 1 Scope

- CCO line only
- 1 product: CCNO-T
- 1 by-product: EXC
- 2 raw materials: White Copra, Fresh Coconut
- Single-user, localStorage persistence
- Calendar-first SPA

## Future (Out of Scope for Phase 1)

- Multi-line support
- Multi-user with roles
- Server-side persistence
- Supplier management
- Cost tracking
- Advanced QC trend analysis (QC is captured, but statistical trend analysis is future)
