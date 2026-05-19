# Planning Process — Core Loop (Phase 1)

Version: 5.0 — aligned with 5-stage flow (Arrival → Inventory → Planning → Production → Reporting)

## Core Loop

1. **Receive deliveries (Arrival)** → QC pass/fail (14 FC items / 16 BC items) → PASS adds to inventory stock by material type (quantity − reject), FAIL recorded only
2. **Inventory** → single source of truth for all stock: raw materials (BC, FC) + finished products (CCNO-T, EXC) + quarantine for QC-failed
3. **Set monthly output target (Planning)** → allocate across weeks → cascade to daily targets → check stock sufficiency per material
4. **Record actual output + input split (Production)** → validate recipe (oil × 1.72), deduct raw materials, add finished products (QC PASS only), quarantine QC-failed
5. **Review output variance + material sufficiency (Reporting)** → stock forward look → re-allocate future weeks

## What Matters

| Step | User does | System does |
|------|-----------|-------------|
| Arrival | logs material type, qty (kg), supplier, vehicle, waybill, driver, full QC checklist | updates BC/FC stock buckets: `quantity − rejectQty` for PASS only; FAIL recorded in history only |
| Inventory | views stock badges (always) or Inventory tab (manager) | computes all stock as derived values from deliveries + production; maintains movement log |
| Plan | sets monthly oil output target and weekly % allocation | derives required input need (`oil × 1.72`), checks stock sufficiency, populates daily grid, syncs calendar |
| Production | logs oil output, BC/FC used, AND finished product QC (CCNO-T 6 items, EXC 3 items) | validates input total (BC + FC ≈ oil × 1.72), computes EXC (`oil × 0.38`), deducts raw materials atomically, adds QC-passed finished products to stock, quarantines QC-failed |
| Review | checks performance and stock outlook | compares plan vs actual, shows BC/FC split trend, stock forward look per material, QC pass rates, re-allocation |

## Recipe Math (Fixed)

- Input ratio: 1.72 kg input per 1 kg oil
- EXC ratio: 0.38 kg EXC per 1 kg oil

## Material Allocation Rule During Production

For each day:
- oilProducedKg entered by operator
- whiteCopraUsedKg entered by operator
- freshCoconutUsedKg entered by operator

System check:
- `whiteCopraUsedKg + freshCoconutUsedKg ≈ oilProducedKg × 1.72` (tolerance: ±1 kg)

## Finished Product QC (Mammoth Inventory Control)

CCNO-T (6 items): colour, smell, M&I %, FFA %, PV meq/kg, aflatoxin
EXC (3 items): moisture %, residual oil %, appearance

QC PASS → product enters sellable finished product stock
QC FAIL → product goes to quarantine (excluded from sellable stock)

## Calendar Output Rule

Calendar day status should represent:
- target oil (small, top-left)
- actual oil (bold center if recorded)
- attainment color: ≥95% green, 80-94% yellow, <80% red
- delivery dot (green = passed, red = failed)
- event marker (🏖 holiday, 🔧 maintenance)
- missing actual amber dot on past working days
- today: blue border
- day popover includes: plan vs actual, BC used, FC used, EXC produced, CCNO-T QC results, EXC QC results, deliveries

## Inventory — Stock Formula

All stock is derived (never stored):
- BC stock: Σ(passed BC deliveries: quantityKg − rejectedQtyKg) − Σ(BC used in production)
- FC stock: Σ(passed FC deliveries: quantityKg − rejectCoconutQty) − Σ(FC used in production)
- CCNO-T stock: Σ(oil produced where ccnoQCPassed) − Σ(CCNO-T dispatched)
- EXC stock: Σ(EXC produced where excQCPassed) − Σ(EXC dispatched)
- CCNO-T quarantine: Σ(oil produced where !ccnoQCPassed)
