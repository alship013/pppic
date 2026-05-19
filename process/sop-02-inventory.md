# SOP-02 — Inventory: Stock Recording & Visibility

**Stage:** 2 of 5 — INVENTORY
**Role:** Operator (view) / Manager (full access)
**Where:** Header badges (always visible) + Inventory tab in Manager panel
**Feeds from:** Arrival (SOP-01) adds raw materials, Production (SOP-04) adds finished products
**Feeds into:** Planning (SOP-03) checks stock, Production (SOP-04) consumes stock

## Purpose

Single source of truth for all stock. Tracks raw materials coming in (from arrival) and going out (to production), and finished products coming in (from production). Nothing skips inventory — every movement is recorded.

## What's Tracked

### Raw Materials (Input)
| Material | Source | Consumed By |
|----------|--------|-------------|
| White Copra (BC) | Arrival (QC passed only) | Production |
| Fresh Coconut (FC) | Arrival (QC passed only) | Production |

### Finished Products (Output)
| Product | Source | Destination |
|---------|--------|-------------|
| CCNO-T (oil) | Production | Dispatch / storage |
| EXC (by-product) | Production (derived: oil × 0.38) | Dispatch / storage |

## Header Badges (Always Visible)

Displayed at top of screen for both operator and manager:

```
BC: 45.0t  |  FC: 20.0t  |  CCNO-T: 8.5t  |  EXC: 3.2t
```

Updates in real-time after any arrival or production save.

## Inventory Tab (Manager Panel)

Inventory tab in manager panel shows full breakdown with four sections:

### Section 1: Raw Material Stock

| Material | In Stock | Reserved for Plan | Available |
|----------|----------|--------------------|-----------|
| White Copra | sum(passed deliveries) − sum(BC used) | remainingMonthlyTarget × 1.72 | In Stock − Reserved |
| Fresh Coconut | sum(passed deliveries) − sum(FC used) | user-defined allocation | In Stock − Reserved |

### Section 2: Finished Product Stock

| Product | In Stock | Produced MTD | Dispatched MTD |
|---------|----------|--------------|----------------|
| CCNO-T | sum(oil produced where QC PASS) − sum(dispatched) | MTD total | MTD total |
| EXC | sum(EXC produced where QC PASS) − sum(dispatched) | MTD total | MTD total |

### Section 3: Quarantine (QC-Failed Products)

| Product | In Quarantine |
|---------|---------------|
| CCNO-T | sum(oil produced where QC FAIL) |
| EXC | sum(EXC produced where QC FAIL) |

Quarantined products are recorded but excluded from sellable stock. Manager can review and decide whether to re-work or downgrade.

### Section 4: Stock Movement Log

Chronological list of every stock change:

| Date | Type | Material/Product | Qty | Direction | Running Balance |
|------|------|------------------|-----|-----------|-----------------|
| May 5 | Receive | White Copra | +45,000 | IN | 45,000 |
| May 5 | Receive | White Copra | +5,000 | IN (FAILED) | 45,000 |
| May 6 | Produce | BC used | −998 | OUT | 44,002 |
| May 6 | Produce | CCNO-T | +580 | IN | 580 |
| May 6 | Produce | EXC | +220 | IN | 220 |

Filterable by: material type, product type, date range, movement type (IN/OUT).

## Key Rules

- **Arrival adds raw materials** — only QC PASS
- **Production consumes raw materials** — deducts BC used + FC used
- **Production adds finished products** — adds CCNO-T + EXC to inventory
- **Dispatch removes finished products** — deducts from CCNO-T or EXC stock (Phase 1 optional)
- Stock cannot go negative without warning
- Every stock change has an audit trail in the movement log

## Requirements

- 4 stock badges always visible in header
- Inventory tab accessible from manager panel
- Stock movement log with full history
- Real-time calculation (derived from deliveries + production data)
- QC-failed deliveries never affect stock numbers
