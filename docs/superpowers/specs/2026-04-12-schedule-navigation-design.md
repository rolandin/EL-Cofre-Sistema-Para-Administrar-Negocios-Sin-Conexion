# Schedule Navigation + Appointment Date Picker Design

**Date:** 2026-04-12
**Status:** Approved

---

## Overview

Improve the Schedule page navigation so users can easily switch between days, and add a date picker to the New Appointment modal so users can create appointments for any date without first navigating to that day.

## Current State

- Single-day 24-hour timeline view with contractor columns
- Date selection via a dropdown calendar — requires clicking dropdown, picking a date
- No prev/next day buttons
- New Appointment modal inherits the date from the currently viewed day — can't create appointments for other dates without switching views first

## Changes

### 1. Navigation Bar

Replace the current date dropdown with a navigation bar at the top of the Schedule page:

```
[<]  [Today]  [>]    Saturday, April 12, 2026    [calendar icon]
```

- **`<` button** — go to previous day
- **`>` button** — go to next day
- **`Today` button** — jump back to today's date
- **Date display** — shows the currently viewed date in long format
- **Calendar icon** — opens a mini calendar dropdown to jump to any date (same calendar component as current, repositioned)

### 2. Appointment Modal Date Picker

Add a date field to the New Appointment form:

```
Title:      [________________]
Date:       [April 15, 2026   calendar-icon]   ← NEW
Start:      [10:00 AM        ]
Duration:   [60 min          ]
Service:    [dropdown         ]
Contractor: [dropdown         ]
Notes:      [________________]
```

- Date field uses a popover calendar picker (same Calendar component)
- Defaults to the currently viewed day when opening the modal
- User can change it to any date
- After saving, the view stays on the current day (does not jump to the appointment's date)

### 3. Edit Modal

When editing an existing appointment, the date picker shows the appointment's date and allows changing it (effectively rescheduling to a different day).

## What Stays the Same

- 24-hour timeline layout with contractor columns
- Appointment card rendering (colors, positioning, click to edit)
- Overlap detection on create
- Current time indicator (red line on today)
- "Now" button to scroll to current time
- All API endpoints unchanged — the backend already supports any date range

## Files to Modify

- `src/pages/Schedule.tsx` — navigation bar, date picker in modal, remove old dropdown

## Backend Changes

None. The existing `GET /api/appointments?start=...&end=...` and `POST /api/appointments` endpoints handle arbitrary dates already.
