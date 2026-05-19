# AGENTS.md — PPIC Operations System

## Project Overview

Single-page application for coconut oil production planning and inventory control (PPIC). Calendar-first operations dashboard with two modes: Operator (simple, 2 buttons) and Manager (planning + review + inventory behind gear panel).

**Product:** CCNO-T (coconut oil), EXC (expeller cake by-product)
**Raw Materials:** White Copra (BC), Fresh Coconut (FC)
**Scope:** Phase 1 — single line (CCO), single-user, localStorage persistence

## Essential Commands

TBD — add build, dev server, test, and lint commands once the project is scaffolded.

## Architecture — The Single Flow

```
ARRIVAL (QC gate) → INVENTORY (stock) → PLANNING (M→W→D) → PRODUCTION (consume + produce) → REPORTING (plan vs actual)
```

Every stage feeds the next. No branches. One path. See `process/system-flow.md` for full detail.

### Data Flow (not control flow)

```
Deliveries ──→ Raw Material Stock ──→ Production ──→ Finished Product Stock
                    (BC, FC)          (consumes)       (CCNO-T, EXC)

Planning ──→ Daily Targets ──→ Calendar ──→ Production Modal
                                   ↑                │
                                   └── actuals ─────┘

Reporting ←── Planning + Production + Inventory (derived, never stored separately)
```

### State Model

Everything derives from three source-of-truth arrays. Nothing is stored redundantly.

```ts
interface AppState {
  // Source of truth arrays
  deliveries: Delivery[];      // Arrival → feeds raw material stock
  dailyActuals: Record<string, DailyActual>;  // Production → consumes & produces stock
  dayEvents: DayEvent[];       // Calendar → holidays, maintenance

  // Planning (persisted)
  monthlyTargetKg: number;
  weeks: WeekAllocation[];

  // Settings
  product: string;             // "CCNO-T"
  validationMode: "warn" | "block";
}

// Everything else is DERIVED (computed, never stored):
// - BC stock = sum(passed BC deliveries) − sum(BC used in production)
// - FC stock = sum(passed FC deliveries) − sum(FC used in production)
// - CCNO-T stock = sum(oil produced) − sum(CCNO-T dispatched)
// - EXC stock = sum(EXC produced) − sum(EXC dispatched)
// - Working days = calendar days − weekends − holidays − maintenance
// - Daily targets = monthlyTarget × week% ÷ workingDaysInWeek
```

**Critical rule:** Stock is never stored as a number. It's always computed from deliveries and production. This eliminates sync bugs.

## Hardcoded Business Rules

| Rule | Value | Where Used |
|------|-------|------------|
| Input ratio | 1.72 kg raw material per 1 kg oil | Production validation, planning estimates |
| EXC ratio | 0.38 kg EXC per 1 kg oil | Auto-calculated during production |
| Input tolerance | ±1 kg | Production validation |
| Target attainment colors | Green ≥95%, Yellow 80-94%, Red <80% | Calendar cell tint |
| QC gate | Only PASS enters inventory; FAIL is log-only | Arrival |

## Component Architecture

```
App
├── Header
│   ├── StockBadges (BC, FC, CCNO-T, EXC — always visible, derived)
│   └── GearButton (opens ManagerPanel)
├── Calendar (main view, always visible)
│   ├── MonthGrid
│   │   └── DayCell (target, actual, delivery dot, event marker, color tint)
│   └── DayPopover (full detail: plan vs actual, deliveries, events)
├── OperatorButtons (fixed bottom bar)
│   ├── TruckArrivedButton → ArrivalModal
│   └── ProductionDoneButton → ProductionModal
└── ManagerPanel (slide-over, gear-triggered)
    ├── PlanTab
    │   ├── MonthlyTargetInput
    │   ├── WeeklySliders (auto-balance, lockable)
    │   └── DailyGrid
    ├── ReviewTab
    │   ├── OutputSummary (plan vs actual per week)
    │   ├── InputConsumption (BC/FC split)
    │   ├── StockForwardLook (per material type)
    │   └── ByProductSummary
    │   └── ReallocateButton
    └── InventoryTab
        ├── RawMaterialStock (BC, FC: in stock, reserved, available)
        ├── FinishedProductStock (CCNO-T, EXC: in stock, produced, dispatched)
        └── StockMovementLog (chronological, filterable)
```

## Key Patterns & Gotchas

### 1. Stock is always derived, never stored
Every component that shows stock must compute it from `deliveries` and `dailyActuals`. Never `setState({ bcStock: 45000 })`. Use a `useMemo` or equivalent. This is the #1 source of bugs if violated.

### 2. Production save does 4 inventory movements atomically
When production is saved, it must update BOTH raw material consumption AND finished product production in a single state update:
```
BC stock ↓  |  FC stock ↓  |  CCNO-T stock ↑  |  EXC stock ↑
```
All 4 happen in one `setState` call. Never split across multiple state updates — it creates a window where stock is inconsistent.

### 3. QC checklist is mandatory before save
The Arrival modal requires all 3 QC items (moisture, contamination, weight) checked before allowing PASS. FAIL deliveries are stored in the log but NEVER affect stock computation — filter `qcPassed === true` when summing.

### 4. Calendar day colors derive from target attainment
Day cell color is computed: `(actualOil / dailyTarget) * 100`. If no target (holiday/maintenance/weekend), no color. If no actual on a past working day, show amber dot — not a color tint.

### 5. Planning recalculation cascades
Changing monthly target → recalculates weekly split → recalculates daily grid → updates calendar. Changing a holiday/maintenance event → recalculates working days → recalculates daily rate → updates calendar. All derivations must be reactive.

### 6. Weekly sliders auto-balance to 100%
If user drags one week up, unlocked weeks proportionally decrease. Locked weeks stay fixed. Total must always equal 100%. Presets (Equal, Front-loaded, Back-loaded) override all unlocked weeks.

### 7. Re-allocation locks completed weeks
When re-allocating, weeks with actuals recorded are locked. Remaining target = monthly target − sum(all actuals). Only future weeks are editable.

### 8. No backend — localStorage is the persistence layer
On every state change, persist to localStorage. On app load, hydrate from localStorage. No API calls. This means the app is a pure client-side SPA.

### 9. Operator vs Manager separation
Operator sees: Calendar + 2 buttons + stock badges. Manager sees: same + gear panel. The gear icon toggles the manager panel but never hides the calendar. Calendar is ALWAYS visible — this is the "calendar-first" design principle.

### 10. Date handling
All dates stored as ISO strings (`"2026-05-15"`). No time component. Calendar uses local date math. Working days exclude Saturday/Sunday by default.

## Process Documentation

All process specs are in `process/`. Read these before building:
- `system-flow.md` — Complete architecture and data model
- `sop-01-arrival-qc.md` through `sop-05-reporting.md` — Detailed SOPs for each stage
- `trial-checklist.md` — Acceptance criteria with step-by-step test cases
- `planning-process.md` — Core loop with material allocation rules
- `frontend-spec.md` — UI spec, state shape, derived values
- `README.md` — Scope, design principles, SOP mapping
