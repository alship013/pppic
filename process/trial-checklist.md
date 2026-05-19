# Trial Checklist — Phase 1

**Scope:** CCO line, 1 product (CCNO-T), 1 by-product (EXC), 2 raw materials, 1 month  
**Design:** Calendar-first. Two operator buttons. Manager panel behind ⚙.
**Flow:** Arrival(QC) → Inventory → Planning → Production → Reporting

---

## Pre-Trial Setup

- [ ] Recipe hardcoded: input ratio 1.72, EXC ratio 0.38
- [ ] Calendar loads as default view. Header shows 4 stock badges: BC, FC, CCNO-T, EXC
- [ ] Two operator buttons visible at bottom: [🚚 Truck Arrived] [⚙ Production Done]
- [ ] All stock starts at 0

---

## Run Through

### 1. ARRIVAL — Log Fresh Coconut Delivery with Full QC

- [ ] Click `[🚚 Truck Arrived]`
- [ ] Modal opens. Select **Fresh Coconut**. Enter 25,000 kg.
- [ ] Fill delivery info: Supplier = "ABC Supplier", Vehicle = "B 1234 XY", Waybill = "WB-001", Driver = "John"
- [ ] QC checklist (based on Mammoth Inventory Control):
  - Moisture level → PASS
  - Coconut maturity → "Mixed" (young + old)
  - Impurities (dirt, fungus) → PASS
  - Defect coconut qty → 50 kg
  - Reject coconut qty → 10 kg
  - Truck cleanliness → PASS
  - Cover in truck → PASS
  - Handling method (no throwing) → PASS
  - Storage method (dry, under roof) → PASS
  - Cover in storage → PASS
  - Unloading photo → [attach]
- [ ] QC: **PASS**. Save.
- [ ] Verify: header shows "FC: 24.99t" (25,000 − 10 kg reject = 24,990 kg; defect coconuts stay in stock, only rejects excluded)
- [ ] Verify: today's calendar cell has a green delivery dot
- [ ] Time: _____ seconds

### 2. ARRIVAL — Log White Copra Delivery with Full QC

- [ ] Click `[🚚 Truck Arrived]`
- [ ] Select **White Copra**. Enter 45,000 kg.
- [ ] Fill delivery info: Supplier = "XYZ Copra Mill", Vehicle = "B 5678 AB", Waybill = "WB-002", Driver = "Mike"
- [ ] QC checklist (White Copra):
  - Batch ID = "BC-2026-0512"
  - Tonnage oven input = 50,000 kg
  - Tonnage oven output = 45,000 kg
  - Moisture input = 45%
  - Moisture output = 6%
  - FFA = 0.8%
  - Colour = "White"
  - Reduction % = 10%
  - Temperature = 80°C
  - Fungus → PASS
  - Char/smoke residue → PASS
  - Oil content = 62%
  - Meat thickness = "Standard"
  - Insect damage → PASS
  - Storage after hotroom → PASS (dry, under roof, off ground)
  - Batch photo → [attach]
  - Rejected qty = 0, reason = "—"
- [ ] QC: **PASS**. Save.
- [ ] Verify: header shows "BC: 45t"
- [ ] Log another White Copra, 5,000 kg, QC: **FAIL** (fungus = FAIL)
- [ ] Verify: stock stays "BC: 45t" (failed excluded)
- [ ] Verify: today's cell has a red delivery dot for the failed delivery
- [ ] Time: _____ seconds

### 3. CALENDAR — Mark Events

- [ ] Click May 1 on the calendar → popover appears
- [ ] Click "Mark Holiday" → enter "Labour Day"
- [ ] Verify: May 1 cell turns gray, shows 🏖, target = 0
- [ ] Click May 20 → popover → "Mark Maintenance" → enter "CCO Press"
- [ ] Verify: May 20 cell turns amber, shows 🔧, target = 0
- [ ] Time: _____ seconds

### 4. PLANNING — Set Monthly Target

- [ ] Click ⚙ → Manager panel opens with **Plan** tab active
- [ ] Enter monthly target: **12,000 kg** CCNO-T
- [ ] Verify system shows:
  - Working days = 18 (20 weekdays − 1 holiday − 1 maintenance)
  - Daily rate = 667 kg/day
  - Input required = 20,640 kg BC-equivalent (12,000 × 1.72)
  - Stock check: BC 45t ✓ sufficient, FC 20t ✓ sufficient
- [ ] Time: _____ seconds

### 5. PLANNING — Weekly Allocation

- [ ] Try **Front-loaded** preset → verify sliders shift → revert to **Equal**
- [ ] Adjust Week 1 to 30% → verify others auto-balance, total = 100%
- [ ] Lock Week 2 → adjust Week 3 → Week 2 stays fixed
- [ ] Verify each week shows: oil target + input need + stock sufficiency indicator
- [ ] Time: _____ seconds

### 6. PLANNING — Daily Grid

- [ ] Verify daily grid shows per working day:
  - Oil target (kg)
  - Input requirement (kg) = oil × 1.72
- [ ] Each week row sums both columns
- [ ] Close manager panel → calendar now shows targets on each working day
- [ ] May 1 (holiday) = gray, no target; May 20 (maintenance) = amber, no target
- [ ] Weekends dimmed
- [ ] Time: _____ seconds

### 7. PRODUCTION — Record Daily Output with Finished Product QC

- [ ] Click `[⚙ Production Done]`
- [ ] Modal opens with two sections. Today's target shown: 667 kg.

**Section A — Output:**
- [ ] Enter oil produced: **580 kg**
- [ ] Enter White Copra used: **700 kg**
- [ ] Enter Fresh Coconut used: **298 kg**
- [ ] Verify: expected input = 998 kg (580 × 1.72), actual = 998 kg → ✓ match
- [ ] Verify: EXC produced = 220 kg (580 × 0.38)
- [ ] Verify: remaining BC shown, remaining FC shown

**Section B — Finished Product QC (CCNO-T, 6 items):**
- [ ] Colour = "Light Yellow"
- [ ] Smell = PASS (no rancid odour)
- [ ] M&I = 0.15%
- [ ] FFA = 0.8%
- [ ] PV = 2.5 meq/kg
- [ ] Aflatoxin = PASS
- [ ] CCNO-T QC: **PASS**

**EXC QC (3 items):**
- [ ] Moisture = 8%
- [ ] Residual Oil Content = 5%
- [ ] Appearance = PASS
- [ ] EXC QC: **PASS**

- [ ] Save.
- [ ] Verify inventory updates:
  - BC: 45,000 → 44,300 (-700)
  - FC: 24,990 → 24,692 (-298)
  - CCNO-T: 0 → 580 (+580, QC passed)
  - EXC: 0 → 220 (+220, QC passed)
- [ ] Verify header badges reflect new stock
- [ ] Verify: day cell shows actual with yellow tint (580/667 = 87%)
- [ ] Time: _____ seconds

### 8. PRODUCTION — QC-Failed Product Goes to Quarantine

- [ ] Click `[⚙ Production Done]`, change date to May 6
- [ ] Enter oil: **420 kg**, BC used: **500 kg**, FC used: **222 kg**
- [ ] CCNO-T QC: FFA = 3.5% → **FAIL** (FFA too high)
- [ ] EXC QC: all PASS
- [ ] Save.
- [ ] Verify: day cell shows red tint (420/667 = 63%)
- [ ] Verify inventory:
  - CCNO-T: stays at 580 (failed batch NOT added to sellable stock, goes to quarantine)
  - Quarantine CCNO-T: 420 kg
  - EXC: 220 → 379.6 (EXC still added since QC passed)
- [ ] Time: _____ seconds

### 9. PRODUCTION — Input Mismatch Warning

- [ ] Click `[⚙ Production Done]`, change date to May 7
- [ ] Enter oil: **500 kg**, BC used: **400 kg**, FC used: **300 kg**
- [ ] Verify: expected 860 kg, actual 700 kg → ⚠ mismatch warning
- [ ] Toggle validation mode in settings: "warn" → "block"
- [ ] Try save → blocked with message explaining mismatch
- [ ] Toggle back to "warn", save → allowed with warning recorded
- [ ] Time: _____ seconds

### 10. INVENTORY — Stock Movement Log

- [ ] Open manager panel → **Inventory** tab
- [ ] Verify raw materials section:
  - BC: 43,400 kg (45,000 − 700 − 500 − 400)
  - FC: 24,170 kg (24,990 − 298 − 222 − 300)
- [ ] Verify finished products section:
  - CCNO-T: 1,080 kg (580 + 500; run 2 QC-failed → quarantine, 420 kg not in sellable)
  - EXC: 569.6 kg (220 + 159.6 + 190)
- [ ] Verify quarantine: CCNO-T 420 kg
- [ ] Verify stock movement log lists every transaction:
  - 3 deliveries (2 pass, 1 fail)
  - 3 production runs (with consumption and production)
- [ ] Time: _____ seconds

### 11. REPORTING — Review Plan vs Actual

- [ ] Switch to **Review** tab
- [ ] Verify: Week 1 shows summed daily actuals vs plan, variance %
- [ ] Verify: MTD oil progress shown
- [ ] Verify: input consumption table — planned vs actual, BC vs FC share
- [ ] Verify: stock forward-look per material type:
  - "BC: 43,400 kg → enough for X kg oil remaining this month"
  - "FC: 24,170 kg → enough for Y kg oil remaining this month"
- [ ] Verify: EXC cumulative output shown
- [ ] Time: _____ seconds

### 12. REPORTING — Re-Allocation

- [ ] In Review tab, click "Re-allocate remaining weeks"
- [ ] Verify: past weeks locked, future weeks editable
- [ ] Adjust Week 3 up → Week 4 auto-balances → total = 100%
- [ ] Verify: stock sufficiency re-validates against new plan
- [ ] Close manager panel
- [ ] Verify: calendar updated with new daily targets for future weeks
- [ ] Time: _____ seconds

### 13. CALENDAR — Day Popover Detail

- [ ] Click a day with production recorded
- [ ] Popover shows:
  - Target oil + input requirement
  - Actual oil + BC used + FC used + EXC produced
  - CCNO-T QC: colour, smell, M&I, FFA, PV, aflatoxin, pass/fail
  - EXC QC: moisture, residual oil, appearance, pass/fail
  - Deliveries received (material, qty, supplier, QC result with failed items)
  - Events (holiday/maintenance)
- [ ] Click a past working day with no actuals → amber missing dot visible
- [ ] Today's cell has blue border
- [ ] Time: _____ seconds

### 14. DATA PERSISTENCE

- [ ] Refresh page
- [ ] Verify: all deliveries, actuals, plan, holidays, inventory survive
- [ ] Verify: all 4 stock badges correct
- [ ] Verify: day cell dots and colors correct
- [ ] Verify: inventory movement log intact
- [ ] Time: _____ seconds

---

## Success Criteria

| Criterion | Target | Actual |
|-----------|--------|--------|
| Log Fresh Coconut delivery with QC in < 90 seconds | Yes/No | |
| Log White Copra delivery with QC in < 90 seconds | Yes/No | |
| Record production + finished product QC in < 60 seconds | Yes/No | |
| Mark holiday/maintenance in < 15 seconds | Yes/No | |
| Set monthly plan in < 2 minutes | Yes/No | |
| Calendar reflects plan changes immediately | Yes/No | |
| Slider auto-balance = 100% | System-enforced | ✓/✗ |
| Input validation = oil × 1.72 (±1 kg) | System-enforced | ✓/✗ |
| By-product calc = oil × 0.38 | Exact | ✓/✗ |
| QC-passed only enters raw material inventory | Yes/No | |
| QC-passed CCNO-T only enters sellable finished product stock | Yes/No | |
| QC-failed CCNO-T goes to quarantine | Yes/No | |
| Production consumes raw materials from inventory | Yes/No | |
| Production adds finished products to inventory | Yes/No | |
| 4 stock badges always visible (BC, FC, CCNO-T, EXC) | Yes/No | |
| Inventory tab shows full stock + movement log | Yes/No | |
| Review tab shows plan vs actual + stock outlook + QC pass rates | Yes/No | |
| Missing actuals dot visible on past days | Yes/No | |
| Re-allocation works correctly | Yes/No | |
| Data survives page refresh | localStorage | ✓/✗ |

---

## Issues Found

| # | Description | Severity | Resolution |
|---|-------------|----------|------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## Sign-Off

```
Trial completed: _______________
User: _______________________
Date: _______________________
```

