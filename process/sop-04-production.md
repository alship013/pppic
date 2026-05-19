# SOP-04 — Production: Execute the Plan

**Stage:** 4 of 5 — PRODUCTION
**Role:** Operator
**Where:** [⚙ Production Done] button on main calendar view
**Feeds from:** Inventory (SOP-02) consumes raw materials, Planning (SOP-03) provides daily targets
**Feeds into:** Inventory (SOP-02) adds finished products, Reporting (SOP-05) compares plan vs actual
**Next:** → Reporting (SOP-05)

## Purpose

After a production shift, the operator records what was produced, what raw materials were consumed, and the quality of the finished product. The system validates against the recipe, checks finished product QC, updates inventory (raw materials DOWN, finished products UP), and marks the calendar.

## Flow

1. Production shift ends
2. Operator clicks **[⚙ Production Done]**
3. Modal opens with two sections: Production Output + Finished Product QC
4. Operator enters production actuals and QC results
5. System validates → saves
6. Inventory updates atomic: consume raw materials, add finished products
7. Calendar updates: day cell colored by attainment

---

## Section 1: Production Output

### Required Inputs

| Field | Description |
|-------|-------------|
| Date | Defaults to today (can change for past-day entry) |
| Oil produced | kg of CCNO-T output from this shift |
| White Copra used | kg consumed (drawn from BC inventory) |
| Fresh Coconut used | kg consumed (drawn from FC inventory) |

### Auto-Calculated (Shown in Modal)

| Derived Value | Formula |
|---------------|---------|
| Expected input total | oilProduced × 1.72 |
| Actual input total | BC used + FC used |
| Input match | ✓ if actual ≈ expected (±1 kg tolerance) |
| EXC produced | oilProduced × 0.38 (by-product, auto) |
| BC remaining after | current BC stock − BC used |
| FC remaining after | current FC stock − FC used |
| Target attainment | oilProduced ÷ dailyTarget × 100% |

### Validation

| Check | Rule | Action |
|-------|------|--------|
| Input match | BC used + FC used ≈ oil × 1.72 (±1 kg) | Warn or block (configurable) |
| Stock available | BC used ≤ BC stock, FC used ≤ FC stock | Warn if negative |
| Day type | Holiday or maintenance day | Block save entirely |

---

## Section 2: Finished Product QC — CCNO-T & EXC

After production, the finished product (CCNO-T crude coconut oil) AND the by-product (EXC expeller cake) must pass quality checks before being accepted into finished product inventory. These are the Mammoth Inventory Control standard criteria.

### CCNO-T (Crude Coconut Oil) — 6 QC Items

| # | Check | Type | Details |
|---|-------|------|---------|
| 1 | Colour | Select / Visual | Record oil colour (clear, light yellow, golden, amber, brown) |
| 2 | Smell | PASS/FAIL | Characteristic coconut oil smell, no rancid or off odours |
| 3 | M&I (Moisture & Impurities) | % or value | Moisture and insoluble impurities content |
| 4 | FFA (Free Fatty Acid) | % | FFA level — key quality indicator for crude oil |
| 5 | PV (Peroxide Value) | meq/kg | Peroxide value — indicates oxidation/rancidity |
| 6 | Aflatoxin | ppb or PASS/FAIL | Aflatoxin level — food safety critical |

### EXC (Expeller Cake) — QC Items

| # | Check | Type | Details |
|---|-------|------|---------|
| 1 | Moisture | % | Moisture content of the cake |
| 2 | Oil Content (Residual) | % | Residual oil left in cake |
| 3 | Appearance | PASS/FAIL | Consistent texture, no mold, no foreign matter |

### QC Result Per Product

- **PASS** — Product accepted into finished product inventory
- **FAIL** — Product flagged/quarantined, recorded but may be excluded from sellable stock (manager decision)

---

## Save Effects — What Happens Atomically

### Inventory Updates (all happen together):

| Action | Effect |
|--------|--------|
| Consume BC | BC stock = BC stock − BC used |
| Consume FC | FC stock = FC stock − FC used |
| Produce CCNO-T | CCNO-T stock = CCNO-T stock + oilProduced (if QC PASS) |
| Produce EXC | EXC stock = EXC stock + (oilProduced × 0.38) (if QC PASS) |

If CCNO-T QC FAIL: oilProduced recorded in production log but stock goes to a "quarantine" bucket (or excluded from available stock until manager review).

### Calendar Updates:

| Attainment | Color |
|------------|-------|
| ≥ 95% | Green — on or above target |
| 80–94% | Yellow — slightly below |
| < 80% | Red — significantly below |
| No actual yet (past working day) | Subtle amber dot |
| Today | Blue border |

### Data Stored:

- Daily actual entry: date, oilKg, bcUsedKg, fcUsedKg, excKg
- Finished product QC: ccno QC results (6 items), exc QC results (3 items)
- Stock movement log: 4+ entries (raw material OUT, finished product IN)

---

## Calendar — Operator's View

The operator sees the calendar as their main screen:

- **Each day cell** shows: target (small number) + actual (bold if recorded) + color tint
- **Today** has blue border
- **Past days with no production** show amber dot — "you missed this, tap to enter"
- **Delivery dots** show when raw materials arrived (green = passed QC, red = failed)
- **Holidays/maintenance** grayed out, can't record production

Clicking any day opens popover with full detail.

## Day Popover Detail

| Section | Content |
|---------|---------|
| Plan | Target oil, input requirement |
| Actual | Oil produced, BC used, FC used, EXC produced |
| QC | CCNO-T QC results, EXC QC results, pass/fail status |
| Deliveries | List of deliveries that day (material, qty, supplier, QC) |
| Events | Holiday or maintenance if set |
| Actions | Edit production, Mark holiday, Mark maintenance |

---

## Copra Production (White Copra QC)

If the facility produces its own white copra (copra drying/oven process), the white copra QC criteria apply at this stage too. The copra production log captures:

| # | Check | Type | Details |
|---|-------|------|---------|
| 1 | Batch ID | Text | Production batch identifier |
| 2 | Tonnage (Oven Input) | kg/Ton | Weight going into oven |
| 3 | Tonnage (Oven Output) | kg/Ton | Weight coming out |
| 4 | Moisture (Input) | % | Before drying |
| 5 | Moisture (Output) | % | After drying |
| 6 | FFA | % | Free fatty acid |
| 7 | Colour | Select | White / Yellow / Brown |
| 8 | Reduction Percentage | % | Weight loss from drying |
| 9 | Temperature | °C | Drying temperature |
| 10 | Fungus | PASS/FAIL | Free from contamination |
| 11 | Char/Smoke Residue | PASS/FAIL | No burn marks |
| 12 | Oil Content | % | Expected yield |
| 13 | Meat Thickness | Value | Against reference |
| 14 | Insect Damage | PASS/FAIL | Free from infestation |
| 15 | Storage After Hotroom | PASS/FAIL | Dry, under roof, off ground |
| 16 | Batch Photo | File | Visual record |

Copra batch that passes QC → added to BC inventory stock. Failed batch → recorded, excluded from stock.

---

## Requirements

- Production modal has two tabs/sections: Output + Finished Product QC
- QC checklist fully completed before save allowed
- Input validation with configurable warn/block
- Real-time auto-calculation of EXC and expected input as operator types
- Stock preview: "After save: BC 43.1t → 42.4t, CCNO-T 8.5t → 9.08t"
- Holiday/maintenance days blocked from production entry
- Past-day editing supported (click calendar day → popover → edit)
- All inventory stock buckets update atomically on save
- QC-failed finished product handled separately (quarantine or exclusion)
- Calendar color updates immediately
