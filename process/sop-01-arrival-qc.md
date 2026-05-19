# SOP-01 — Arrival: Receive & QC Raw Materials

**Stage:** 1 of 5 — ARRIVAL
**Role:** Operator / Warehouse
**Where:** [🚚 Truck Arrived] button on main calendar view
**Next:** → Inventory (SOP-02)

## Purpose

When a truck delivers fresh coconuts to the facility, the operator inspects quality and logs the delivery. Only QC-passed materials enter inventory. This is the gate — nothing enters the system without passing through here first.

## Flow

1. Truck arrives with fresh coconuts
2. Operator clicks **[🚚 Truck Arrived]**
3. Modal opens with delivery info and QC checklist
4. Operator completes all checks → QC result (PASS/FAIL)
5. PASS → material enters inventory. FAIL → recorded only, no stock increase.

## Required Delivery Inputs

| Field | Description |
|-------|-------------|
| Material type | White Copra or Fresh Coconut (dropdown) |
| Date | Defaults to today |
| Supplier name | Who delivered |
| Vehicle number | Truck plate/ID |
| Waybill ticket | Delivery document reference |
| Driver name | Person who delivered |
| Quantity (kg) | Total weight delivered |

## QC Checklist — Fresh Coconut

These are the quality checks from the Mammoth Inventory Control standard. All items must be completed before QC result can be set.

| # | Check | Type | Details |
|---|-------|------|---------|
| 1 | Moisture Level | PASS/FAIL | Within acceptable moisture range |
| 2 | Coconut Maturity Mix | Select | Young Coconut / Mengkal Coconut / Old Coconut — record percentage or predominant type |
| 3 | Impurities | PASS/FAIL | Free from dirt, fungus, foreign matter |
| 4 | Defect Coconut Quantity | kg or % | Count/weigh defective but still accepted coconuts (observation only, stays in stock) |
| 5 | Reject Coconut Quantity | kg or % | Coconuts rejected and NOT accepted into stock — deducted from inventory quantity |
| 6 | Truck Cleanliness | PASS/FAIL | Truck bed not wet, clear from dirt |
| 7 | Cover (in truck) | PASS/FAIL | Coconuts covered during transport |
| 8 | Handling Method | PASS/FAIL | No throwing when unloading |
| 9 | Storage Method | PASS/FAIL | Stored in dry place, under roof |
| 10 | Cover (in storage) | PASS/FAIL | Covered after unloading |
| 11 | Unloading Photo | File/Image | Photo evidence of unloading |
| 12 | Supplier Name | Text | (from delivery inputs above) |
| 13 | Vehicle Number | Text | (from delivery inputs above) |
| 14 | Waybill Ticket | Text | (from delivery inputs above) |

**QC Result:** Operator marks overall PASS or FAIL based on the checklist.
- Typical rule: if any critical item fails (#1, #3, #4), result = FAIL.
- If minor items fail (#6, #7), may still PASS with note.

## QC Criteria — White Copra

When receiving processed white copra (from copra production/drying), these checks apply:

| # | Check | Type | Details |
|---|-------|------|---------|
| 1 | Batch ID | Text | Production batch identifier |
| 2 | Tonnage (Oven Input) | kg/Ton | Weight going into oven/dryer |
| 3 | Tonnage (Oven Output) | kg/Ton | Weight coming out of oven/dryer |
| 4 | Moisture (Oven Input) | % | Before drying |
| 5 | Moisture (Oven Output) | % | After drying |
| 6 | FFA (Free Fatty Acid) | % or value | Quality indicator |
| 7 | Colour | Select | White / Yellow / Brown |
| 8 | Reduction Percentage | % | Weight loss from drying |
| 9 | Temperature | °C | Drying temperature |
| 10 | Fungus | PASS/FAIL | Free from fungal contamination |
| 11 | Char / Smoke Residue | PASS/FAIL | No burn marks or smoke residue |
| 12 | Oil Content | % | Expected oil yield |
| 13 | Meat Thickness | mm or rating | Compared against reference |
| 14 | Insect Damage | PASS/FAIL | Free from insect infestation |
| 15 | Storage Type After Hotroom | PASS/FAIL | Not wet, under roof, not on ground directly |
| 16 | Batch Photo | File/Image | Photo of the batch |
| 17 | Rejected Quantity & Reason | kg + text | If any portion rejected — deducted from inventory quantity |

## System Behavior on Save

| QC Result | Inventory | Delivery Log | Calendar |
|-----------|-----------|--------------|----------|
| **PASS** | `quantityKg − rejectQty` added to that material's stock bucket | Recorded with full QC detail + photo | Green delivery dot on that date |
| **FAIL** | **Not added** — rejected, no stock increase | Recorded with fail reason + which checks failed | Red delivery dot on that date |

**Stock formula:** `inventory_add = quantityKg − rejectQty` (for PASS only). Defect qty stays in stock, recorded for observation.

## What Calendar Shows

- Day with delivery: colored dot (green = passed, red = failed)
- Day popover: lists each delivery with material type, quantity, supplier, QC result, and failed check details
- Stock badges update immediately: `BC: Xt | FC: Xt`

## Notes on Material Types

- **Fresh Coconut** is the raw incoming material — delivered by truck, QC'd on arrival.
- **White Copra** can be received externally OR produced internally (copra drying process). If received externally, it goes through the same Arrival flow with the white copra QC criteria. If produced internally, the QC happens at the copra production stage (see SOP-04).

## Requirements

- QC checklist fully completed before save allowed — all applicable items based on material type
- Only PASS deliveries affect inventory stock
- Failed deliveries preserved with reason and failed check details for audit
- Multiple deliveries per day supported
- Photo upload supported for unloading and batch photos
- Calendar reflects deliveries immediately
