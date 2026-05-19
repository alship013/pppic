# SOP-03 — Planning: Monthly → Weekly → Daily

**Stage:** 3 of 5 — PLANNING
**Role:** Manager
**Where:** Manager panel → Plan tab
**Feeds from:** Inventory (SOP-02) for stock sufficiency check
**Feeds into:** Production (SOP-04) as daily targets
**Calendar:** targets appear on each working day cell

## Purpose

Set the production plan for the month. Cascade from monthly oil target → weekly split → daily targets. At every level the system shows the input requirement (raw materials needed) and checks stock sufficiency from inventory.

## Step-by-Step Flow

### Step 3a: Monthly Target

Manager enters monthly oil output target (kg CCNO-T).

System auto-calculates and displays:

| Derived Value | Formula |
|---------------|---------|
| Working days | Calendar days − weekends − holidays − maintenance days |
| Daily rate (avg) | monthlyTarget ÷ workingDays |
| Input required | monthlyTarget × 1.72 (BC-equivalent total kg) |
| Stock check | BC available vs input required, FC available vs input required |
| Max capacity | Based on current inventory stock per material type |

**Example:**
```
Target: 12,000 kg oil
Working days: 18
Daily rate: 667 kg/day
Input needed: 20,640 kg (BC-equivalent)
BC stock: 45,000 kg ✓ (can cover up to 26,163 kg oil)
FC stock: 20,000 kg ✓ (can cover up to 11,628 kg oil)
→ Target feasible: YES
```

### Step 3b: Weekly Allocation

Manager allocates the monthly target across weeks using percentage sliders.

**Rules:**
- Total across all weeks must = 100% (auto-balanced)
- Weeks can be locked (e.g., week already completed)
- Presets available: Equal, Front-loaded, Back-loaded

For each week the system shows:

| Per Week | Value |
|----------|-------|
| Oil target | monthlyTarget × week% |
| Input need | weeklyOil × 1.72 |
| Stock sufficiency | Green (ample) / Yellow (tight) / Red (insufficient) |

Sliders update in real-time — changing one auto-balances unlocked weeks.

### Step 3c: Daily Grid

Each week's oil target is distributed across working days in that week.

**Grid view (Plan tab):**

```
         Mon 5   Tue 6   Wed 7   Thu 8   Fri 9   | Week Sum
Oil:     600     600     600     600     600      | 3,000 kg
Input:   1,032   1,032   1,032   1,032   1,032    | 5,160 kg
```

- Top row: daily oil target (kg)
- Bottom row: daily input requirement (kg) = oil × 1.72
- Week row sums both columns
- Holidays and maintenance days → target = 0, grayed out, excluded from sum
- Weekends → dimmed, excluded

### Calendar Sync

After planning is saved, the calendar updates:
- Each working day shows its oil target (small number, top-left of cell)
- Holidays = 🏖, target 0
- Maintenance = 🔧, target 0
- Weekends = dimmed
- Operator can see at a glance: "what do I produce today?"

## Requirements

- Monthly target entry with immediate derived calculations
- Stock sufficiency check using actual inventory data from SOP-02
- Weekly sliders with auto-balance (total always 100%)
- Week lock prevents editing completed weeks
- Daily grid auto-populated from weekly allocation
- Calendar reflects targets immediately after plan save
- Changing calendar events (holiday/maintenance) recalculates working days and daily targets
