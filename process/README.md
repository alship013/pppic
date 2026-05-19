# PPIC System — Phase 1

Status: Phase 1, calendar-first operations dashboard.
Scope: CCO line, 1 product (CCNO-T), 1 by-product (EXC), 2 raw materials, 1 month.

**See `system-flow.md` for the complete end-to-end architecture.**

## The Single Flow

```
ARRIVAL (QC) → INVENTORY → PLANNING (M→W→D) → PRODUCTION → REPORTING
```

Every step feeds the next. One path. No branches.

## Design Principle

Operator mode stays simple (2 buttons).
Manager mode stays behind the gear panel (Plan + Review + Inventory).
Calendar is always visible.

## Core Flow

Daily (operator):
1. Truck arrives → click **[🚚 Truck Arrived]** → select material type, quantity, supplier, vehicle, waybill, driver, QC checklist (14/16 items) → PASS adds to inventory, FAIL is recorded only.
2. Production ends → click **[⚙ Production Done]** → input oil output + BC used + FC used + finished product QC (CCNO-T 6 items, EXC 3 items) → system validates (input = oil × 1.72), deducts raw materials from inventory, adds QC-passed CCNO-T and EXC to finished product inventory (QC-failed → quarantine).
3. Calendar updates day status and stock impact.

Monthly (manager):
1. Set monthly oil target → allocate across weeks → daily grid auto-populated.
2. Review plan vs actual, stock sufficiency by material type, EXC output.
3. Re-allocate remaining weeks when behind plan.

## Required Data Model Behavior (Raw Materials)

The system must explicitly separate:
1. Planned input need (derived from target): `plannedOil * 1.72`
2. Received stock by material type:
- White Copra
- Fresh Coconut
3. Consumed input by material type (logged during production):
- White Copra used
- Fresh Coconut used

Validation:
- `inputUsedTotal = oilProduced * 1.72` (allow small rounding tolerance, for example +/- 1 kg)
- `inputUsedByType` cannot exceed available stock of that type unless negative stock is allowed with warning

By-product:
- EXC is derived from oil output only: `oilProduced * 0.38`

## Calendar Expectations

Each day should be able to show (in cell or popover detail):
- Planned oil target (kg)
- Actual oil produced (kg)
- Input consumed by type (BC, FC)
- EXC produced (kg)
- Finished product QC results (CCNO-T + EXC, pass/fail)
- Delivery indicator and QC outcome

## Stock Visibility

Header badges remain (always visible):
- `BC: Xt` (White Copra)
- `FC: Xt` (Fresh Coconut)
- `CCNO-T: Xt` (finished oil)
- `EXC: Xt` (by-product)

Inventory tab in manager panel shows full breakdown:
- Raw materials: in stock, incoming, reserved for plan, available
- Finished products: in stock, produced MTD, dispatched MTD
- Stock movement log (every change recorded)

Stock updates:
- On QC-passed delivery: add to raw material bucket
- On production save: deduct raw materials used, add finished products produced
- On dispatch: deduct from finished product bucket (future)

## SOP Mapping (5 Stages)

| SOP | Stage | Role | Action |
|-----|-------|------|--------|
| `sop-01-arrival-qc.md` | 1. ARRIVAL | Operator | Receive raw materials, full QC checklist per material type, PASS/FAIL gate |
| `sop-02-inventory.md` | 2. INVENTORY | Both | Raw material stock (BC, FC), finished product stock (CCNO-T, EXC), movement log |
| `sop-03-planning.md` | 3. PLANNING | Manager | Monthly target → weekly % split → daily grid, stock sufficiency check |
| `sop-04-production.md` | 4. PRODUCTION | Operator | Record oil + BC used + FC used → validate recipe → consume inventory → produce to inventory |
| `sop-05-reporting.md` | 5. REPORTING | Manager | Output plan vs actual, input consumption, stock forward look, re-allocation |
