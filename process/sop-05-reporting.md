# SOP-05 — Reporting: Review & Re-Allocate

**Stage:** 5 of 5 — REPORTING
**Role:** Manager
**Where:** Manager panel → Review tab
**Feeds from:** Planning (SOP-03) for targets, Production (SOP-04) for actuals, Inventory (SOP-02) for stock
**Feeds into:** Planning (SOP-03) via re-allocation

## Purpose

Close the loop. Compare what was planned against what actually happened, check if stock is sufficient to finish the month, and re-allocate remaining targets when behind or ahead of plan. This is the single report that covers the entire flow.

## Flow

1. Manager opens Review tab
2. Reviews 5 sections: output, input, stock outlook, by-product, QC summary
3. If off-track: re-allocate remaining weeks → plan updates → calendar syncs

---

## Section 1: Output Summary — Plan vs Actual

| Week | Plan Oil | Actual Oil | Variance | Attainment |
|------|----------|------------|----------|------------|
| W1 | 3,600 kg | 3,420 kg | −180 kg (−5%) | 95% ● |
| W2 | 3,000 kg | 2,850 kg | −150 kg (−5%) | 95% ● |
| W3 | 2,400 kg | — | — | — |
| W4 | 3,000 kg | — | — | — |
| **MTD** | **6,600 kg** | **6,270 kg** | **−330 kg (−5%)** | **95%** |

- Each completed week shows variance % with color indicator
- MTD row aggregates plan vs actual
- Visual: green = on track, yellow = slightly behind, red = significantly behind

---

## Section 2: Input Consumption — Raw Material Usage

| Week | Planned Input | Actual Input | BC Used | FC Used | BC/FC Split |
|------|---------------|--------------|---------|---------|-------------|
| W1 | 6,192 kg | 5,882 kg | 4,200 | 1,682 | 71%/29% |
| W2 | 5,160 kg | 4,902 kg | 3,500 | 1,402 | 71%/29% |
| **MTD** | **11,352 kg** | **10,784 kg** | **7,700** | **3,084** | **71%/29%** |

- Shows input efficiency: is the plant using more or less raw material than expected per kg of oil?
- BC/FC split shows material mix preference over time

---

## Section 3: Stock Forward Look — Can We Finish?

Per material type, system projects forward:

| Material | Current Stock | Remaining Plan Need | Surplus/Deficit | Status |
|----------|---------------|---------------------|-----------------|--------|
| White Copra | 35,500 kg | 9,288 kg (W3+W4) | +26,212 kg | ✓ Sufficient |
| Fresh Coconut | 5,600 kg | 5,000 kg (W3+W4) | +600 kg | ⚠ Tight |

| Product | Current Stock | Expected Production (remaining) | Projected |
|---------|---------------|--------------------------------|-----------|
| CCNO-T | 6,270 kg | 5,400 kg (W3+W4) | 11,670 kg |
| EXC | 2,383 kg | 2,052 kg (W3+W4) | 4,435 kg |

- Green ✓ = ample stock for remaining plan
- Yellow ⚠ = stock tight, may need more deliveries
- Red ✗ = insufficient — re-allocation or more deliveries needed

---

## Section 4: By-Product Summary

| Metric | Value |
|--------|-------|
| EXC produced MTD | 2,383 kg |
| EXC in stock | 3,200 kg |
| EXC expected (remaining plan) | 2,052 kg |
| EXC ratio (actual) | 0.38 × oil (on target) |

---

## Re-Allocation

When the manager needs to adjust because production is behind (or ahead):

### Trigger:
- Click "Re-allocate Remaining Weeks"

### Behavior:
1. Completed weeks are **locked** (past, cannot change)
2. Remaining oil target = monthly target − actuals produced so far
3. Manager adjusts percentages for remaining weeks (sliders)
4. System re-validates:
   - New daily targets for future weeks
   - Stock sufficiency against new plan
   - Daily input requirements recalculated

### On Save:
- Calendar updates with new daily targets for future weeks
- Plan tab reflects new allocation
- Inventory "reserved" amounts update

### Example:
```
Original plan: 12,000 kg
W1+W2 actuals: 6,270 kg
Remaining: 5,730 kg to allocate across W3+W4

Re-allocate: W3 = 55% (3,152 kg), W4 = 45% (2,578 kg)
→ Stock check: BC 35,500 kg vs 9,856 kg needed ✓
→ Calendar updated with new daily targets
```

---

## Requirements

- Single Review tab covering all 5 sections in one scroll
- All data derived from planning + production + inventory — no duplicate entry
- Stock forward look uses actual current inventory from SOP-02
- Re-allocation preserves completed weeks as locked
- Calendar syncs immediately after re-allocation save
- Input mix trend (BC vs FC share) shown over time
